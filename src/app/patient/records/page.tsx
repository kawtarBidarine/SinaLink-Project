import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";
import {
  FileText,
  Pill,
  Droplet,
  AlertTriangle,
  Stethoscope,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";

export const revalidate = 30;

export default async function PatientRecordsPage() {
  const session = await auth();
  if (!session || session.user?.role !== "PATIENT") redirect("/auth/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        where: { status: "COMPLETED" },
        include: {
          doctor: { include: { user: true } },
          medicalNote: true,
        },
        orderBy: { dateTime: "desc" },
      },
    },
  });

  if (!patient) redirect("/auth/signup");

  const records = patient.appointments.filter((a) => a.medicalNote);
  const prescriptionCount = records.filter((a) => a.medicalNote?.prescription).length;
  const hasNew = records.length > 0 && (() => {
    const latest = new Date(records[0].dateTime);
    const diffDays = (Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 7;
  })();

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/patient/records" session={session} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-stone-900">My Records</h1>
          <p className="text-stone-500 mt-1">Secure medical documents from your visits</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Total Visits</p>
              <div className="p-1.5 bg-teal-50 rounded-lg">
                <CalendarCheck size={14} className="text-teal-700" />
              </div>
            </div>
            <p className="text-2xl font-medium text-stone-900">{patient.appointments.length}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Documents</p>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <FileText size={14} className="text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-medium text-stone-900">{records.length}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Prescriptions</p>
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <Pill size={14} className="text-amber-700" />
              </div>
            </div>
            <p className="text-2xl font-medium text-stone-900">{prescriptionCount}</p>
          </div>
        </div>

        {hasNew && (
          <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">New record available</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Notes from Dr. {records[0].doctor.user.name} ·{" "}
                {new Date(records[0].dateTime).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide">
              Documents ({records.length})
            </h2>
          </div>
          {records.length === 0 ? (
            <div className="flex flex-col items-center text-center py-14 px-6">
              <div className="p-3 bg-stone-50 rounded-full mb-3">
                <FileText size={20} className="text-stone-300" />
              </div>
              <p className="text-sm text-stone-400">
                No records yet. They will appear here after your consultations.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-50">
              {records.map((appt, idx) => {
                const isNew = idx === 0 && hasNew;
                return (
                  <a
                    key={appt.id}
                    href={`/patient/records/${appt.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-900">Consultation Notes</p>
                        {isNew && <Badge variant="followup">New</Badge>}
                      </div>
                      <p className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                        <Stethoscope size={11} />
                        Dr. {appt.doctor.user.name} · {appt.doctor.specialty}
                      </p>
                      <p className="text-xs text-stone-400">
                        {new Date(appt.dateTime).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    {appt.medicalNote?.prescription && (
                      <Badge variant="confirmed">Prescription included</Badge>
                    )}
                    <ChevronRight size={16} className="text-stone-300 shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-5">
          <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-4">Health Summary</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <Droplet size={12} />
                Blood Type
              </p>
              <p className="text-sm font-medium text-stone-900">{patient.bloodType ?? "Not recorded"}</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <AlertTriangle size={12} />
                Allergies
              </p>
              <p className="text-sm font-medium text-stone-900">
                {patient.allergies.length ? patient.allergies.join(", ") : "None on record"}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <CalendarCheck size={12} />
                Total Visits
              </p>
              <p className="text-sm font-medium text-stone-900">{patient.appointments.length}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}