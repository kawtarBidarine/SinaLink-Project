import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";
import {
  CalendarDays,
  UserCheck,
  Video,
  Stethoscope,
  ChevronRight,
  CalendarX,
  Users,
} from "lucide-react";

export const revalidate = 30;

export default async function DoctorDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "DOCTOR") redirect("/auth/login");

  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        where: { dateTime: { gte: startOfToday, lte: endOfWeek } },
        include: { patient: { include: { user: true } } },
        orderBy: { dateTime: "asc" },
      },
    },
  });

  if (!doctor) redirect("/auth/signup");

  const today = doctor.appointments.filter(
    (a) => a.dateTime >= startOfToday && a.dateTime <= endOfToday
  );
  const restOfWeek = doctor.appointments.filter((a) => a.dateTime > endOfToday);

  const checkedIn = today.filter((a) => a.status === "CONFIRMED").length;
  const telehealth = today.filter((a) => a.isTelehealth).length;
  const uniquePatientsThisWeek = new Set(doctor.appointments.map((a) => a.patient.id)).size;

  const statusVariant = (status: string) =>
    status === "CONFIRMED" ? "confirmed"
    : status === "PENDING" ? "pending"
    : status === "CANCELLED" ? "cancelled"
    : "completed";

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/doctor/dashboard" session={session} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-stone-900">
            Good morning, {session.user?.name?.split(" ")[0] ?? "Doctor"}
          </h1>
          <p className="text-stone-500 mt-1">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {today.length} patient{today.length === 1 ? "" : "s"} scheduled today
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's Appointments", value: today.length, icon: CalendarDays, bg: "bg-teal-50", color: "text-teal-700" },
            { label: "Checked In", value: checkedIn, icon: UserCheck, bg: "bg-green-50", color: "text-green-700" },
            { label: "Telehealth", value: telehealth, icon: Video, bg: "bg-blue-50", color: "text-blue-700" },
            { label: "Patients This Week", value: uniquePatientsThisWeek, icon: Users, bg: "bg-amber-50", color: "text-amber-700" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-stone-400 uppercase tracking-wider">{stat.label}</p>
                <div className={`p-1.5 ${stat.bg} rounded-lg`}>
                  <stat.icon size={14} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-medium text-stone-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Today's schedule — main column */}
          <div className="col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide">
                Today&apos;s Schedule
              </h2>
              <a href="/doctor/schedule" className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900">
                Full schedule <ChevronRight size={12} />
              </a>
            </div>
            <div className="divide-y divide-stone-50">
              {today.length === 0 ? (
                <div className="flex flex-col items-center text-center py-14 px-6">
                  <div className="p-3 bg-stone-50 rounded-full mb-3">
                    <CalendarX size={20} className="text-stone-300" />
                  </div>
                  <p className="text-sm text-stone-400">No appointments scheduled for today.</p>
                </div>
              ) : (
                today.map((appt) => {
                  const patientName = appt.patient.user.name;
                  const patientInitials = patientName
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
                        {patientInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">{patientName}</p>
                        <p className="text-xs text-stone-400 truncate">{appt.reason}</p>
                      </div>
                      <Badge variant={statusVariant(appt.status)}>
                        {appt.status.charAt(0) + appt.status.slice(1).toLowerCase()}
                      </Badge>
                      {appt.isTelehealth && (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <Video size={12} />
                        </span>
                      )}
                      <a
                        href={`/doctor/consultation/${appt.id}`}
                        className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-medium ml-2"
                      >
                        Open <ChevronRight size={12} />
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* This week — side column */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide">
                Rest of the Week
              </h2>
            </div>
            <div className="divide-y divide-stone-50">
              {restOfWeek.length === 0 ? (
                <p className="text-center text-stone-400 py-10 text-xs px-4">
                  Nothing else scheduled this week.
                </p>
              ) : (
                restOfWeek.slice(0, 6).map((appt) => (
                  <a
                    key={appt.id}
                    href={`/doctor/consultation/${appt.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="text-center w-10 shrink-0">
                      <p className="text-[10px] text-stone-400 uppercase">
                        {appt.dateTime.toLocaleDateString("en-GB", { weekday: "short" })}
                      </p>
                      <p className="text-sm font-medium text-stone-700">{appt.dateTime.getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-900 truncate">{appt.patient.user.name}</p>
                      <p className="flex items-center gap-1 text-[11px] text-stone-400">
                        <Stethoscope size={10} />
                        {appt.dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}