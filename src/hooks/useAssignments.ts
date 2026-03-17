import { useAssignmentsContext } from "@/providers/AssignmentsProvider";
export type { Assignment, Subject, Attachment } from "@/types/assignment";

export function useAssignments() {
  return useAssignmentsContext();
}
