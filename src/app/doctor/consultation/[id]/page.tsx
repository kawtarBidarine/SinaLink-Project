import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { ConsultationNotes } from "@/components/features/ConsultationNotes";
import { Badge } from "@/components/shared/Badge";

interface ConsultationPageProps {
  params: Promise<{ id: string }>;
}

async function saveNotes(appointmentId: string, content: string, prescription: string) {
  "use server";
  await fetch(`${process.env.NEXTAUTH_URL}/api/appointments/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointmentId, content, prescription }),
  });
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  const session = await auth();
  if (!session || session.user?.role !== "DOCTOR") redirect("/auth/login");

  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: { include: { user: true } },
      patient: {
        include: {
          user: true,
          appointments: {
            orderBy: { dateTime: "desc" },
            take: 5,
            include: { medicalNote: true },
          },
        },
      },
      medicalNote: true,
    },
  });

  if (!appointment) notFound();

  // Verify this doctor owns this appointment
  if (appointment.doctor.userId !== session.user.id) redirect("/doctor/dashboard");

  const patient = appointment.patient;
  const initials = patient.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/doctor/patient-list" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <a href="/doctor/patient-list" className="text-xs text-stone-400 hover:text-stone-600 mb-1 block">
              ← Back to patients
            </a>
            <h1 className="font-serif text-2xl text-stone-900">
              Consultation — {patient.user.name}
            </h1>
          </div>
          <Badge variant={appointment.isTelehealth ? "telehealth" : "confirmed"}>
            {appointment.isTelehealth ? "Telehealth" : "In-person"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT — Video + patient summary */}
          <div className="space-y-4">
            {/* Video mock */}
            <div className="bg-stone-800 rounded-2xl overflow-hidden aspect-video flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-serif text-white mx-auto mb-3">
                  {initials}
                </div>
                <p className="text-white/70 text-sm">{patient.user.name}</p>
              </div>

              {/* Live indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white text-xs font-medium">LIVE</span>
              </div>

              {/* Self-view thumbnail */}
              <div className="absolute bottom-4 right-4 w-20 h-14 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white/40 text-xs">You</span>
              </div>

              {/* Video controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {[
                  { icon: "🎤", label: "Mute", bg: "bg-white/20" },
                  { icon: "📷", label: "Camera", bg: "bg-white/20" },
                  { icon: "✕", label: "End call", bg: "bg-red-600" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    className={`w-9 h-9 rounded-full ${btn.bg} flex items-center justify-center text-white text-sm hover:opacity-80 transition-opacity`}
                    title={btn.label}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient summary card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs text-stone-400 uppercase tracking-wider">Patient Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: "Date of Birth", value: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB") : "—" },
                  { label: "Blood Type", value: patient.bloodType ?? "—" },
                  { label: "Allergies", value: patient.allergies.length ? patient.allergies.join(", ") : "None on record" },
                  { label: "Appointment", value: new Date(appointment.dateTime).toLocaleDateString("en-GB", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-stone-400 mb-0.5">{item.label}</p>
                    <p className="text-sm text-stone-800">{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-stone-400 mb-1">Reason for visit</p>
                <p className="text-sm text-stone-700">{appointment.reason}</p>
              </div>
            </div>

            {/* Visit history */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-3">Visit History</h3>
              <div className="space-y-2">
                {patient.appointments
                  .filter((a) => a.id !== appointment.id)
                  .slice(0, 4)
                  .map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">
                        {new Date(a.dateTime).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-xs text-stone-400 truncate max-w-[120px]">
                        {a.medicalNote ? "Notes available" : "No notes"}
                      </span>
                      <Badge variant={a.status === "COMPLETED" ? "completed" : "pending"}>
                        {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                {patient.appointments.length <= 1 && (
                  <p className="text-xs text-stone-400">First visit with this doctor.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — Notes editor */}
          <div className="h-full">
            <ConsultationNotes
              appointmentId={appointment.id}
              initialContent={appointment.medicalNote?.content ?? ""}
              initialPrescription={appointment.medicalNote?.prescription ?? ""}
              onSave={saveNotes.bind(null, appointment.id)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
