/**
 * Level assessment wizard (Sports → Details → Photo → Status).
 *
 * Loads GET /latest once (creates pending only when none). Status never uses bottom
 * StepNavButtons. Dirty step changes auto-save; dirty top-left back confirms first.
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
import AssessmentStatusView from '@/components/LevelAssessment/AssessmentStatusView';
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const [fieldsLocked, setFieldsLocked] = useState(false);

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
    setActionError(null);
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

  const leaveWizard = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
      return;
    }
    if (eventId) router.replace(eventDetailPath(Number(eventId)) as any);
    else router.replace('/(tabs)/account' as any);
  }, [navigation, router, eventId]);

  const editable = assessment ? isDraftEditable(assessment) : false;
  const dirtyKeys = useMemo(() => dirtyFieldKeys(state, baseline), [state, baseline]);
  const currentDirty = stepIsDirty(currentStep, dirtyKeys);

  const racketProblems = useMemo(() => racketErrors(state), [state]);
  const yobProblem = yearOfBirthError(state.yearOfBirth);

  const saveStep = async (step: number): Promise<boolean> => {
    if (!editable) return true;
    const codes = fieldCodesForStep(step);
    const fields = buildCustomFields(state, codes);
    if (Object.keys(fields).length === 0) {
      setBaseline(cloneForm(state));
      return true;
    }
    const next = await saveMutation.mutateAsync(fields);
    const form = formFromAssessment(next);
    setAssessment(next);
    dispatch({ type: 'HYDRATE', payload: form });
    setBaseline(cloneForm(form));
    return true;
  };

  const stepIsValid = (step: number): boolean => {
    if (step === 1) return Object.keys(racketProblems).length === 0;
    if (step === 2) return yobProblem === null;
    return true;
  };

  const goToStep = async (target: number) => {
    if (target === currentStep || saving || fieldsLocked) return;
    if (!editable) {
      setCurrentStep(target);
      return;
    }

    if (!stepIsDirty(currentStep, dirtyKeys)) {
      setShowErrors(false);
      setCurrentStep(target);
      return;
    }

    if (!stepIsValid(currentStep)) {
      setShowErrors(true);
      return;
    }

    setActionError(null);
    setSaving(true);
    setFieldsLocked(true);
    setLoadingStep(currentStep);
    try {
      await saveStep(currentStep);
      setShowErrors(false);
      setCurrentStep(target);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setSaving(false);
      setFieldsLocked(false);
      setLoadingStep(null);
    }
  };

  const handleForward = () => {
    if (!editable || saving || fieldsLocked || currentStep >= 3) return;
    void goToStep(currentStep + 1);
  };

  const handleStepBack = () => {
    if (!editable || saving || fieldsLocked || currentStep <= 1) return;
    void goToStep(currentStep - 1);
  };

  const handleHeaderBack = async () => {
    if (saving || fieldsLocked) return;
    if (!editable || !currentDirty) {
      leaveWizard();
      return;
    }

    const choice = await confirmDirtyLeaveAsync();
    if (choice === 'stay') return;
    if (choice === 'discard') {
      leaveWizard();
      return;
    }

    if (!stepIsValid(currentStep)) {
      setShowErrors(true);
      return;
    }

    setActionError(null);
    setSaving(true);
    setFieldsLocked(true);
    setLoadingStep(currentStep);
    try {
      await saveStep(currentStep);
      leaveWizard();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setSaving(false);
      setFieldsLocked(false);
      setLoadingStep(null);
    }
  };

  const handleSubmitForReview = async () => {
    if (!editable || saving) return;
    const confirmed = await confirmAsync(
      'Submit for review?',
      'Once submitted, the assessment is locked while our team reviews it.'
    );
    if (!confirmed) return;

    setActionError(null);
    setSaving(true);
    setFieldsLocked(true);
    try {
      if (currentDirty && stepIsDirty(currentStep, dirtyKeys)) {
        if (!stepIsValid(currentStep)) {
          setShowErrors(true);
          return;
        }
        await saveStep(currentStep);
      }
      const ready = await readyMutation.mutateAsync();
      adopt(ready, 4);
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setSaving(false);
      setFieldsLocked(false);
    }
  };

  const handleReopen = async () => {
    const confirmed = await confirmAsync(
      'Reopen to edit?',
      'You can change your answers and submit again later.'
    );
    if (!confirmed) return;

    setActionError(null);
    try {
      adopt(await reopenMutation.mutateAsync(), 1);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const handleCreateNew = async () => {
    setActionError(null);
    try {
      adopt(await createMutation.mutateAsync(), 1);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const handleDiscard = async () => {
    if (!editable || saving || discardMutation.isPending) return;
    const confirmed = await confirmAsync(
      'Discard assessment?',
      'This discards your draft and deletes photos uploaded for this assessment.'
    );
    if (!confirmed) return;

    setActionError(null);
    try {
      await discardMutation.mutateAsync();
      leaveWizard();
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const handleAddImage = async (uri: string) => {
    setActionError(null);
    try {
      const next = await uploadMutation.mutateAsync(uri);
      setAssessment(next);
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const handleRemoveImage = async (id: number) => {
    setActionError(null);
    try {
      setAssessment(await deleteMutation.mutateAsync(id));
    } catch (e) {
      setActionError(errorMessage(e));
    }
  };

  const nav = STEP_NAV[currentStep];
  const uploading = uploadMutation.isPending;
  const imageBusy = uploading || deleteMutation.isPending;
  const navDisabled =
    saving || fieldsLocked || imageBusy || !editable || currentStep === 4;
  const completedSteps = useMemo(() => {
    const steps: number[] = [];
    for (let step = 1; step <= 3; step += 1) {
      if (stepHasData(step, state, assessment)) steps.push(step);
    }
    return steps;
  }, [state, assessment]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Level Assessment" variant="stack" onBack={() => void handleHeaderBack()} />

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
              onStepPress={(step) => void goToStep(step)}
              loadingStep={loadingStep}
              completedSteps={completedSteps}
            />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            testID="assessment-wizard"
          >
            {actionError ? (
              <StatusBanner variant="error" message={actionError} style={styles.banner} />
            ) : null}

            {currentStep === 1 && (
              <StepRacketExperience
                state={state}
                dispatch={dispatch}
                errors={showErrors ? racketProblems : {}}
                dirtyKeys={dirtyKeys}
                disabled={!editable || fieldsLocked}
              />
            )}
            {currentStep === 2 && (
              <StepAboutYou
                state={state}
                dispatch={dispatch}
                dirtyKeys={dirtyKeys}
                disabled={!editable || fieldsLocked}
              />
            )}
            {currentStep === 3 && (
              <StepProfileImages
                images={assessment.profile_images ?? []}
                busy={imageBusy || !editable || fieldsLocked}
                uploading={uploading}
                deletingId={deleteMutation.isPending ? deleteMutation.variables ?? null : null}
                onAdd={(uri) => void handleAddImage(uri)}
                onRemove={(id) => void handleRemoveImage(id)}
                disabled={!editable || fieldsLocked}
              />
            )}
            {currentStep === 4 && (
              <AssessmentStatusView
                assessment={assessment}
                reopening={reopenMutation.isPending}
                creating={createMutation.isPending}
                submitting={saving || readyMutation.isPending}
                discarding={discardMutation.isPending}
                onReopen={() => void handleReopen()}
                onSubmitForReview={() => void handleSubmitForReview()}
                onCreateNew={() => void handleCreateNew()}
                onDiscard={() => void handleDiscard()}
                onFinishLater={leaveWizard}
              />
            )}
          </ScrollView>

          {currentStep < 4 && editable ? (
            <StepNavButtons
              onBack={nav.back ? handleStepBack : undefined}
              backLabel={nav.back}
              onForward={nav.forward && !navDisabled ? handleForward : undefined}
              forwardLabel={nav.forward}
              forwardDisabled={navDisabled}
              loading={saving || imageBusy}
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
