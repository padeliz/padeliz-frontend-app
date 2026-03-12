import { useReducer, useState } from 'react';
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
import { useEvents } from '@/context/events';

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

export default function EligibilityCheckScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { setEventStatus } = useEvents();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleForward = () => {
    if (currentStep === 4) {
      console.log('=== Eligibility Form Submission ===', JSON.stringify(state, null, 2));
      if (eventId) setEventStatus(eventId, 'eligibility_pending');
      dispatch({ type: 'SUBMIT' });
      setCurrentStep(5);
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
        onForward={nav.forward ? handleForward : undefined}
        forwardLabel={nav.forward}
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
});
