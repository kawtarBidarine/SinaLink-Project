import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { PatientListClient } from "@/components/features/PatientListClient";

export const revalidate = 30;

export interface PatientRow {
  id: string;
  name: string;
  email: string;
  lastVisit: string; // ISO string — serializable for client component
  lastStatus: string;
  totalVisits: number;
  upcomingCount: number;
}

export default async function PatientListPage() {
  const session = await auth();
  if (!session || session.user?.role !== "DOCTOR") redirect("/auth/login");

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        include: { patient: { include: { user: true } } },
        orderBy: { dateTime: "desc" },
      },
    },
  });

  if (!doctor) redirect("/auth/signup");

  const now = new Date();
  const patientMap = new Map<string, PatientRow>();

  for (const appt of doctor.appointments) {
    const pid = appt.patient.id;
    const isUpcoming = appt.dateTime >= now && appt.status !== "CANCELLED";

    if (!patientMap.has(pid)) {
      patientMap.set(pid, {
        id: pid,
        name: appt.patient.user.name,
        email: appt.patient.user.email,
        lastVisit: appt.dateTime.toISOString(),
        lastStatus: appt.status,
        totalVisits: 1,
        upcomingCount: isUpcoming ? 1 : 0,
      });
    } else {
      const row = patientMap.get(pid)!;
      row.totalVisits += 1;
      if (isUpcoming) row.upcomingCount += 1;
    }
  }

  const patients = Array.from(patientMap.values());

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/doctor/patient-list" session={session} />
      <PatientListClient patients={patients} />
    </div>
  );
}