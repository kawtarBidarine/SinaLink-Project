// These enums mirror the Prisma schema — safe to define here
// until `prisma generate` runs in the real project
export type Role = "DOCTOR" | "PATIENT";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AppointmentWithDetails {
  id: string;
  dateTime: Date;
  status: AppointmentStatus;
  reason: string;
  meetingLink: string | null;
  isTelehealth: boolean;
  doctor: {
    id: string;
    specialty: string;
    user: { name: string; image: string | null };
  };
  patient: {
    id: string;
    user: { name: string; image: string | null };
  };
  medicalNote: { id: string; content: string } | null;
}

export interface PatientListItem {
  id: string;
  user: { name: string; email: string };
  appointments: { status: AppointmentStatus; dateTime: Date }[];
}

// Supabase Realtime channel payload for live status tracker
export interface WaitingRoomPayload {
  patientId: string;
  patientName: string;
  status: "waiting" | "chart_review" | "in_consultation" | "done";
  position: number;
}
