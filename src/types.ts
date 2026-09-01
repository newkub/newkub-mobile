export type Day = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  enabled: boolean;
  repeat: Day[];
  sound: "beep" | "bell" | "ai";
  soundUrl?: string;
  aiText?: string;
}

export interface TimerPreset {
  id: string;
  name: string;
  seconds: number;
  color: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO date
  time: string; // HH:MM
  repeat: "none" | "daily" | "weekly" | "monthly";
  enabled: boolean;
  createdAt: number;
}

export interface PomodoroSession {
  date: string;
  completedCycles: number;
  totalFocusSeconds: number;
}

export type DevinSessionStatus =
  | "new"
  | "claimed"
  | "running"
  | "exit"
  | "error"
  | "suspended"
  | "resuming";

export type DevinStatusDetail =
  | "working"
  | "waiting_for_user"
  | "waiting_for_approval"
  | "finished"
  | "inactivity"
  | "user_request"
  | "usage_limit_exceeded"
  | "out_of_credits"
  | "out_of_quota"
  | "no_quota_allocation"
  | "payment_declined"
  | "org_usage_limit_exceeded"
  | "user_usage_limit_exceeded"
  | "total_session_limit_exceeded";

export interface DevinSession {
  session_id: string;
  status: DevinSessionStatus;
  status_detail?: DevinStatusDetail | null;
  title?: string | null;
  url?: string | null;
  created_at?: number;
  updated_at?: number;
  is_archived?: boolean;
  devin_mode?: string | null;
}

export interface DevinMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool" | string;
  content: string;
  created_at?: number;
  attachments?: { url: string }[];
}

export interface DevinSettings {
  orgId: string;
  apiKey: string;
  useProxy: boolean;
  notifyCompleted: boolean;
  notifyWaiting: boolean;
}
