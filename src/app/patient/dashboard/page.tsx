import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";
import { StatusTracker } from "@/components/features/StatusTracker";

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
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-stone-900">
            Hello, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-stone-500 mt-1">Your health, at a glance</p>
        </div>

        {nextAppt && (
          <StatusTracker
            patientId={patient.id}
            appointmentId={nextAppt.id}
          />
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Next Appointment</p>
            <p className="text-xl font-medium text-stone-900">
              {nextAppt
                ? new Date(nextAppt.dateTime).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })
                : "None"}
            </p>
            {nextAppt && (
              <p className="text-xs text-teal-600 mt-1">Dr. {nextAppt.doctor.user.name}</p>
            )}
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Total Appointments</p>
            <p className="text-2xl font-medium text-stone-900">{patient.appointments.length}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Blood Type</p>
            <p className="text-2xl font-medium text-stone-900">{patient.bloodType ?? "—"}</p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide">Upcoming Appointments</h2>
            <a href="/patient/appointments" className="text-xs text-teal-700 hover:text-teal-900">View all →</a>
          </div>
          <div className="divide-y divide-stone-50">
            {patient.appointments.length === 0 ? (
              <p className="text-center text-stone-400 py-10 text-sm">No upcoming appointments.</p>
            ) : (
              patient.appointments.map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">Dr. {appt.doctor.user.name}</p>
                    <p className="text-xs text-stone-400">{appt.doctor.specialty} · {appt.reason}</p>
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
                    <button className="ml-2 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      Join Call
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {patient.allergies.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm text-red-800">
            <span className="font-medium">Allergies on record: </span>
            {patient.allergies.join(", ")}
          </div>
        )}
      </main>
    </div>
  );
}