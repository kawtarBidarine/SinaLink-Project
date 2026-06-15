"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentModalProps {
  doctorId: string;
  doctorName: string;
  onClose: () => void;
  onConfirm: (data: AppointmentFormData) => Promise<void>;
}

export interface AppointmentFormData {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  isTelehealth: boolean;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export function AppointmentModal({
  doctorId,
  doctorName,
  onClose,
  onConfirm,
}: AppointmentModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [isTelehealth, setIsTelehealth] = useState(false);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    if (!date || !time || !reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm({ doctorId, date, time, reason, isTelehealth });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-lg text-stone-900">Book Appointment</h2>
            <p className="text-sm text-stone-500 mt-0.5">with {doctorName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-50 text-stone-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Consultation type */}
          <div className="flex rounded-xl overflow-hidden border border-stone-200">
            <button
              onClick={() => setIsTelehealth(false)}
              className={cn(
                "flex-1 py-3 text-sm transition-colors",
                !isTelehealth ? "bg-teal-700 text-white font-medium" : "text-stone-500 hover:bg-stone-50"
              )}
            >
              In-person
            </button>
            <button
              onClick={() => setIsTelehealth(true)}
              className={cn(
                "flex-1 py-3 text-sm transition-colors",
                isTelehealth ? "bg-teal-700 text-white font-medium" : "text-stone-500 hover:bg-stone-50"
              )}
            >
              Telehealth
            </button>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Date</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {/* Time slots */}
          <div>
            <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Time</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={cn(
                    "py-2 rounded-lg text-sm border transition-colors",
                    time === slot
                      ? "bg-teal-700 text-white border-teal-700"
                      : "border-stone-200 text-stone-600 hover:border-teal-300"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs text-stone-500 mb-2 uppercase tracking-wide">Reason for visit</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your symptoms or reason..."
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200 resize-none"
            />
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleSubmit}
            disabled={!date || !time || !reason.trim() || loading}
            className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
