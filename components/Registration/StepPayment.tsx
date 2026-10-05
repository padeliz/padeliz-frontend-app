import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventDetails } from '@/types/types';
import type {
  CheckoutQuoteEligibleBenefit,
  EventRegistrationCheckout,
  ReferrerCandidate,
} from '@/types/api';
import EventSummaryCard from './EventSummaryCard';
import PaymentDetailsCard, { type PaymentLine } from './PaymentDetailsCard';
import CheckoutPaymentsList from './CheckoutPaymentsList';
import Checkbox from '@/components/Inputs/Checkbox';

export type CheckoutBoxView = {
  key: string;
  statusLabel: string;
  dateLabel: string;
  lines: PaymentLine[];
  totalLabel: string;
  showPay: boolean;
  payDisabled: boolean;
  overdueMessage?: string | null;
};

type Props = {
  event: EventDetails;
  boxes: CheckoutBoxView[];
  checkouts: EventRegistrationCheckout[];
  onPayForIt: () => void;
  onResetPaymentPath?: () => void;
  resetting?: boolean;
  optionalBenefits?: CheckoutQuoteEligibleBenefit[];
  selectedBenefitIds?: number[];
  benefitsDisabled?: boolean;
  onToggleBenefit?: (benefitId: number) => void;
  referrerCandidates?: ReferrerCandidate[];
  selectedReferrerId?: number | null;
  onSelectReferrer?: (playerId: number) => void;
};

export default function StepPayment({
  event,
  boxes,
  checkouts,
  onPayForIt,
  onResetPaymentPath,
  resetting = false,
  optionalBenefits = [],
  selectedBenefitIds = [],
  benefitsDisabled = false,
  onToggleBenefit,
  referrerCandidates = [],
  selectedReferrerId = null,
  onSelectReferrer,
}: Props) {
  const showReferrerPicker = referrerCandidates.length >= 2;

  return (
    <View style={styles.container}>
      <EventSummaryCard event={event} />

      <Text style={styles.sectionHeading}>Order summary</Text>
      {boxes.length === 0 ? (
        <Text style={styles.empty}>No checkouts yet.</Text>
      ) : (
        boxes.map((box) => (
          <View key={box.key} style={styles.boxBlock}>
            <PaymentDetailsCard
              testID={`checkout-box-${box.key}`}
              lines={box.lines}
              totalLabel={box.totalLabel}
              statusLabel={box.statusLabel}
              dateLabel={box.dateLabel}
              overdueMessage={box.overdueMessage}
            />
            {box.showPay ? (
              <Pressable
                style={[styles.payBtn, box.payDisabled && styles.payBtnDisabled]}
                disabled={box.payDisabled}
                onPress={onPayForIt}
                testID="pay-for-it"
              >
                <Text style={styles.payBtnText}>Pay for it</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      )}

      {showReferrerPicker && onSelectReferrer ? (
        <View style={styles.benefitsBlock} testID="referrer-picker">
          <Text style={styles.heading}>Who referred you?</Text>
          <Text style={styles.hint}>
            Multiple referral links matched — pick one referrer before choosing optional benefits.
          </Text>
          {referrerCandidates.map((candidate) => {
            const selected = selectedReferrerId === candidate.referrer_player_id;
            return (
              <Pressable
                key={candidate.referrer_player_id}
                testID={`referrer-${candidate.referrer_player_id}`}
                style={styles.methodCard}
                onPress={() => onSelectReferrer(candidate.referrer_player_id)}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>
                    Player #{candidate.referrer_player_id}
                  </Text>
                  <Text style={styles.methodDescription}>
                    Latest touch{' '}
                    {new Date(candidate.latest_touched_at * 1000).toLocaleDateString()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {optionalBenefits.length > 0 && onToggleBenefit ? (
        <View style={styles.benefitsBlock} testID="optional-benefits">
          <Text style={styles.heading}>Available benefits</Text>
          {benefitsDisabled ? (
            <Text style={styles.hint}>Select a referrer before choosing benefits.</Text>
          ) : null}
          {optionalBenefits.map((benefit) => {
            const checked = selectedBenefitIds.includes(benefit.benefit_id);
            return (
              <Pressable
                key={benefit.benefit_id}
                testID={`benefit-toggle-${benefit.benefit_id}`}
                style={[styles.benefitRow, benefitsDisabled && styles.disabled]}
                disabled={benefitsDisabled}
                onPress={() => onToggleBenefit(benefit.benefit_id)}
              >
                <Checkbox checked={checked} />
                <View style={styles.benefitInfo}>
                  <Text style={styles.benefitName}>{benefit.name}</Text>
                  <Text style={styles.benefitMeta}>- RON {benefit.amount_ron}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <CheckoutPaymentsList
        checkouts={checkouts}
        onReset={onResetPaymentPath}
        resetting={resetting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  sectionHeading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  boxBlock: { gap: 12 },
  payBtn: {
    width: '100%',
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payBtnDisabled: {
    opacity: 0.45,
  },
  payBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  empty: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  heading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  hint: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  benefitsBlock: { gap: 10 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 12,
  },
  disabled: { opacity: 0.45 },
  benefitInfo: { flex: 1 },
  benefitName: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  benefitMeta: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  methodCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.CREAM_40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.BLUE },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.BLUE,
  },
  methodInfo: { flex: 1 },
  methodName: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  methodDescription: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
});
