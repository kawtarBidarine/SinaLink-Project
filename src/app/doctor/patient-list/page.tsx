import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/shared/Badge";

export default async function PatientListPage() {
  const session = await auth();
  if (!session || session.user?.role !== "DOCTOR") redirect("/auth/login");

  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
    include: {
      appointments: {
        include: {
          patient: {
            include: { user: true },
          },
        },
        orderBy: { dateTime: "desc" },
      },
    },
  });

  if (!doctor) redirect("/auth/signup");

  // Deduplicate patients, keeping latest appointment status
  const patientMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      lastVisit: Date;
      lastStatus: string;
      totalVisits: number;
    }
  >();

  for (const appt of doctor.appointments) {
    const pid = appt.patient.id;
    if (!patientMap.has(pid)) {
      patientMap.set(pid, {
        id: pid,
        name: appt.patient.user.name,
        email: appt.patient.user.email,
        lastVisit: appt.dateTime,
        lastStatus: appt.status,
        totalVisits: 1,
      });
    } else {
      const existing = patientMap.get(pid)!;
      existing.totalVisits += 1;
    }
  }

  const patients = Array.from(patientMap.values());

  const statusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED": return { variant: "confirmed" as const, label: "Active" };
      case "PENDING":   return { variant: "pending" as const,   label: "Awaiting" };
      case "COMPLETED": return { variant: "followup" as const,  label: "Follow-up Required" };
      case "CANCELLED": return { variant: "cancelled" as const, label: "Cancelled" };
      default:          return { variant: "completed" as const, label: status };
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar currentPath="/doctor/patient-list" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-stone-900">Patient List</h1>
            <p className="text-stone-500 mt-1">{patients.length} registered patients</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search patients by name or email..."
            className="w-full max-w-md border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">Patient</th>
                <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">Email</th>
                <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">Last Visit</th>
                <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">Visits</th>
                <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">Status</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-stone-400 py-12 text-sm">
                    No patients yet.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const { variant, label } = statusBadge(p.lastStatus);
                  const initials = p.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-medium shrink-0">
                            {initials}
                          </div>
                          <span className="text-sm font-medium text-stone-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">{p.email}</td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        {p.lastVisit.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">{p.totalVisits}</td>
                      <td className="px-6 py-4">
                        <Badge variant={variant}>{label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={`/doctor/patient-list/${p.id}`}
                          className="text-xs text-teal-700 hover:text-teal-900 font-medium"
                        >
                          Open Chart →
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
