"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ChevronRight,
  ArrowUpDown,
  Users,
  CalendarClock,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/shared/Badge";
import type { PatientRow } from "@/app/doctor/patient-list/page";

type SortKey = "name" | "lastVisit" | "totalVisits";

const STATUS_BADGE: Record<string, { variant: "confirmed" | "pending" | "followup" | "cancelled" | "completed"; label: string }> = {
  CONFIRMED: { variant: "confirmed", label: "Active" },
  PENDING: { variant: "pending", label: "Awaiting" },
  COMPLETED: { variant: "followup", label: "Follow-up Required" },
  CANCELLED: { variant: "cancelled", label: "Cancelled" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function PatientListClient({ patients }: { patients: PatientRow[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastVisit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const totalUpcoming = patients.reduce((sum, p) => sum + p.upcomingCount, 0);
  const activeCount = patients.filter((p) => p.lastStatus === "CONFIRMED").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = patients;
    if (q) {
      rows = rows.filter(
        (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "totalVisits") cmp = a.totalVisits - b.totalVisits;
      else cmp = new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [patients, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortButton = ({ label, sortBy }: { label: string; sortBy: SortKey }) => (
    <button
      onClick={() => toggleSort(sortBy)}
      className="flex items-center gap-1 hover:text-stone-700 transition-colors"
    >
      {label}
      <ArrowUpDown size={11} className={sortKey === sortBy ? "text-teal-600" : "text-stone-300"} />
    </button>
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Patient List</h1>
        <p className="text-stone-500 mt-1">{patients.length} registered patients</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Total Patients</p>
            <div className="p-1.5 bg-teal-50 rounded-lg">
              <Users size={14} className="text-teal-700" />
            </div>
          </div>
          <p className="text-2xl font-medium text-stone-900">{patients.length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Upcoming Visits</p>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <CalendarClock size={14} className="text-blue-700" />
            </div>
          </div>
          <p className="text-2xl font-medium text-stone-900">{totalUpcoming}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Active Patients</p>
            <div className="p-1.5 bg-green-50 rounded-lg">
              <UserCheck size={14} className="text-green-700" />
            </div>
          </div>
          <p className="text-2xl font-medium text-stone-900">{activeCount}</p>
        </div>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patients by name or email..."
          className="w-full border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-teal-200"
        />
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">
                <SortButton label="Patient" sortBy="name" />
              </th>
              <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">Email</th>
              <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">
                <SortButton label="Last Visit" sortBy="lastVisit" />
              </th>
              <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">
                <SortButton label="Visits" sortBy="totalVisits" />
              </th>
              <th className="text-left px-6 py-3.5 text-xs text-stone-400 uppercase tracking-wider font-medium">Status</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-stone-400 py-12 text-sm">
                  {patients.length === 0
                    ? "No patients yet."
                    : `No patients match "${query}".`}
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const badge = STATUS_BADGE[p.lastStatus] ?? { variant: "completed" as const, label: p.lastStatus };
                return (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-medium shrink-0">
                          {initials(p.name)}
                        </div>
                        <span className="text-sm font-medium text-stone-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">{p.email}</td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {new Date(p.lastVisit).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">{p.totalVisits}</td>
                    <td className="px-6 py-4">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/doctor/patient-list/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-medium"
                      >
                        Open Chart
                        <ChevronRight size={13} />
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
  );
}