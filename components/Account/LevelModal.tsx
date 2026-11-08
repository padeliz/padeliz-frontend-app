import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from '@/components/Buttons/Button';
import LevelBandScale from '@/components/Level/LevelBandScale';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { levelAssessCta } from '@/services/accountStatusCta';
import {
  progressItemSubtitle,
  progressItemTitle,
} from '@/services/levelProgressDisplay';
import { useLevelProgress } from '@/services/hooks/useLevelAssessment';
import {
  nextShowMoreCount,
  SHOW_MORE_INITIAL,
  showMoreRemaining,
} from '@/services/showMoreWindow';
import type { Level, PlayerLevel, PlayerLevelAssessment } from '@/types/api';

type Tab = 'level' | 'progress';

type Props = {
  level: PlayerLevel;
  levels: Level[] | null;
  visible: boolean;
  starting: boolean;
  error?: string | null;
  pendingOrLatest: PlayerLevelAssessment | null | undefined;
  assessmentsForHistory: Array<
    Pick<PlayerLevelAssessment, 'submitted_at' | 'review_status'>
  >;
  onClose: () => void;
  onAssess: () => void;
  onSeePending: () => void;
};

export default function LevelModal({
  level,
  levels,
  visible,
  starting,
  error,
  pendingOrLatest,
  assessmentsForHistory,
  onClose,
  onAssess,
  onSeePending,
}: Props) {
  const [tab, setTab] = useState<Tab>('level');
  const [visibleCount, setVisibleCount] = useState(SHOW_MORE_INITIAL);
  const progressQuery = useLevelProgress(visible && tab === 'progress');
  const items = progressQuery.data?.items ?? [];

  useEffect(() => {
    if (!visible) {
      setTab('level');
      setVisibleCount(SHOW_MORE_INITIAL);
    }
  }, [visible]);

  const cta = useMemo(
    () =>
      levelAssessCta({
        pendingOrLatest,
        assessmentsForHistory,
        includeSeePending: true,
      }),
    [pendingOrLatest, assessmentsForHistory]
  );

  const shown = items.slice(0, visibleCount);
  const remaining = showMoreRemaining(visibleCount, items.length);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} testID="level-modal-backdrop">
        <Pressable style={styles.modalCard} onPress={() => undefined} testID="level-modal">
          <View style={styles.tabs} testID="level-modal-tabs">
            <Pressable
              onPress={() => setTab('level')}
              style={[styles.tab, tab === 'level' && styles.tabActive]}
              testID="level-modal-tab-level"
            >
              <Text style={[styles.tabLabel, tab === 'level' && styles.tabLabelActive]}>
                My Level
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setTab('progress')}
              style={[styles.tab, tab === 'progress' && styles.tabActive]}
              testID="level-modal-tab-progress"
            >
              <Text style={[styles.tabLabel, tab === 'progress' && styles.tabLabelActive]}>
                My Progress
              </Text>
            </Pressable>
          </View>

          {tab === 'level' ? (
            <View>
              <Text style={styles.levelModalBand} testID="level-modal-band">
                {level.band_name ?? 'Your level'}
              </Text>
              <LevelBandScale bandName={level.band_name} level={level.level} levels={levels} />
              <Text style={styles.levelModalNumber} testID="level-modal-level">
                Level {level.level}
              </Text>
              {error ? (
                <Text style={styles.error} testID="level-modal-error">
                  {error}
                </Text>
              ) : null}
              <View style={styles.modalActions}>
                <Button
                  label={cta.label}
                  onPress={cta.kind === 'see_pending' ? onSeePending : onAssess}
                  loading={starting}
                  testID="level-modal-update"
                />
                <Button
                  label="Close"
                  onPress={onClose}
                  style={styles.modalCloseButton}
                  labelStyle={styles.modalCloseLabel}
                  testID="level-modal-close"
                />
              </View>
            </View>
          ) : (
            <View style={styles.progressBody} testID="level-modal-progress">
              {progressQuery.loading && items.length === 0 ? (
                <ActivityIndicator color={Colors.BLUE} testID="level-progress-loading" />
              ) : null}
              <ScrollView style={styles.progressScroll}>
                {shown.map((item, index) => (
                  <View
                    key={`${item.kind}-${item.inserted_at}-${index}`}
                    style={styles.progressRow}
                    testID={`level-progress-row-${index}`}
                  >
                    <Text style={styles.progressTitle}>{progressItemTitle(item)}</Text>
                    {progressItemSubtitle(item) ? (
                      <Text style={styles.progressSub}>{progressItemSubtitle(item)}</Text>
                    ) : null}
                  </View>
                ))}
                {items.length === 0 && !progressQuery.loading ? (
                  <Text style={styles.progressEmpty} testID="level-progress-empty">
                    No progress yet.
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
                  testID="level-progress-show-more"
                />
              ) : null}
              <Button
                label="Close"
                onPress={onClose}
                style={styles.modalCloseButton}
                labelStyle={styles.modalCloseLabel}
                testID="level-modal-progress-close"
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
  levelModalBand: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  levelModalNumber: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    textAlign: 'center',
    marginTop: 8,
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
  error: {
    marginTop: 12,
    color: Colors.RED,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
  },
  progressBody: {
    gap: 12,
    minHeight: 160,
  },
  progressScroll: {
    maxHeight: 280,
  },
  progressRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.CREAM_20,
  },
  progressTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  progressSub: {
    marginTop: 4,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  progressEmpty: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
