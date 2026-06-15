"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { WaitingRoomPayload } from "@/types";

interface StatusTrackerProps {
  patientId: string;
  appointmentId: string;
}

const STATUS_MESSAGES: Record<WaitingRoomPayload["status"], { title: string; subtitle: string; color: string }> = {
  waiting:         { title: "You are in the waiting room", subtitle: "The doctor will be with you shortly", color: "bg-amber-50 border-amber-200 text-amber-900" },
  chart_review:    { title: "Doctor is reviewing your chart", subtitle: "You are next in line", color: "bg-teal-50 border-teal-200 text-teal-900" },
  in_consultation: { title: "Your consultation is starting", subtitle: "Please join the video call", color: "bg-blue-50 border-blue-200 text-blue-900" },
  done:            { title: "Consultation complete", subtitle: "Your notes and prescription have been saved", color: "bg-stone-50 border-stone-200 text-stone-700" },
};

export function StatusTracker({ patientId, appointmentId }: StatusTrackerProps) {
  const [payload, setPayload] = useState<WaitingRoomPayload | null>(null);

  useEffect(() => {
    // Subscribe to Supabase Realtime channel for this appointment
    const channel = supabase
      .channel(`waiting-room:${appointmentId}`)
      .on("broadcast", { event: "status_update" }, ({ payload: p }) => {
        if (p.patientId === patientId) {
          setPayload(p as WaitingRoomPayload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, appointmentId]);

  if (!payload) return null;

  const msg = STATUS_MESSAGES[payload.status];

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${msg.color} mb-6`}>
      <div className="w-2.5 h-2.5 rounded-full bg-current opacity-70 animate-pulse shrink-0" />
      <div>
        <p className="text-sm font-medium">{msg.title}</p>
        <p className="text-xs opacity-70 mt-0.5">{msg.subtitle}</p>
      </div>
      {payload.position > 0 && payload.status === "waiting" && (
        <span className="ml-auto text-xs opacity-60">
          Position: {payload.position}
        </span>
      )}
    </div>
  );
}
