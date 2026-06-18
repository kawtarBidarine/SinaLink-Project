import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";
import { StatusTracker } from "@/components/features/StatusTracker";
import {
  CalendarDays,
  ClipboardList,
  Droplet,
  Stethoscope,
  Video,
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
} from "lucide-react";

export const revalidate = 30;

export default async function PatientDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "PATIENT") redirect("/auth/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        where: { dateTime: { gte: new Date() } },
        include: { doctor: { include: { user: true } } },
        orderBy: { dateTime: "asc" },
        take: 3,
      },
    },
  });

  if (!patient) redirect("/auth/signup");

  const nextAppt = patient.appointments[0];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/patient/dashboard" session={session} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl text-stone-900">
              Hello, {session.user?.name?.split(" ")[0]}
            </h1>
            <p className="text-stone-500 mt-1">Your health, at a glance</p>
          </div>
          <a
            href="/patient/appointments"
            className="hidden sm:flex items-center gap-2 bg-teal-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
          >
            <CalendarPlus size={16} />
            Book Appointment
          </a>
        </div>

        {nextAppt && (
          <StatusTracker
            patientId={patient.id}
            appointmentId={nextAppt.id}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Next Appointment</p>
              <div className="p-1.5 bg-teal-50 rounded-lg">
                <CalendarDays size={14} className="text-teal-700" />
              </div>
            </div>
            <p className="text-xl font-medium text-stone-900">
              {nextAppt
                ? new Date(nextAppt.dateTime).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
                : "None scheduled"}
            </p>
            {nextAppt && (
              <p className="text-xs text-teal-600 mt-1">Dr. {nextAppt.doctor.user.name}</p>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Total Appointments</p>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <ClipboardList size={14} className="text-blue-700" />
              </div>
            </div>
            <p className="text-2xl font-medium text-stone-900">{patient.appointments.length}</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-stone-400 uppercase tracking-wider">Blood Type</p>
              <div className="p-1.5 bg-red-50 rounded-lg">
                <Droplet size={14} className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-medium text-stone-900">{patient.bloodType ?? "—"}</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 font-medium text-stone-700 text-sm uppercase tracking-wide">
              <CalendarDays size={14} />
              Upcoming Appointments
            </h2>
            <a href="/patient/appointments" className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900">
              View all <ArrowRight size={12} />
            </a>
          </div>
          <div className="divide-y divide-stone-50">
            {patient.appointments.length === 0 ? (
              <div className="flex flex-col items-center text-center py-10 px-6">
                <div className="p-3 bg-stone-50 rounded-full mb-3">
                  <CalendarDays size={20} className="text-stone-300" />
                </div>
                <p className="text-sm text-stone-400 mb-3">No upcoming appointments.</p>
                <a
                  href="/patient/appointments"
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900"
                >
                  <CalendarPlus size={13} />
                  Find a doctor and book one
                </a>
              </div>
            ) : (
              patient.appointments.map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">Dr. {appt.doctor.user.name}</p>
                    <p className="flex items-center gap-1 text-xs text-stone-400">
                      <Stethoscope size={11} />
                      {appt.doctor.specialty} · {appt.reason}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {new Date(appt.dateTime).toLocaleDateString("en-GB", {
                        weekday: "short", month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Badge variant={appt.isTelehealth ? "telehealth" : "confirmed"}>
                    {appt.isTelehealth ? "Telehealth" : "In-person"}
                  </Badge>
                  {appt.isTelehealth && (
                    <button className="flex items-center gap-1.5 ml-2 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      <Video size={13} />
                      Join Call
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {patient.allergies.length > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm text-red-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <span className="font-medium">Allergies on record: </span>
              {patient.allergies.join(", ")}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
