import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";
import { BookAppointmentSection } from "@/components/features/BookAppointmentSection";
import { CalendarClock, History, Video, Stethoscope } from "lucide-react";

export const revalidate = 30;

export default async function PatientAppointmentsPage() {
  const session = await auth();
  if (!session || session.user?.role !== "PATIENT") redirect("/auth/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        include: { doctor: { include: { user: true } } },
        orderBy: { dateTime: "desc" },
      },
    },
  });

  if (!patient) redirect("/auth/signup");

  const now = new Date();
  const upcoming = patient.appointments.filter((a) => a.dateTime >= now);
  const past = patient.appointments.filter((a) => a.dateTime < now);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/patient/appointments" session={session} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-stone-900">My Appointments</h1>
          <p className="text-stone-500 mt-1">Your upcoming and past visits</p>
        </div>

        <BookAppointmentSection />

        <div className="mb-6">
          <h2 className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-wider mb-3">
            <CalendarClock size={14} />
            Upcoming
          </h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            {upcoming.length === 0 ? (
              <p className="text-center text-stone-400 py-10 text-sm">No upcoming appointments.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {upcoming.map((appt) => {
                  const docName = appt.doctor.user.name;
                  const initials = docName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={appt.id} className="flex items-center gap-4 px-6 py-5">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-medium shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">Dr. {docName}</p>
                        <p className="flex items-center gap-1 text-xs text-stone-400">
                          <Stethoscope size={11} />
                          {appt.doctor.specialty}
                        </p>
                        <p className="text-xs text-stone-500 mt-1">{appt.reason}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {new Date(appt.dateTime).toLocaleDateString("en-GB", {
                            weekday: "long", day: "numeric", month: "long",
                          })}{" at "}
                          {new Date(appt.dateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={appt.isTelehealth ? "telehealth" : "confirmed"}>
                          {appt.isTelehealth ? "Telehealth" : "In-person"}
                        </Badge>
                        {appt.isTelehealth && appt.meetingLink && (
                          <a
                            href={appt.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Video size={13} />
                            Join Video Call
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-1.5 text-xs text-stone-400 uppercase tracking-wider mb-3">
            <History size={14} />
            Past Visits
          </h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            {past.length === 0 ? (
              <p className="text-center text-stone-400 py-10 text-sm">No past visits.</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {past.map((appt) => {
                  const docName = appt.doctor.user.name;
                  const initials = docName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={appt.id} className="flex items-center gap-4 px-6 py-4 opacity-70">
                      <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-medium shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-700">Dr. {docName}</p>
                        <p className="text-xs text-stone-400 truncate">{appt.reason}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {new Date(appt.dateTime).toLocaleDateString("en-GB", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant="completed">Completed</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}