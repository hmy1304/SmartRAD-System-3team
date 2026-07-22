export type ApprovalPriority = "urgent" | "normal";

export type AvatarTone = "blue" | "green" | "purple" | "yellow" | "red";

export interface ApprovalSummary {
  totalPending: number;
  urgentPending: number;
  dueToday: number;
  processedThisMonth: number;
  approvalRate: number;
}

export interface ApprovalDocument {
  id: string;

  priority: ApprovalPriority;
  priorityLabel: string;

  title: string;
  attachment: string;

  drafter: string;
  drafterInitial: string;
  drafterDepartment: string;
  drafterRole: string;
  avatarTone: AvatarTone;

  requestedAt: string;
  dDay: string;

  description: string;
  fileName: string;
  fileMeta: string;
}

export interface ApprovalComment {
  id: number;
  documentId: string;

  initial: string;
  name: string;
  tag?: string;
  time: string;
  content: string;
  avatarTone: AvatarTone;
}

export interface ApprovalInboxData {
  summary: ApprovalSummary;
  documents: ApprovalDocument[];
  comments: ApprovalComment[];
}
