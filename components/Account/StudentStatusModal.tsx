import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '@/components/Buttons/Button';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import {
  findActiveProof,
  findLapsedApprovedProof,
  isProofInReview,
  studentProofCta,
} from '@/services/accountStatusCta';
import { todayYmd } from '@/services/dateRange';
import { formatDateShort } from '@/services/mappers';
import {
  nextShowMoreCount,
  SHOW_MORE_INITIAL,
  showMoreRemaining,
} from '@/services/showMoreWindow';
import type { PlayerStudentProof, StudentProofsIndex } from '@/types/api';

type Tab = 'status' | 'history';

type Props = {
  visible: boolean;
  data: StudentProofsIndex | null | undefined;
  onClose: () => void;
  onCta: () => void;
};

function proofHistoryLabel(item: PlayerStudentProof): string {
  if (item.review_status === 'pending' && item.ready_for_review) return 'In review';
  if (item.review_status === 'pending') return 'Draft';
  return item.review_status.charAt(0).toUpperCase() + item.review_status.slice(1);
}

export default function StudentStatusModal({ visible, data, onClose, onCta }: Props) {
  const [tab, setTab] = useState<Tab>('status');
  const [visibleCount, setVisibleCount] = useState(SHOW_MORE_INITIAL);
  const today = todayYmd();
  const items = data?.items ?? [];
  const active = data?.has_active ? findActiveProof(items, today) : null;
  const lapsed = !data?.has_active ? findLapsedApprovedProof(items, today) : null;
  const pending = data?.pending ?? null;

  useEffect(() => {
    if (!visible) {
      setTab('status');
      setVisibleCount(SHOW_MORE_INITIAL);
    }
  }, [visible]);

  const cta = useMemo(
    () => studentProofCta({ pending, items }),
    [pending, items]
  );

  const shown = items.slice(0, visibleCount);
  const remaining = showMoreRemaining(visibleCount, items.length);

  let statusPrimary = 'No student status';
  let statusSecondary: string | null = null;
  if (active?.student_until) {
    statusPrimary = 'Student';
    statusSecondary = `Until ${formatDateShort(active.student_until)}`;
  } else if (lapsed?.student_until) {
    statusPrimary = 'Expired';
    statusSecondary = `Until ${formatDateShort(lapsed.student_until)}`;
  } else if (isProofInReview(pending)) {
    statusPrimary = 'In review';
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
        testID="student-status-modal-backdrop"
      >
        <Pressable
          style={styles.modalCard}
          onPress={() => undefined}
          testID="student-status-modal"
        >
          <View style={styles.tabs} testID="student-status-modal-tabs">
            <Pressable
              onPress={() => setTab('status')}
              style={[styles.tab, tab === 'status' && styles.tabActive]}
              testID="student-status-tab-status"
            >
              <Text style={[styles.tabLabel, tab === 'status' && styles.tabLabelActive]}>
                My Student Status
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('history')}
              style={[styles.tab, tab === 'history' && styles.tabActive]}
              testID="student-status-tab-history"
            >
              <Text style={[styles.tabLabel, tab === 'history' && styles.tabLabelActive]}>
                History
              </Text>
            </Pressable>
          </View>

          {tab === 'status' ? (
            <View style={styles.statusBody}>
              <Text style={styles.statusPrimary} testID="student-status-primary">
                {statusPrimary}
              </Text>
              {statusSecondary ? (
                <Text style={styles.statusSecondary} testID="student-status-until">
                  {statusSecondary}
                </Text>
              ) : null}
              {isProofInReview(pending) && active ? (
                <Text style={styles.inReview} testID="student-status-in-review">
                  In review
                </Text>
              ) : null}
              <View style={styles.modalActions}>
                <Button label={cta.label} onPress={onCta} testID="student-status-cta" />
                <Button
                  label="Close"
                  onPress={onClose}
                  style={styles.modalCloseButton}
                  labelStyle={styles.modalCloseLabel}
                  testID="student-status-close"
                />
              </View>
            </View>
          ) : (
            <View style={styles.historyBody} testID="student-status-history">
              <ScrollView style={styles.historyScroll}>
                {shown.map((item, index) => (
                  <View
                    key={item.id_player_student_proof}
                    style={styles.historyRow}
                    testID={`student-history-row-${index}`}
                  >
                    <Text style={styles.historyTitle}>{proofHistoryLabel(item)}</Text>
                    <Text style={styles.historySub}>
                      {item.student_until
                        ? `Until ${formatDateShort(item.student_until)}`
                        : 'No until date'}
                      {item.submitted_at
                        ? ` · Submitted ${formatDateShort(
                            new Date(item.submitted_at * 1000).toISOString().slice(0, 10)
                          )}`
                        : ''}
                    </Text>
                  </View>
                ))}
                {items.length === 0 ? (
                  <Text style={styles.empty} testID="student-history-empty">
                    No proofs yet.
                  </Text>
                ) : null}
              </ScrollView>
              {remaining > 0 ? (
                <Button
                  label="Show more"
                  variant="secondary"
                  onPress={() =>
                    setVisibleCount((n) => nextShowMoreCount(n, items.length))
                  }
                  testID="student-history-show-more"
                />
              ) : null}
              <Button
                label="Close"
                onPress={onClose}
                style={styles.modalCloseButton}
                labelStyle={styles.modalCloseLabel}
                testID="student-history-close"
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.DARK_GRAY,
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.WHITE_05,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.BLUE_T,
  },
  tabLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  tabLabelActive: {
    color: Colors.WHITE,
  },
  statusBody: {
    gap: 8,
  },
  statusPrimary: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  statusSecondary: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    textAlign: 'center',
  },
  inReview: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.AMBER,
    textAlign: 'center',
  },
  modalActions: {
    marginTop: 20,
    gap: 10,
  },
  modalCloseButton: {
    backgroundColor: Colors.WHITE_05,
  },
  modalCloseLabel: {
    color: Colors.WHITE,
  },
  historyBody: {
    gap: 12,
  },
  historyScroll: {
    maxHeight: 280,
  },
  historyRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.CREAM_20,
  },
  historyTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  historySub: {
    marginTop: 4,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  empty: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
