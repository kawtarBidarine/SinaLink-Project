import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";

export default async function DoctorDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "DOCTOR") redirect("/auth/login");

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        where: {
          dateTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        include: { patient: { include: { user: true } } },
        orderBy: { dateTime: "asc" },
      },
    },
  });

  if (!doctor) redirect("/auth/signup");

  const today = doctor.appointments;
  const checkedIn = today.filter((a) => a.status === "CONFIRMED").length;
  const telehealth = today.filter((a) => a.isTelehealth).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/doctor/dashboard" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-stone-900">
            Good morning, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-stone-500 mt-1">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {today.length} patients scheduled today
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's Appointments", value: today.length },
            { label: "Checked In", value: checkedIn },
            { label: "Telehealth", value: telehealth },
            { label: "Specialty", value: doctor.specialty },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-stone-200 rounded-xl p-5">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-2xl font-medium text-stone-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide">
              Today&apos;s Schedule
            </h2>
          </div>
          <div className="divide-y divide-stone-50">
            {today.length === 0 ? (
              <p className="text-center text-stone-400 py-12 text-sm">
                No appointments scheduled for today.
              </p>
            ) : (
              today.map((appt) => {
                const patientName = appt.patient.user.name;
                const initials = patientName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50/50 transition-colors">
                    <span className="text-xs text-stone-400 w-14 shrink-0">
                      {new Date(appt.dateTime).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-medium shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900">{patientName}</p>
                      <p className="text-xs text-stone-400 truncate">{appt.reason}</p>
                    </div>
                    <Badge
                      variant={
                        appt.status === "CONFIRMED" ? "confirmed"
                        : appt.status === "PENDING" ? "pending"
                        : appt.status === "CANCELLED" ? "cancelled"
                        : "completed"
                      }
                    >
                      {appt.isTelehealth ? "Telehealth" : appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                    </Badge>
                    <a
                      href={`/doctor/consultation/${appt.id}`}
                      className="text-xs text-teal-700 hover:text-teal-900 font-medium ml-2"
                    >
                      Open →
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
