import { useReducer, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Steps from '@/components/Visuals/Steps';
import StepNavButtons from '@/components/Eligibility/StepNavButtons';
import StepDivision from '@/components/Registration/StepDivision';
import StepPayment from '@/components/Registration/StepPayment';
import StepProof from '@/components/Registration/StepProof';
import StepPending from '@/components/Registration/StepPending';
import { useEvents } from '@/context/events';
import { MOCK_EVENT_DETAILS } from '@/app/event/[id]';
import { DivisionDetails } from '@/types/types';

// ---------- Mock divisions ----------

const MOCK_DIVISIONS: DivisionDetails[] = [
  {
    name: 'Students Rookies',
    price: 45,
    description: 'Never played padel before or a few times only.',
    num_spots: 12,
    isEligible: true,
    isActive: true,
  },
  {
    name: 'Students Beginners',
    price: 55,
    description: 'Played a few times already.',
    num_spots: 6,
    isEligible: false,
    isActive: true,
  },
  {
    name: 'Intermediate Division',
    price: 50,
    description: 'For players with 1+ year experience',
    num_spots: 0,
    isEligible: false,
    isActive: true,
  },
];

// ---------- State ----------

type PaymentMethod = 'bank_transfer' | 'netopia';

type RegistrationFormState = {
  selectedDivision: string | null;
  divisionPrice: number;
  paymentMethod: PaymentMethod | null;
  voucherCode: string;
  discount: number;
  paymentProofUri: string | null;
  submittedAt: string | null;
};

type RegistrationAction =
  | { type: 'SELECT_DIVISION'; division: string; price: number }
  | { type: 'SELECT_PAYMENT_METHOD'; method: PaymentMethod }
  | { type: 'SET_VOUCHER_CODE'; code: string }
  | { type: 'APPLY_VOUCHER' }
  | { type: 'SET_PAYMENT_PROOF'; uri: string }
  | { type: 'SUBMIT' };

const initialState: RegistrationFormState = {
  selectedDivision: null,
  divisionPrice: 0,
  paymentMethod: null,
  voucherCode: '',
  discount: 10, // Mock student discount
  paymentProofUri: null,
  submittedAt: null,
};

function reducer(state: RegistrationFormState, action: RegistrationAction): RegistrationFormState {
  switch (action.type) {
    case 'SELECT_DIVISION':
      return { ...state, selectedDivision: action.division, divisionPrice: action.price };
    case 'SELECT_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.method };
    case 'SET_VOUCHER_CODE':
      return { ...state, voucherCode: action.code };
    case 'APPLY_VOUCHER':
      // Mock: any non-empty code applies a discount
      return state;
    case 'SET_PAYMENT_PROOF':
      return { ...state, paymentProofUri: action.uri };
    case 'SUBMIT':
      return { ...state, submittedAt: new Date().toISOString() };
    default:
      return state;
  }
}

// ---------- Step config ----------

const STEP_LABELS = ['Division', 'Payment', 'Proof', 'Pending'];

const STEP_NAV: Record<number, { back?: string; forward?: string }> = {
  1: { forward: 'Payment Options' },
  2: { back: 'Division', forward: 'Payment Proof' },
  3: { back: 'Payment Options', forward: 'Submit Registration' },
  4: { back: 'Payment Proof', forward: 'See Event' },
};

// ---------- Component ----------

export default function RegistrationScreen() {
  const { eventId, initialStep } = useLocalSearchParams<{ eventId: string; initialStep?: string }>();
  const router = useRouter();
  const { setEventStatus } = useEvents();
  const [currentStep, setCurrentStep] = useState(initialStep ? parseInt(initialStep, 10) : 1);
  const [state, dispatch] = useReducer(reducer, initialState);

  const event = eventId ? MOCK_EVENT_DETAILS[eventId] : undefined;

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.headerTitle}>Event not found</Text>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleForward = () => {
    if (currentStep === 3) {
      console.log('=== Registration Submission ===', JSON.stringify(state, null, 2));
      if (eventId) setEventStatus(eventId, 'registration_pending');
      dispatch({ type: 'SUBMIT' });
      setCurrentStep(4);
    } else if (currentStep === 4) {
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

  // Step 1: require division selection. Step 2: require payment method. Step 3: require proof upload.
  const canAdvance =
    (currentStep === 1 && state.selectedDivision !== null) ||
    (currentStep === 2 && state.paymentMethod !== null) ||
    (currentStep === 3 && state.paymentProofUri !== null) ||
    currentStep === 4;

  const divisionName = state.selectedDivision ?? 'Students Rookies';
  const fee = state.divisionPrice || 45;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={currentStep === 1 ? () => router.back() : handleBack} style={styles.headerButton}>
          <FontAwesome name="chevron-left" size={16} color={Colors.WHITE} />
        </Pressable>
        <Text style={styles.headerTitle}>Registration Process</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        <Steps labels={STEP_LABELS} currentStep={currentStep} color={Colors.BLUE} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {currentStep === 1 && (
          <StepDivision
            event={event}
            divisions={MOCK_DIVISIONS}
            selectedDivision={state.selectedDivision}
            onSelect={(name, price) => dispatch({ type: 'SELECT_DIVISION', division: name, price })}
          />
        )}
        {currentStep === 2 && (
          <StepPayment
            event={event}
            divisionName={divisionName}
            fee={fee}
            selectedMethod={state.paymentMethod}
            onSelectMethod={(method) => dispatch({ type: 'SELECT_PAYMENT_METHOD', method })}
          />
        )}
        {currentStep === 3 && (
          <StepProof
            event={event}
            divisionName={divisionName}
            fee={fee}
            discount={state.discount}
            voucherCode={state.voucherCode}
            paymentProofUri={state.paymentProofUri}
            onVoucherChange={(code) => dispatch({ type: 'SET_VOUCHER_CODE', code })}
            onApplyVoucher={() => dispatch({ type: 'APPLY_VOUCHER' })}
            onSelectProof={(uri) => dispatch({ type: 'SET_PAYMENT_PROOF', uri })}
          />
        )}
        {currentStep === 4 && (
          <StepPending
            event={event}
            divisionName={divisionName}
            fee={fee}
            discount={state.discount}
          />
        )}
      </ScrollView>

      {/* Navigation */}
      <StepNavButtons
        onBack={nav.back ? handleBack : undefined}
        backLabel={nav.back}
        onForward={canAdvance && nav.forward ? handleForward : undefined}
        forwardLabel={nav.forward}
        forwardDisabled={!canAdvance && currentStep !== 4}
        isFinalForward={currentStep === 4}
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
