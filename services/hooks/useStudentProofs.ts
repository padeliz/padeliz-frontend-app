import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  addStudentProofFile,
  createStudentProof,
  discardStudentProof,
  fetchStudentProofs,
  markStudentProofReady,
  removeStudentProofFile,
  reopenStudentProof,
  updateStudentProofDate,
  type CreateStudentProofInput,
  type StudentProofFileInput,
} from "@/services/studentProofs";
import { toQueryState, useViewer } from "@/services/hooks/queryState";

export function useStudentProofs(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.studentProofs.list(viewer),
      queryFn: ({ signal }) => fetchStudentProofs(signal),
      enabled: enabled && isAuthed,
      staleTime: 0,
    })
  );
}

function useStudentProofMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>
) {
  const queryClient = useQueryClient();
  const { viewer } = useViewer();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.studentProofs.all(viewer),
      });
    },
  });
}

/** Create the pending proof (`student_until` + 1-3 files). */
export function useCreateStudentProofMutation() {
  return useStudentProofMutation((input: CreateStudentProofInput) =>
    createStudentProof(input)
  );
}

/** Update the pending proof's `student_until`. */
export function useUpdateStudentProofDateMutation() {
  return useStudentProofMutation((studentUntil: string) =>
    updateStudentProofDate(studentUntil)
  );
}

/** Append one file to the pending proof. */
export function useAddStudentProofFileMutation() {
  return useStudentProofMutation((file: StudentProofFileInput) =>
    addStudentProofFile(file)
  );
}

/** Remove one file from the pending proof. */
export function useRemoveStudentProofFileMutation() {
  return useStudentProofMutation((fileId: number) =>
    removeStudentProofFile(fileId)
  );
}

export function useMarkStudentProofReadyMutation() {
  return useStudentProofMutation(() => markStudentProofReady());
}

export function useReopenStudentProofMutation() {
  return useStudentProofMutation(() => reopenStudentProof());
}

export function useDiscardStudentProofMutation() {
  return useStudentProofMutation(() => discardStudentProof());
}
