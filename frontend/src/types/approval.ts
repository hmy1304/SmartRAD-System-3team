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

export interface DraftSummary {
  totalDrafts: number;
  pendingDrafts: number;
  approvedThisMonth: number;
  rejectedDrafts: number;
  temporaryDrafts: number;
}

export interface DraftTabs {
  inProgress: number;
  rejected: number;
  approved: number;
  temporary: number;
}

export interface DraftDocument {
  id: number;
  number: string;
  title: string;
  attachment: string;
  kind: string;
  kindLabel: string;
  createdAt: string;
  approverInitial: string;
  approver: string;
  status: string;
  statusLabel: string;
  deadline: string;
  deadlineWarning: boolean;
  temporary: boolean;
}

export interface ApprovalDraftData {
  summary: DraftSummary;
  tabs: DraftTabs;
  documents: DraftDocument[];
}
