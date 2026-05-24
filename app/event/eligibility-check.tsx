import { useEffect, useReducer, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Steps from '@/components/Visuals/Steps';
import StepNavButtons from '@/components/Eligibility/StepNavButtons';
import StepSource from '@/components/Eligibility/StepSource';
import StepSports from '@/components/Eligibility/StepSports';
import StepDetails from '@/components/Eligibility/StepDetails';
import StepPhotos from '@/components/Eligibility/StepPhotos';
import StepReview from '@/components/Eligibility/StepReview';
import StatusBanner from '@/components/Feedback/StatusBanner';
import { useEvents } from '@/context/events';
import { useEligibilityLatest } from '@/services/hooks/useEligibility';
import {
  fetchEligibilityLatest,
  patchPending,
  uploadPortraitPhoto,
  uploadStudentProof,
} from '@/services/eligibility';
import { buildPatchPendingBody, hydrateFromEligibility } from '@/services/eligibilityMaps';
import { ApiError } from '@/services/apiError';

// ---------- State types ----------

export type SportExperience = {
  level: string;
  amount: string;
  unit: string;
};

export type EligibilityFormState = {
  // Step 1
  discoverySources: string[];
  friendEmails: string[];
  // Step 2
  selectedSports: string[];
  sportsExperience: Record<string, SportExperience>;
  // Step 3
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  isStudent: boolean;
  studentIdFront: string | null;
  studentIdBack: string | null;
  // Step 4
  avatarPhotos: (string | null)[];
  // Step 5
  submittedAt: string | null;
};

// ---------- Actions ----------

export type FormAction =
  | { type: 'TOGGLE_SOURCE'; source: string }
  | { type: 'SET_FRIEND_EMAILS'; emails: string[] }
  | { type: 'ADD_FRIEND_EMAIL' }
  | { type: 'UPDATE_FRIEND_EMAIL'; index: number; value: string }
  | { type: 'TOGGLE_SPORT'; sport: string }
  | { type: 'SET_SPORT_EXPERIENCE'; sport: string; experience: Partial<SportExperience> }
  | { type: 'SET_FIELD'; field: keyof EligibilityFormState; value: any }
  | { type: 'SET_AVATAR_PHOTO'; index: number; uri: string }
  | { type: 'HYDRATE'; payload: Partial<EligibilityFormState> }
  | { type: 'SUBMIT' };

// ---------- Reducer ----------

const initialState: EligibilityFormState = {
  discoverySources: [],
  friendEmails: [''],
  selectedSports: [],
  sportsExperience: {},
  firstName: '',
  middleName: '',
  lastName: '',
  phoneNumber: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  isStudent: false,
  studentIdFront: null,
  studentIdBack: null,
  avatarPhotos: [null, null, null],
  submittedAt: null,
};

function reducer(state: EligibilityFormState, action: FormAction): EligibilityFormState {
  switch (action.type) {
    case 'TOGGLE_SOURCE': {
      const sources = state.discoverySources.includes(action.source)
        ? state.discoverySources.filter((s) => s !== action.source)
        : [...state.discoverySources, action.source];
      return { ...state, discoverySources: sources };
    }
    case 'ADD_FRIEND_EMAIL':
      if (state.friendEmails.length >= 3) return state;
      return { ...state, friendEmails: [...state.friendEmails, ''] };
    case 'UPDATE_FRIEND_EMAIL': {
      const emails = [...state.friendEmails];
      emails[action.index] = action.value;
      return { ...state, friendEmails: emails };
    }
    case 'SET_FRIEND_EMAILS':
      return { ...state, friendEmails: action.emails };
    case 'TOGGLE_SPORT': {
      const sports = state.selectedSports.includes(action.sport)
        ? state.selectedSports.filter((s) => s !== action.sport)
        : [...state.selectedSports, action.sport];
      const experience = { ...state.sportsExperience };
      if (!sports.includes(action.sport)) {
        delete experience[action.sport];
      }
      return { ...state, selectedSports: sports, sportsExperience: experience };
    }
    case 'SET_SPORT_EXPERIENCE': {
      const current = state.sportsExperience[action.sport] || { level: '', amount: '', unit: 'times' };
      return {
        ...state,
        sportsExperience: {
          ...state.sportsExperience,
          [action.sport]: { ...current, ...action.experience },
        },
      };
    }
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_AVATAR_PHOTO': {
      const photos = [...state.avatarPhotos];
      photos[action.index] = action.uri;
      return { ...state, avatarPhotos: photos };
    }
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SUBMIT':
      return { ...state, submittedAt: new Date().toISOString() };
    default:
      return state;
  }
}

// ---------- Step config ----------

const STEP_LABELS = ['Source', 'Sports', 'Details', 'Photo', 'Status'];

const STEP_NAV: Record<number, { back?: string; forward?: string }> = {
  1: { forward: 'Sports Experience' },
  2: { back: 'Source Referrals', forward: 'Personal Details' },
  3: { back: 'Sports Experience', forward: 'Avatar Photos' },
  4: { back: 'Personal Details', forward: 'Submit Registration' },
  5: { back: 'Avatar Photos', forward: 'See Event' },
};

// ---------- Component ----------

function submitErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    return e.firstValidationMessage ?? e.message;
  }
  return 'Something went wrong. Please try again.';
}

export default function EligibilityCheckScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { setEventStatus } = useEvents();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prefill from the player's most recent eligibility (any status). For a non-pending
  // record we pass its id as duplicate_id so the backend clones its uploads.
  const { data: latest } = useEligibilityLatest();
  const duplicateIdRef = useRef<number | undefined>(undefined);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!latest || hydratedRef.current) return;
    hydratedRef.current = true;
    dispatch({ type: 'HYDRATE', payload: hydrateFromEligibility(latest) });
    if (latest.review_status !== 'pending') {
      duplicateIdRef.current = latest.id_eligibility;
    }
  }, [latest]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const submitEligibility = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // The backend keeps ONE pending record per player covering a set of editions, and
      // PATCH replaces edition_ids. Union the current event with whatever the pending
      // record already covers so submitting for one event doesn't drop the others.
      let existingEditionIds: number[] = [];
      try {
        const current = await fetchEligibilityLatest();
        if (current?.review_status === 'pending') {
          existingEditionIds = current.edition_ids ?? [];
        }
      } catch {
        // ignore — fall back to just this event
      }
      const editionIds = eventId
        ? Array.from(new Set([...existingEditionIds, Number(eventId)]))
        : existingEditionIds;

      const body = buildPatchPendingBody(state, editionIds);
      await patchPending(body, duplicateIdRef.current);

      // Student proofs require being_student=true on the pending record (set above).
      if (state.isStudent) {
        const proofs = [state.studentIdFront, state.studentIdBack].filter(
          (u): u is string => !!u
        );
        for (const uri of proofs.slice(0, 3)) {
          await uploadStudentProof(uri);
        }
      }

      const portraits = state.avatarPhotos.filter((u): u is string => !!u);
      for (const uri of portraits.slice(0, 3)) {
        await uploadPortraitPhoto(uri);
      }

      if (eventId) setEventStatus(eventId, 'eligibility_pending');
      dispatch({ type: 'SUBMIT' });
      setCurrentStep(5);
    } catch (e) {
      setSubmitError(submitErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForward = () => {
    if (currentStep === 4) {
      void submitEligibility();
    } else if (currentStep === 5) {
      if (eventId) {
        router.replace(`/event/${eventId}` as any);
      } else {
        router.replace('/' as any);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const nav = STEP_NAV[currentStep];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={currentStep === 1 ? () => router.back() : handleBack} style={styles.headerButton}>
          <FontAwesome name="chevron-left" size={16} color={Colors.WHITE} />
        </Pressable>
        <Text style={styles.headerTitle}>Eligibility Check</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        <Steps labels={STEP_LABELS} currentStep={currentStep} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {submitError && (
          <StatusBanner variant="error" message={submitError} style={styles.errorBanner} />
        )}
        {currentStep === 1 && <StepSource state={state} dispatch={dispatch} />}
        {currentStep === 2 && <StepSports state={state} dispatch={dispatch} />}
        {currentStep === 3 && <StepDetails state={state} dispatch={dispatch} />}
        {currentStep === 4 && <StepPhotos state={state} dispatch={dispatch} />}
        {currentStep === 5 && <StepReview state={state} />}
      </ScrollView>

      {/* Navigation */}
      <StepNavButtons
        onBack={nav.back ? handleBack : undefined}
        backLabel={nav.back}
        onForward={nav.forward && !submitting ? handleForward : undefined}
        forwardLabel={submitting ? 'Submitting…' : nav.forward}
        forwardDisabled={submitting}
        isFinalForward={currentStep === 5}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
  },
  header: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CREAM_10,
  },
  headerButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
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
  errorBanner: {
    marginTop: 12,
  },
});
