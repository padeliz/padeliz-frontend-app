/**
 * Discovery intercept ("How did you discover us?").
 *
 * Not a post-login gate: it is only shown when the player taps "Assess my level" or
 * "Register" while media is empty OR (Friends selected AND friends empty). After submit
 * the player is redirected to the stored target (`?target=assessment|registration`).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Button from '@/components/Buttons/Button';
import ScreenHeader from '@/components/Navigation/ScreenHeader';
import StatusBanner from '@/components/Feedback/StatusBanner';
import OptionCard from '@/components/LevelAssessment/OptionCard';
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  FriendsIcon,
} from '@/components/LevelAssessment/SocialIcons';
import {
  useDiscoverySummary,
  useMediaSources,
  usePlayerSearch,
  useSaveDiscoveryMutation,
  useSuggestedFriends,
} from '@/services/hooks/useDiscovery';
import { MAX_FRIENDS, SEARCH_MIN_LENGTH } from '@/services/discovery';
import {
  buildFriendInputs,
  discoveryFormError,
  friendRowFromSearchResult,
  friendRowFromSuggestion,
  friendsSourceSelected,
  isLevelFlowTarget,
  newFriendRow,
  type FriendRow,
} from '@/services/discoveryGate';
import type { PlayerSearchResult } from '@/types/api';
import { ApiError } from '@/services/apiError';
import { levelTargetPath } from '@/utils/eventPaths';

function sourceIcon(code: string) {
  switch (code) {
    case 'instagram':
      return <InstagramIcon size={20} color={Colors.WHITE} />;
    case 'tiktok':
      return <TikTokIcon size={20} color={Colors.WHITE} />;
    case 'facebook':
      return <FacebookIcon size={20} color={Colors.WHITE} />;
    case 'friends':
      return <FriendsIcon size={20} color={Colors.WHITE} />;
    default:
      return undefined;
  }
}

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.firstValidationMessage ?? e.message;
  return 'Something went wrong. Please try again.';
}

export default function DiscoveryScreen() {
  const params = useLocalSearchParams<{ target?: string; eventId?: string }>();
  const router = useRouter();
  const target = isLevelFlowTarget(params.target) ? params.target : 'assessment';
  const eventId = params.eventId ? Number(params.eventId) : null;

  const { data: catalog, loading: catalogLoading } = useMediaSources();
  const { data: summary, loading: summaryLoading } = useDiscoverySummary();
  const saveMutation = useSaveDiscoveryMutation();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<FriendRow[]>([newFriendRow()]);
  const [error, setError] = useState<string | null>(null);

  // Prefill once from what is already saved.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!summary || hydratedRef.current) return;
    hydratedRef.current = true;
    setSelectedIds(summary.media_source_ids ?? []);
    if ((summary.friends ?? []).length > 0) {
      setRows(
        summary.friends.slice(0, MAX_FRIENDS).map((f) =>
          newFriendRow({
            friend_player_id: f.friend_player_id,
            full_name: f.full_name ?? f.friend_name ?? '',
            email: f.email ?? '',
            phone: f.phone ?? '',
          })
        )
      );
    }
  }, [summary]);

  const sources = catalog ?? [];
  const showFriends = useMemo(
    () => friendsSourceSelected(sources, selectedIds),
    [sources, selectedIds]
  );
  const { data: suggestions } = useSuggestedFriends(showFriends);
  const unusedSuggestions = (suggestions ?? []).filter(
    (s) => !rows.some((r) => r.friend_player_id === s.friend_player_id)
  );

  const [searchText, setSearchText] = useState('');
  const canSearch = showFriends && rows.length < MAX_FRIENDS;
  const searchActive = canSearch && searchText.trim().length >= SEARCH_MIN_LENGTH;
  const { data: searchData, loading: searchLoading } = usePlayerSearch(searchText, canSearch);
  const searchResults = (searchData ?? []).filter(
    (p) => !rows.some((r) => r.friend_player_id === p.id_player)
  );

  const toggleSource = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const updateRow = (key: string, patch: Partial<FriendRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const addRow = (row: FriendRow = newFriendRow()) =>
    setRows((prev) => {
      if (prev.length >= MAX_FRIENDS) return prev;
      // Replace a lone blank row instead of stacking on top of it.
      if (prev.length === 1 && buildFriendInputs(prev).length === 0) return [row];
      return [...prev, row];
    });

  const pickSearchResult = (player: PlayerSearchResult) => {
    addRow(friendRowFromSearchResult(player));
    setSearchText('');
  };

  const handleSubmit = async () => {
    const problem = discoveryFormError({ selectedIds, friendsSelected: showFriends, rows });
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    try {
      await saveMutation.mutateAsync({
        mediaSourceIds: selectedIds,
        friends: showFriends ? buildFriendInputs(rows) : null,
      });
      router.replace(levelTargetPath(target, eventId) as any);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const loading = catalogLoading || summaryLoading;
  const remaining = MAX_FRIENDS - rows.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Welcome" variant="stack" onBack={() => router.back()} />

      {loading ? (
        <View style={styles.centered} testID="discovery-loading">
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.heading}>How did you discover us?</Text>
          <Text style={styles.subtitle}>Select where you first heard about Padeliz</Text>

          {error ? (
            <StatusBanner
              variant="error"
              message={error}
              style={styles.banner}
            />
          ) : null}

          <View style={styles.options}>
            {sources.map((source) => (
              <View key={source.id_media_source} testID={`media-source-${source.code}`}>
                <OptionCard
                  label={source.label}
                  checked={selectedIds.includes(source.id_media_source)}
                  onToggle={() => toggleSource(source.id_media_source)}
                  icon={sourceIcon(source.code)}
                />
              </View>
            ))}
          </View>

          {showFriends ? (
            <View style={styles.friends} testID="discovery-friends">
              <Text style={styles.friendsHeading}>Who told you about Padeliz?</Text>

              {unusedSuggestions.length > 0 && rows.length < MAX_FRIENDS ? (
                <View style={styles.suggestions} testID="friend-suggestions">
                  {unusedSuggestions.map((s) => (
                    <Pressable
                      key={s.friend_player_id}
                      style={styles.chip}
                      onPress={() => addRow(friendRowFromSuggestion(s))}
                      testID={`suggest-friend-${s.friend_player_id}`}
                    >
                      <Text style={styles.chipText}>{s.full_name}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {canSearch ? (
                <View style={styles.search} testID="friend-search-section">
                  <TextInput
                    testID="friend-search"
                    style={styles.input}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search Padeliz players by name, email or phone"
                    placeholderTextColor={Colors.INACTIVE}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchActive && searchLoading ? (
                    <ActivityIndicator color={Colors.BLUE} style={styles.searchSpinner} />
                  ) : null}
                  {searchActive && !searchLoading && searchResults.length === 0 ? (
                    <Text style={styles.maxNote} testID="friend-search-empty">
                      No players found. Enter your friend's details below instead.
                    </Text>
                  ) : null}
                  {searchActive
                    ? searchResults.map((p) => (
                        <Pressable
                          key={p.id_player}
                          style={styles.result}
                          onPress={() => pickSearchResult(p)}
                          testID={`search-result-${p.id_player}`}
                        >
                          <Text style={styles.resultName}>{p.name}</Text>
                          {p.email_masked || p.phone_masked ? (
                            <Text style={styles.resultMeta}>
                              {[p.email_masked, p.phone_masked].filter(Boolean).join(' · ')}
                            </Text>
                          ) : null}
                        </Pressable>
                      ))
                    : null}
                </View>
              ) : null}

              {rows.map((row, index) => (
                <View key={row.key} style={styles.friendRow} testID={`friend-row-${index}`}>
                  <TextInput
                    testID={`friend-name-${index}`}
                    style={styles.input}
                    value={row.full_name}
                    onChangeText={(text) =>
                      updateRow(row.key, { full_name: text, friend_player_id: null })
                    }
                    placeholder="Friend's name"
                    placeholderTextColor={Colors.INACTIVE}
                  />
                  <TextInput
                    testID={`friend-email-${index}`}
                    style={styles.input}
                    value={row.email}
                    onChangeText={(text) => updateRow(row.key, { email: text })}
                    placeholder="Friend's email (optional)"
                    placeholderTextColor={Colors.INACTIVE}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    testID={`friend-phone-${index}`}
                    style={styles.input}
                    value={row.phone}
                    onChangeText={(text) => updateRow(row.key, { phone: text })}
                    placeholder="Friend's phone (optional)"
                    placeholderTextColor={Colors.INACTIVE}
                    keyboardType="phone-pad"
                  />
                </View>
              ))}

              {remaining > 0 ? (
                <Button
                  label={`Add Another Friend (${remaining} remaining)`}
                  onPress={() => addRow()}
                  style={styles.addButton}
                  testID="add-friend"
                />
              ) : (
                <Text style={styles.maxNote} testID="friends-max">
                  Maximum of {MAX_FRIENDS} friends
                </Text>
              )}
            </View>
          ) : null}

          <Button
            label="Continue"
            onPress={() => void handleSubmit()}
            loading={saveMutation.isPending}
            style={styles.submit}
            testID="discovery-submit"
          />
        </ScrollView>
      )}
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
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 32,
  },
  heading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    lineHeight: 26,
    color: Colors.WHITE,
  },
  subtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 14,
    color: Colors.CREAM,
    marginTop: 12,
  },
  banner: {
    marginTop: 16,
  },
  options: {
    marginTop: 24,
    gap: 12,
  },
  friends: {
    marginTop: 32,
  },
  friendsHeading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: Colors.GRAY,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  search: {
    marginBottom: 16,
    gap: 8,
  },
  searchSpinner: {
    marginVertical: 8,
  },
  result: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultName: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  resultMeta: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 2,
  },
  friendRow: {
    gap: 8,
    marginBottom: 16,
  },
  input: {
    height: 48,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  addButton: {
    backgroundColor: Colors.ORANGE,
    height: 48,
  },
  maxNote: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  submit: {
    marginTop: 32,
  },
});
