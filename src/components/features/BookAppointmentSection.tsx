"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, X } from "lucide-react";
import { DoctorPicker } from "@/components/features/DoctorPicker";

export function BookAppointmentSection() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleBooked = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          <CalendarPlus size={16} />
          Book a New Appointment
        </button>
      ) : (
        <div className="bg-stone-50/60 border border-stone-200 rounded-2xl p-5">
          <div className="flex items-center justify-end mb-2">
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"
            >
              <X size={16} />
            </button>
          </div>
          <DoctorPicker onBooked={handleBooked} />
        </div>
      )}
    </div>
  );
}