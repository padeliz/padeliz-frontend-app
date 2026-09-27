import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EligibilityFormState } from '@/app/event/eligibility-check';

type Props = {
  state: EligibilityFormState;
};

export default function StepReview({ state }: Props) {
  const submittedDate = state.submittedAt
    ? new Date(state.submittedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Just now';

  const sourcesDisplay = state.discoverySources
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ') || 'None';

  const sportsDisplay = state.selectedSports
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ') || 'None';

  const photosCount = state.avatarPhotos.filter(Boolean).length;

  const detailRows = [
    { label: 'Discovery Source', value: sourcesDisplay },
    { label: 'Sports Experience', value: sportsDisplay },
    { label: 'Playing Frequency', value: 'Weekly' },
    { label: 'Photos Submitted', value: String(photosCount) },
  ];

  return (
    <View style={styles.container}>
      {/* Status card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIcon}>
            <FontAwesome name="clock-o" size={16} color={Colors.WHITE} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>Under Review</Text>
            <Text style={styles.statusDate}>Submitted on {submittedDate}</Text>
          </View>
        </View>
        <Text style={styles.statusDescription}>
          Your eligibility application is currently being reviewed by our team. This process typically takes 1-2 business days.
        </Text>
      </View>

      {/* Application details card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Application Details</Text>
        <View style={styles.detailsRows}>
          {detailRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.detailRow,
                index < detailRows.length - 1 && styles.detailRowBorder,
              ]}
            >
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 11,
    gap: 24,
  },
  statusCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: Colors.ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    marginLeft: 12,
  },
  statusTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  statusDate: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 2,
  },
  statusDescription: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 22,
    color: Colors.CREAM,
  },
  detailsCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 24,
  },
  detailsTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  detailsRows: {
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 41,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.CREAM_10,
  },
  detailLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.CREAM_80,
  },
  detailValue: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
});
