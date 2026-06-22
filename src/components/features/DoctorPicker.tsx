"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Search,
  Stethoscope,
  MessageSquareText,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentModal, type AppointmentFormData } from "./AppointmentModal";

const SPECIALTIES = [
  "All",
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Psychiatry",
];

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  patient: { user: { name: string } };
}

interface DoctorItem {
  id: string;
  specialty: string;
  bio: string | null;
  rating: number;
  reviewCount: number;
  user: { name: string; image: string | null };
  reviews: ReviewItem[];
}

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function RatingStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
          )}
        />
      ))}
    </div>
  );
}

export function DoctorPicker({ onBooked }: { onBooked?: () => void }) {
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<DoctorItem | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/doctors?specialty=${encodeURIComponent(specialty)}`)
      .then((res) => res.json())
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [specialty]);

  const filtered = doctors.filter((d) =>
    d.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = async (data: AppointmentFormData) => {
    setBookingError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.details?.fieldErrors?.reason?.[0] ??
          body?.error ??
          "Something went wrong while booking. Please try again.";
        setBookingError(message);
        return; // keep modal open so the user can fix the input
      }

      setBookingError(null);
      setBookingDoctor(null);
      onBooked?.();
    } catch {
      setBookingError("Network error — please check your connection and try again.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-teal-50 rounded-lg">
          <Stethoscope size={18} className="text-teal-700" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-stone-700 uppercase tracking-wide">Find a Doctor</h2>
          <p className="text-xs text-stone-400">Choose a specialty that matches your case</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search doctors by name..."
          className="w-full border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200 bg-white"
        />
      </div>

      {/* Specialty filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSpecialty(s)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
              specialty === s
                ? "bg-teal-700 text-white border-teal-700"
                : "bg-white text-stone-600 border-stone-200 hover:border-teal-300"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Doctor grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-stone-400 gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading doctors...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">
          No doctors found for this specialty.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => {
            const isExpanded = expandedId === doc.id;
            return (
              <div
                key={doc.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-medium shrink-0">
                    {initials(doc.user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900">{doc.user.name}</p>
                    <p className="text-xs text-teal-700">{doc.specialty}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <RatingStars rating={doc.rating} />
                      <span className="text-xs text-stone-400">
                        {doc.rating.toFixed(1)} · {doc.reviewCount} reviews
                      </span>
                    </div>
                  </div>
                </div>

                {doc.bio && (
                  <p className="text-xs text-stone-500 mt-3 leading-relaxed">{doc.bio}</p>
                )}

                {/* Reviews toggle */}
                {doc.reviews.length > 0 && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mt-3 transition-colors"
                  >
                    <MessageSquareText size={13} />
                    {isExpanded ? "Hide reviews" : `Read ${doc.reviews.length} review${doc.reviews.length > 1 ? "s" : ""}`}
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}

                {isExpanded && (
                  <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
                    {doc.reviews.map((r) => (
                      <div key={r.id} className="text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-stone-700">{r.patient.user.name}</span>
                          <RatingStars rating={r.rating} size={11} />
                        </div>
                        {r.comment && <p className="text-stone-500 mt-0.5">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setBookingError(null);
                    setBookingDoctor(doc);
                  }}
                  className="mt-4 flex items-center justify-center gap-2 w-full bg-teal-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
                >
                  <CalendarPlus size={15} />
                  Book Appointment
                </button>
              </div>
            );
          })}
        </div>
      )}

      {bookingDoctor && (
        <AppointmentModal
          doctorId={bookingDoctor.id}
          doctorName={bookingDoctor.user.name}
          errorMessage={bookingError}
          onClose={() => {
            setBookingDoctor(null);
            setBookingError(null);
          }}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}