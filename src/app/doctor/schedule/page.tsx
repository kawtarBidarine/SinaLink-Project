import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";

export const revalidate = 30;

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default async function SchedulePage() {
  const session = await auth();
  if (!session || session.user?.role !== "DOCTOR") redirect("/auth/login");

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        where: {
          dateTime: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            lte: new Date(new Date().setDate(new Date().getDate() + 14)),
          },
        },
        include: { patient: { include: { user: true } } },
        orderBy: { dateTime: "asc" },
      },
    },
  });

  if (!doctor) redirect("/auth/signup");

  const today = new Date();
  const weekDates = getWeekDates(today);
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const apptsByDay = new Map<string, typeof doctor.appointments>();
  for (const appt of doctor.appointments) {
    const key = appt.dateTime.toDateString();
    if (!apptsByDay.has(key)) apptsByDay.set(key, []);
    apptsByDay.get(key)!.push(appt);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/doctor/schedule" session={session} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-stone-900">Schedule</h1>
          <p className="text-stone-500 mt-1">
            Week of {weekDates[0].toLocaleDateString("en-GB", { month: "long", day: "numeric" })} –{" "}
            {weekDates[6].toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          {[
            { color: "bg-teal-100", label: "In-person" },
            { color: "bg-blue-100", label: "Telehealth" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs text-stone-500">
              <span className={`inline-block w-3 h-3 rounded ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {weekDates.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString();
            const dayAppts = apptsByDay.get(date.toDateString()) ?? [];
            return (
              <div
                key={date.toISOString()}
                className={`bg-white border rounded-xl p-3 min-h-[140px] ${
                  isToday ? "border-teal-400 ring-1 ring-teal-200" : "border-stone-200"
                }`}
              >
                <div className="mb-2">
                  <p className="text-xs text-stone-400">{DAY_LABELS[i]}</p>
                  <p className={`text-sm font-medium ${isToday ? "text-teal-700" : "text-stone-700"}`}>
                    {date.getDate()}
                  </p>
                </div>
                <div className="space-y-1">
                  {dayAppts.map((appt) => (
                    <a
                      key={appt.id}
                      href={`/doctor/consultation/${appt.id}`}
                      className={`block px-2 py-1 rounded-md text-xs leading-tight hover:opacity-80 ${
                        appt.isTelehealth ? "bg-blue-100 text-blue-800" : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      <div className="font-medium">
                        {appt.dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="truncate">{appt.patient.user.name.split(" ")[0]}</div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-medium text-stone-700 text-sm uppercase tracking-wide">Upcoming Appointments</h2>
          </div>
          <div className="divide-y divide-stone-50">
            {doctor.appointments
              .filter((a) => a.dateTime >= today)
              .slice(0, 8)
              .map((appt) => (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50/50">
                  <div className="text-xs text-stone-400 w-32 shrink-0">
                    {appt.dateTime.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}{" "}
                    {appt.dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">{appt.patient.user.name}</p>
                    <p className="text-xs text-stone-400">{appt.reason}</p>
                  </div>
                  <Badge variant={appt.isTelehealth ? "telehealth" : "confirmed"}>
                    {appt.isTelehealth ? "Telehealth" : "In-person"}
                  </Badge>
                  <a href={`/doctor/consultation/${appt.id}`} className="text-xs text-teal-700 font-medium hover:text-teal-900">
                    Open →
                  </a>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}