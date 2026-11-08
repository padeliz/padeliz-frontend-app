/**
 * Level assessment wizard (Sports → Details → Photo → Status).
 *
 * Dirty step changes auto-save in the background (abortable per step). Top stepper
 * shows spinners / failure X. Header back, Finish it later, and OS back share one leave policy.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as Colors from '@/constants/Colors';
import Button from '@/components/Buttons/Button';
import ScreenHeader from '@/components/Navigation/ScreenHeader';
import Steps from '@/components/Visuals/Steps';
import StatusBanner from '@/components/Feedback/StatusBanner';
import StepNavButtons from '@/components/LevelAssessment/StepNavButtons';
import StepRacketExperience from '@/components/LevelAssessment/StepRacketExperience';
import StepAboutYou from '@/components/LevelAssessment/StepAboutYou';
import StepProfileImages from '@/components/LevelAssessment/StepProfileImages';
import AssessmentStatusView, {
  leaveLabelForAssessment,
} from '@/components/LevelAssessment/AssessmentStatusView';
import WizardLeaveFooter, {
  WIZARD_LEAVE_FOOTER_SCROLL_EXTRA,
} from '@/components/Navigation/WizardLeaveFooter';
import {
  useCreatePendingAssessmentMutation,
  useDeleteAssessmentImageMutation,
  useDiscardAssessmentMutation,
  useLoadAssessmentMutation,
  useMarkAssessmentReadyMutation,
  useReopenAssessmentMutation,
  useSaveAssessmentMutation,
  useUploadAssessmentImageMutation,
} from '@/services/hooks/useLevelAssessment';
import {
  buildCustomFields,
  dirtyFieldKeys,
  fieldCodesForStep,
  formReducer,
  hydrateFromAssessment,
  initialFormState,
  initialStepForAssessment,
  isDraftEditable,
  mergeBaselineForStep,
  racketErrors,
  stepHasData,
  stepIsDirty,
  yearOfBirthError,
  type AssessmentFormState,
} from '@/services/levelAssessmentForm';
import { confirmAsync, confirmDirtyLeaveAsync } from '@/services/confirm';
import { ApiError } from '@/services/apiError';
import { useAuth } from '@/context/auth';
import { eventDetailPath } from '@/utils/eventPaths';
import type { PlayerLevelAssessment } from '@/types/api';

const STEP_LABELS = ['Sports', 'Details', 'Photo', 'Status'];

const STEP_NAV: Record<number, { back?: string; forward?: string }> = {
  1: { forward: 'Your Details' },
  2: { back: 'Racket Sports', forward: 'Photo' },
  3: { back: 'Your Details', forward: 'Status' },
};

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.firstValidationMessage ?? e.message;
  return 'Something went wrong. Please try again.';
}

function isAbortError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const name = (e as { name?: string }).name;
  return name === 'AbortError';
}

function cloneForm(state: AssessmentFormState): AssessmentFormState {
  return {
    ...state,
    selectedSports: [...state.selectedSports],
    racket: Object.fromEntries(
      Object.entries(state.racket).map(([k, v]) => [k, { ...v }])
    ),
  };
}

function formFromAssessment(assessment: PlayerLevelAssessment): AssessmentFormState {
  return { ...initialFormState, ...hydrateFromAssessment(assessment) };
}

function addToSet(prev: number[], step: number): number[] {
  return prev.includes(step) ? prev : [...prev, step];
}

function removeFromSet(prev: number[], step: number): number[] {
  return prev.filter((s) => s !== step);
}

export default function LevelAssessmentScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState<PlayerLevelAssessment | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [baseline, setBaseline] = useState<AssessmentFormState>(initialFormState);
  const [currentStep, setCurrentStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [loadBanner, setLoadBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<number[]>([]);
  const [errorSteps, setErrorSteps] = useState<number[]>([]);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});

  const stateRef = useRef(state);
  stateRef.current = state;
  const baselineRef = useRef(baseline);
  baselineRef.current = baseline;
  const loadingStepsRef = useRef(loadingSteps);
  loadingStepsRef.current = loadingSteps;
  const skipBeforeRemoveRef = useRef(false);
  const controllersRef = useRef<Record<number, AbortController | undefined>>({});
  const generationsRef = useRef<Record<number, number>>({});
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMutation = useLoadAssessmentMutation();
  const createMutation = useCreatePendingAssessmentMutation();
  const saveMutation = useSaveAssessmentMutation();
  const readyMutation = useMarkAssessmentReadyMutation();
  const reopenMutation = useReopenAssessmentMutation();
  const uploadMutation = useUploadAssessmentImageMutation();
  const deleteMutation = useDeleteAssessmentImageMutation();
  const discardMutation = useDiscardAssessmentMutation();

  const adopt = useCallback((next: PlayerLevelAssessment, step?: number) => {
    const form = formFromAssessment(next);
    setAssessment(next);
    dispatch({ type: 'HYDRATE', payload: form });
    setBaseline(cloneForm(form));
    setCurrentStep(step ?? initialStepForAssessment(next));
    setShowErrors(false);
    setLoadBanner(null);
    setErrorSteps([]);
    setStepErrors({});
    setLoadingSteps([]);
  }, []);

  const openedRef = useRef(false);
  const open = useCallback(async () => {
    setLoadError(null);
    try {
      adopt(await loadMutation.mutateAsync());
    } catch (e) {
      setLoadError(errorMessage(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adopt]);

  useEffect(() => {
    if (!user || openedRef.current) return;
    openedRef.current = true;
    void open();
  }, [user, open]);

  const leaveWizard = useCallback(
    (action?: { type: string }) => {
      skipBeforeRemoveRef.current = true;
      if (action) {
        navigation.dispatch(action as never);
        return;
      }
      if (navigation.canGoBack()) {
        router.back();
        return;
      }
      if (eventId) router.replace(eventDetailPath(Number(eventId)) as any);
      else router.replace('/(tabs)/account' as any);
    },
    [navigation, router, eventId]
  );

  const editable = assessment ? isDraftEditable(assessment) : false;
  const dirtyKeys = useMemo(() => dirtyFieldKeys(state, baseline), [state, baseline]);
  const stepperBusy = loadingSteps.length > 0;

  const racketProblems = useMemo(() => racketErrors(state), [state]);
  const yobProblem = yearOfBirthError(state.yearOfBirth);

  const stepIsValid = useCallback(
    (step: number, form: AssessmentFormState = stateRef.current): boolean => {
      if (step === 1) return Object.keys(racketErrors(form)).length === 0;
      if (step === 2) return yearOfBirthError(form.yearOfBirth) === null;
      return true;
    },
    []
  );

  const beginStepOp = (step: number): { signal: AbortSignal; generation: number } => {
    controllersRef.current[step]?.abort();
    const controller = new AbortController();
    controllersRef.current[step] = controller;
    const generation = (generationsRef.current[step] ?? 0) + 1;
    generationsRef.current[step] = generation;
    setLoadingSteps((prev) => addToSet(prev, step));
    setErrorSteps((prev) => removeFromSet(prev, step));
    setStepErrors((prev) => {
      if (!(step in prev)) return prev;
      const next = { ...prev };
      delete next[step];
      return next;
    });
    return { signal: controller.signal, generation };
  };

  const isCurrentGeneration = (step: number, generation: number) =>
    generationsRef.current[step] === generation;

  const finishStepOpSuccess = (
    step: number,
    generation: number,
    nextAssessment: PlayerLevelAssessment,
    snapshot: AssessmentFormState
  ) => {
    if (!mountedRef.current || !isCurrentGeneration(step, generation)) return;
    setAssessment(nextAssessment);
    setBaseline((prev) => mergeBaselineForStep(prev, snapshot, step));
    setLoadingSteps((prev) => removeFromSet(prev, step));
    setErrorSteps((prev) => removeFromSet(prev, step));
    setStepErrors((prev) => {
      if (!(step in prev)) return prev;
      const next = { ...prev };
      delete next[step];
      return next;
    });
  };

  const finishStepOpFailure = (step: number, generation: number, message: string) => {
    if (!mountedRef.current || !isCurrentGeneration(step, generation)) return;
    setLoadingSteps((prev) => removeFromSet(prev, step));
    setErrorSteps((prev) => addToSet(prev, step));
    setStepErrors((prev) => ({ ...prev, [step]: message }));
  };

  const finishStepOpAbort = (step: number, generation: number) => {
    if (!mountedRef.current || !isCurrentGeneration(step, generation)) return;
    // Superseding op owns the spinner; do nothing.
  };

  const saveStepBackground = (step: number, snapshot: AssessmentFormState) => {
    if (!editable) return;
    const codes = fieldCodesForStep(step);
    const fields = buildCustomFields(snapshot, codes);
    if (Object.keys(fields).length === 0) {
      setBaseline((prev) => mergeBaselineForStep(prev, snapshot, step));
      return;
    }

    const { signal, generation } = beginStepOp(step);
    void (async () => {
      try {
        const next = await saveMutation.mutateAsync({ customFields: fields, signal });
        finishStepOpSuccess(step, generation, next, snapshot);
      } catch (e) {
        if (isAbortError(e) || signal.aborted) {
          finishStepOpAbort(step, generation);
          return;
        }
        finishStepOpFailure(step, generation, errorMessage(e));
      }
    })();
  };

  const saveStepAwait = async (step: number, snapshot: AssessmentFormState): Promise<boolean> => {
    if (!editable) return true;
    const codes = fieldCodesForStep(step);
    const fields = buildCustomFields(snapshot, codes);
    if (Object.keys(fields).length === 0) {
      setBaseline((prev) => mergeBaselineForStep(prev, snapshot, step));
      return true;
    }

    const { signal, generation } = beginStepOp(step);
    try {
      const next = await saveMutation.mutateAsync({ customFields: fields, signal });
      finishStepOpSuccess(step, generation, next, snapshot);
      return true;
    } catch (e) {
      if (isAbortError(e) || signal.aborted) {
        finishStepOpAbort(step, generation);
        return false;
      }
      finishStepOpFailure(step, generation, errorMessage(e));
      return false;
    }
  };

  const waitUntilIdle = async () => {
    while (loadingStepsRef.current.length > 0) {
      await new Promise((r) => setTimeout(r, 40));
    }
  };

  const goToStep = (target: number) => {
    if (target === currentStep) return;
    if (!editable) {
      setCurrentStep(target);
      return;
    }

    const leaving = currentStep;
    const dirty = stepIsDirty(leaving, dirtyFieldKeys(stateRef.current, baselineRef.current));
    if (!dirty) {
      setShowErrors(false);
      setCurrentStep(target);
      return;
    }

    if (!stepIsValid(leaving)) {
      setShowErrors(true);
      return;
    }

    const snapshot = cloneForm(stateRef.current);
    saveStepBackground(leaving, snapshot);
    setShowErrors(false);
    setCurrentStep(target);
  };

  const handleForward = () => {
    if (!editable || currentStep >= 4) return;
    goToStep(currentStep + 1);
  };

  const handleStepBack = () => {
    if (!editable || currentStep <= 1) return;
    goToStep(currentStep - 1);
  };

  const flushAllDirtySteps = async (): Promise<boolean> => {
    await waitUntilIdle();
    for (let step = 1; step <= 3; step += 1) {
      const form = stateRef.current;
      const dirty = stepIsDirty(step, dirtyFieldKeys(form, baselineRef.current));
      if (!dirty) continue;
      if (!stepIsValid(step, form)) {
        setCurrentStep(step);
        setShowErrors(true);
        return false;
      }
      const ok = await saveStepAwait(step, cloneForm(form));
      if (!ok) {
        setCurrentStep(step);
        return false;
      }
    }
    return true;
  };

  const requestLeave = async (action?: { type: string }) => {
    const busy = loadingStepsRef.current.length > 0;
    const dirty = dirtyFieldKeys(stateRef.current, baselineRef.current);
    if (!busy && dirty.size === 0) {
      leaveWizard(action);
      return;
    }

    const pendingOnly = busy && dirty.size === 0;
    const choice = await confirmDirtyLeaveAsync(
      pendingOnly ? 'Saves in progress' : 'Unsaved changes',
      pendingOnly
        ? 'Some steps are still saving. You can leave without waiting, wait and save, or stay.'
        : 'You have unsaved changes on this step.'
    );
    if (choice === 'stay') return;
    if (choice === 'discard') {
      leaveWizard(action);
      return;
    }

    const ok = await flushAllDirtySteps();
    if (!ok) return;
    leaveWizard(action);
  };

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (skipBeforeRemoveRef.current) return;
      const busy = loadingStepsRef.current.length > 0;
      const dirty = dirtyFieldKeys(stateRef.current, baselineRef.current);
      if (!busy && dirty.size === 0) return;
      e.preventDefault();
      void requestLeave(e.data.action);
    });
    return unsub;
    // requestLeave closes over latest helpers via refs for busy/dirty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const handleSubmitForReview = async () => {
    if (!editable || submitting || stepperBusy) return;
    const confirmed = await confirmAsync(
      'Submit for review?',
      'Once submitted, the assessment is locked while our team reviews it.'
    );
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const form = stateRef.current;
      if (stepIsDirty(currentStep, dirtyFieldKeys(form, baselineRef.current))) {
        if (!stepIsValid(currentStep, form)) {
          setShowErrors(true);
          return;
        }
        const ok = await saveStepAwait(currentStep, cloneForm(form));
        if (!ok) return;
      }
      const ready = await readyMutation.mutateAsync();
      adopt(ready, 4);
    } catch (e) {
      if (currentStep >= 1 && currentStep <= 3) {
        setStepErrors((prev) => ({ ...prev, [currentStep]: errorMessage(e) }));
        setErrorSteps((prev) => addToSet(prev, currentStep));
      } else {
        setLoadBanner(errorMessage(e));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReopen = async () => {
    const confirmed = await confirmAsync(
      'Reopen to edit?',
      'You can change your answers and submit again later.'
    );
    if (!confirmed) return;

    try {
      adopt(await reopenMutation.mutateAsync(), 1);
    } catch (e) {
      setLoadBanner(errorMessage(e));
    }
  };

  const handleCreateNew = async () => {
    try {
      adopt(await createMutation.mutateAsync(), 1);
    } catch (e) {
      setLoadBanner(errorMessage(e));
    }
  };

  const handleDiscard = async () => {
    if (!editable || submitting || discardMutation.isPending || stepperBusy) return;
    const confirmed = await confirmAsync(
      'Discard assessment?',
      'This discards your draft and deletes photos uploaded for this assessment.'
    );
    if (!confirmed) return;

    try {
      await discardMutation.mutateAsync();
      leaveWizard();
    } catch (e) {
      setLoadBanner(errorMessage(e));
    }
  };

  const handleAddImage = (uri: string) => {
    const { signal, generation } = beginStepOp(3);
    void (async () => {
      try {
        const next = await uploadMutation.mutateAsync({ uri, signal });
        if (!mountedRef.current || !isCurrentGeneration(3, generation)) return;
        setAssessment(next);
        setLoadingSteps((prev) => removeFromSet(prev, 3));
        setErrorSteps((prev) => removeFromSet(prev, 3));
        setStepErrors((prev) => {
          if (!(3 in prev)) return prev;
          const n = { ...prev };
          delete n[3];
          return n;
        });
      } catch (e) {
        if (isAbortError(e) || signal.aborted) return;
        finishStepOpFailure(3, generation, errorMessage(e));
      }
    })();
  };

  const handleRemoveImage = (id: number) => {
    const { signal, generation } = beginStepOp(3);
    void (async () => {
      try {
        const next = await deleteMutation.mutateAsync({ id, signal });
        if (!mountedRef.current || !isCurrentGeneration(3, generation)) return;
        setAssessment(next);
        setLoadingSteps((prev) => removeFromSet(prev, 3));
        setErrorSteps((prev) => removeFromSet(prev, 3));
        setStepErrors((prev) => {
          if (!(3 in prev)) return prev;
          const n = { ...prev };
          delete n[3];
          return n;
        });
      } catch (e) {
        if (isAbortError(e) || signal.aborted) return;
        finishStepOpFailure(3, generation, errorMessage(e));
      }
    })();
  };

  const nav = STEP_NAV[currentStep];
  const uploading = uploadMutation.isPending;
  const imageBusy = uploading || deleteMutation.isPending;
  const completedSteps = useMemo(() => {
    const steps: number[] = [];
    for (let step = 1; step <= 3; step += 1) {
      if (stepHasData(step, state, assessment)) steps.push(step);
    }
    return steps;
  }, [state, assessment]);

  const activeStepError =
    currentStep >= 1 && currentStep <= 3 ? stepErrors[currentStep] ?? null : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Level Assessment"
        variant="stack"
        onBack={() => void requestLeave()}
      />

      {!assessment && !loadError ? (
        <View style={styles.centered} testID="assessment-loading">
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : null}

      {loadError ? (
        <View style={styles.centered} testID="assessment-load-error">
          <StatusBanner variant="error" message={loadError} />
          <Button
            label="Try again"
            onPress={() => void open()}
            loading={loadMutation.isPending}
            style={styles.retry}
            testID="assessment-retry"
          />
        </View>
      ) : null}

      {assessment ? (
        <>
          <View style={styles.stepper}>
            <Steps
              labels={STEP_LABELS}
              currentStep={currentStep}
              enabledSteps={[1, 2, 3, 4]}
              onStepPress={(step) => goToStep(step)}
              loadingSteps={loadingSteps}
              errorSteps={errorSteps}
              completedSteps={completedSteps}
            />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              currentStep === 4
                ? { paddingBottom: 16 + WIZARD_LEAVE_FOOTER_SCROLL_EXTRA }
                : null,
            ]}
            testID="assessment-wizard"
          >
            {loadBanner ? (
              <StatusBanner variant="error" message={loadBanner} style={styles.banner} />
            ) : null}

            {activeStepError ? (
              <StatusBanner
                variant="error"
                message={activeStepError}
                style={styles.banner}
                testID={`step-${currentStep}-error-banner`}
              />
            ) : null}

            {currentStep === 1 && (
              <StepRacketExperience
                state={state}
                dispatch={dispatch}
                errors={showErrors ? racketProblems : {}}
                dirtyKeys={dirtyKeys}
                disabled={!editable}
              />
            )}
            {currentStep === 2 && (
              <StepAboutYou
                state={state}
                dispatch={dispatch}
                dirtyKeys={dirtyKeys}
                disabled={!editable}
              />
            )}
            {currentStep === 3 && (
              <StepProfileImages
                images={assessment.profile_images ?? []}
                busy={imageBusy || !editable}
                uploading={uploading}
                deletingId={
                  deleteMutation.isPending ? deleteMutation.variables?.id ?? null : null
                }
                onAdd={handleAddImage}
                onRemove={handleRemoveImage}
                disabled={!editable}
              />
            )}
            {currentStep === 4 && (
              <AssessmentStatusView
                assessment={assessment}
                reopening={reopenMutation.isPending}
                creating={createMutation.isPending}
                submitting={submitting || readyMutation.isPending}
                discarding={discardMutation.isPending}
                actionsDisabled={stepperBusy}
                onReopen={() => void handleReopen()}
                onSubmitForReview={() => void handleSubmitForReview()}
                onCreateNew={() => void handleCreateNew()}
                onDiscard={() => void handleDiscard()}
              />
            )}
          </ScrollView>

          {currentStep < 4 && editable ? (
            <StepNavButtons
              onBack={nav.back ? handleStepBack : undefined}
              backLabel={nav.back}
              onForward={nav.forward ? handleForward : undefined}
              forwardLabel={nav.forward}
            />
          ) : null}

          {currentStep === 4 && assessment ? (
            <WizardLeaveFooter
              label={leaveLabelForAssessment(assessment)}
              onPress={() => void requestLeave()}
              testID="assessment-finish-later"
            />
          ) : null}
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  retry: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  stepper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  banner: {
    marginTop: 12,
  },
});
