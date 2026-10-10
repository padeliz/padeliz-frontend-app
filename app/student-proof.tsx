/**
 * Student proof submission — a separate flow from the level assessment.
 * One pending proof per player: 1-3 files plus the date the student status lasts until.
 * Creating sends the date and files together; later draft edits update the date, append one file
 * or delete a file individually. Editable while pending && !ready_for_review; locked (reopenable)
 * once ready.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Button from '@/components/Buttons/Button';
import ScreenHeader from '@/components/Navigation/ScreenHeader';
import StatusBanner from '@/components/Feedback/StatusBanner';
import PhotoUploadSlot from '@/components/LevelAssessment/PhotoUploadSlot';
import {
  useAddStudentProofFileMutation,
  useCreateStudentProofMutation,
  useDiscardStudentProofMutation,
  useMarkStudentProofReadyMutation,
  useRemoveStudentProofFileMutation,
  useReopenStudentProofMutation,
  useStudentProofs,
  useUpdateStudentProofDateMutation,
} from '@/services/hooks/useStudentProofs';
import { MAX_STUDENT_PROOF_FILES, studentUntilError } from '@/services/studentProofs';
import { ApiError } from '@/services/apiError';

function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.firstValidationMessage ?? e.message;
  return 'Something went wrong. Please try again.';
}

export default function StudentProofScreen() {
  const router = useRouter();
  const { data, loading, refetch } = useStudentProofs();
  const createMutation = useCreateStudentProofMutation();
  const updateDateMutation = useUpdateStudentProofDateMutation();
  const addFileMutation = useAddStudentProofFileMutation();
  const removeFileMutation = useRemoveStudentProofFileMutation();
  const readyMutation = useMarkStudentProofReadyMutation();
  const reopenMutation = useReopenStudentProofMutation();
  const discardMutation = useDiscardStudentProofMutation();

  const pending = data?.pending ?? null;
  const locked = Boolean(pending?.ready_for_review);
  const editable = !locked;
  const serverFiles = pending?.files ?? [];

  // Local picks only exist before the proof is created; afterwards every change goes to the API.
  const [localUris, setLocalUris] = useState<string[]>([]);
  const [studentUntil, setStudentUntil] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [done, setDone] = useState(false);

  // Prefill the date from an existing draft once.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!pending || hydratedRef.current) return;
    hydratedRef.current = true;
    if (pending.student_until) setStudentUntil(pending.student_until);
  }, [pending]);

  const fileCount = pending ? serverFiles.length : localUris.length;
  const canAddFile = editable && fileCount < MAX_STUDENT_PROOF_FILES;
  const dateProblem = studentUntilError(studentUntil);
  const hasFile = fileCount >= 1;
  const busy =
    createMutation.isPending ||
    updateDateMutation.isPending ||
    addFileMutation.isPending ||
    removeFileMutation.isPending ||
    readyMutation.isPending ||
    reopenMutation.isPending ||
    discardMutation.isPending;

  const handlePickFile = async (uri: string) => {
    setError(null);
    if (fileCount >= MAX_STUDENT_PROOF_FILES) return;
    if (!pending) {
      setLocalUris((prev) => (prev.length >= MAX_STUDENT_PROOF_FILES ? prev : [...prev, uri]));
      return;
    }
    try {
      await addFileMutation.mutateAsync({ uri });
      refetch();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const handleRemoveServerFile = async (fileId: number) => {
    setError(null);
    try {
      await removeFileMutation.mutateAsync(fileId);
      refetch();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!hasFile || dateProblem) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    const until = studentUntil.trim();
    try {
      if (!pending) {
        await createMutation.mutateAsync({
          files: localUris.map((uri) => ({ uri })),
          studentUntil: until,
        });
        setLocalUris([]);
      } else if (pending.student_until !== until) {
        await updateDateMutation.mutateAsync(until);
      }
      await readyMutation.mutateAsync();
      setDone(true);
      refetch();
    } catch (e) {
      setError(errorMessage(e));
      refetch();
    }
  };

  const handleReopen = async () => {
    setError(null);
    try {
      await reopenMutation.mutateAsync();
      setDone(false);
      refetch();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const handleDiscard = async () => {
    setError(null);
    try {
      await discardMutation.mutateAsync();
      setDone(false);
      setLocalUris([]);
      setStudentUntil('');
      setShowErrors(false);
      hydratedRef.current = false;
      refetch();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const latestRejected = data?.items.find((i) => i.review_status === 'rejected');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Student Proof" variant="stack" onBack={() => router.back()} />

      {loading ? (
        <View style={styles.centered} testID="student-proof-loading">
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Prove your student status</Text>
          <Text style={styles.subtitle}>
            Upload up to {MAX_STUDENT_PROOF_FILES} photos of your student ID and tell us until when
            you are a student. Once approved, student pricing applies to your registrations.
          </Text>

          {data?.has_active ? (
            <StatusBanner
              variant="success"
              style={styles.banner}
              message="Your student status is active."
            />
          ) : null}

          {latestRejected && !pending ? (
            <StatusBanner
              variant="error"
              style={styles.banner}
              message={
                latestRejected.review_message
                  ? `Last proof was rejected: ${latestRejected.review_message}`
                  : 'Your last proof was rejected. Please submit a new one.'
              }
            />
          ) : null}

          {error ? <StatusBanner variant="error" message={error} style={styles.banner} /> : null}

          {locked ? (
            <View testID="student-proof-locked" style={styles.block}>
              <StatusBanner
                variant="warning"
                message="Your proof is in review. It is locked until the team is done."
              />
              {pending?.student_until ? (
                <Text style={styles.meta}>Student until {pending.student_until}</Text>
              ) : null}
              <View style={styles.thumbRow}>
                {serverFiles.map((file) => (
                  <Image
                    key={file.id_player_student_proof_file}
                    testID={`student-proof-locked-file-${file.id_player_student_proof_file}`}
                    source={{ uri: file.url }}
                    style={styles.thumb}
                  />
                ))}
              </View>
              <View style={styles.actions}>
                <Button label="Done" onPress={() => router.back()} testID="student-proof-done" />
                <Button
                  label="Reopen to edit"
                  variant="secondary"
                  onPress={() => void handleReopen()}
                  loading={reopenMutation.isPending}
                  testID="student-proof-reopen"
                />
                <Button
                  label="Discard proof"
                  variant="secondary"
                  onPress={() => void handleDiscard()}
                  loading={discardMutation.isPending}
                  testID="student-proof-discard"
                />
              </View>
            </View>
          ) : done ? (
            <StatusBanner variant="success" style={styles.banner} message="Submitted for review." />
          ) : null}

          {editable ? (
            <View style={styles.block} testID="student-proof-form">
              <Text style={styles.label}>
                Student ID photos ({fileCount}/{MAX_STUDENT_PROOF_FILES})
              </Text>

              <View style={styles.thumbRow}>
                {pending
                  ? serverFiles.map((file) => (
                      <View key={file.id_player_student_proof_file} style={styles.thumbWrap}>
                        <Image
                          testID={`student-proof-file-${file.id_player_student_proof_file}`}
                          source={{ uri: file.url }}
                          style={styles.thumb}
                        />
                        <Pressable
                          accessibilityLabel="Remove file"
                          testID={`student-proof-remove-file-${file.id_player_student_proof_file}`}
                          style={styles.removeBtn}
                          disabled={busy}
                          onPress={() =>
                            void handleRemoveServerFile(file.id_player_student_proof_file)
                          }
                        >
                          <Text style={styles.removeText}>×</Text>
                        </Pressable>
                      </View>
                    ))
                  : localUris.map((uri, index) => (
                      <View key={`${uri}-${index}`} style={styles.thumbWrap}>
                        <Image
                          testID={`student-proof-local-file-${index}`}
                          source={{ uri }}
                          style={styles.thumb}
                        />
                        <Pressable
                          accessibilityLabel="Remove file"
                          testID={`student-proof-remove-local-${index}`}
                          style={styles.removeBtn}
                          onPress={() =>
                            setLocalUris((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          <Text style={styles.removeText}>×</Text>
                        </Pressable>
                      </View>
                    ))}
              </View>

              {canAddFile ? (
                <PhotoUploadSlot
                  testID="student-proof-add-file"
                  uri={null}
                  onSelect={(uri) => void handlePickFile(uri)}
                  allowsEditing={false}
                  fill
                  fillHeight={120}
                  loading={addFileMutation.isPending}
                  label={fileCount === 0 ? 'Upload student ID' : 'Add another file'}
                />
              ) : (
                <Text style={styles.meta} testID="student-proof-max-files">
                  Maximum of {MAX_STUDENT_PROOF_FILES} files reached. Remove one to add another.
                </Text>
              )}
              {showErrors && !hasFile ? (
                <Text style={styles.error} testID="student-proof-file-error">
                  Add at least one photo of your student ID.
                </Text>
              ) : null}

              <Text style={[styles.label, styles.labelSpaced]}>Student until</Text>
              <TextInput
                testID="student-until-input"
                style={styles.input}
                value={studentUntil}
                onChangeText={setStudentUntil}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.INACTIVE}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />
              {showErrors && dateProblem ? (
                <Text style={styles.error} testID="student-until-error">
                  {dateProblem}
                </Text>
              ) : null}

              <Button
                label="Submit for review"
                onPress={() => void handleSubmit()}
                loading={busy}
                style={styles.submit}
                testID="student-proof-submit"
              />
              {pending ? (
                <Button
                  label="Discard draft"
                  variant="secondary"
                  onPress={() => void handleDiscard()}
                  loading={discardMutation.isPending}
                  style={styles.discard}
                  testID="student-proof-discard"
                />
              ) : null}
            </View>
          ) : null}
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
    lineHeight: 20,
    color: Colors.CREAM,
    marginTop: 12,
  },
  banner: {
    marginTop: 16,
  },
  block: {
    marginTop: 24,
  },
  label: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
    marginBottom: 8,
  },
  labelSpaced: {
    marginTop: 20,
  },
  thumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.DARK_GRAY,
  },
  removeText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    lineHeight: 20,
    color: Colors.WHITE,
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
  error: {
    marginTop: 6,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.RED,
  },
  meta: {
    marginTop: 12,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  actions: {
    marginTop: 16,
    gap: 12,
  },
  submit: {
    marginTop: 24,
  },
  discard: {
    marginTop: 12,
  },
});
