"use client";

import { useState } from "react";
import { Save, Plus } from "lucide-react";

interface ConsultationNotesProps {
  appointmentId: string;
  initialContent?: string;
  initialPrescription?: string;
  onSave: (content: string, prescription: string) => Promise<void>;
}

type Tab = "notes" | "prescription" | "history";

export function ConsultationNotes({
  appointmentId,
  initialContent = "",
  initialPrescription = "",
  onSave,
}: ConsultationNotesProps) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [content, setContent] = useState(initialContent);
  const [prescription, setPrescription] = useState(initialPrescription);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(content, prescription);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "notes", label: "Clinical Notes" },
    { key: "prescription", label: "Prescription" },
    { key: "history", label: "History" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-stone-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm transition-colors border-b-2 ${
              activeTab === tab.key
                ? "border-teal-600 text-teal-800 font-medium"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {activeTab === "notes" && (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Clinical notes for appointment ${appointmentId}...\n\nSubjective:\nObjective:\nAssessment:\nPlan:`}
            className="w-full h-full min-h-[200px] text-sm text-stone-800 resize-none outline-none placeholder:text-stone-300 font-mono leading-relaxed"
          />
        )}

        {activeTab === "prescription" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-stone-400 uppercase tracking-wide">Medications</span>
              <button className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900">
                <Plus size={13} /> Add medication
              </button>
            </div>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="e.g. Amoxicillin 500mg — 1 tablet, 3x daily, 7 days"
              className="w-full h-40 text-sm text-stone-800 border border-stone-200 rounded-xl p-3 resize-none outline-none focus:ring-2 focus:ring-teal-100"
            />
            <p className="text-xs text-stone-400">
              Prescription will be sent to patient&apos;s records automatically upon save.
            </p>
          </div>
        )}

        {activeTab === "history" && (
          <div className="text-sm text-stone-400 text-center mt-8">
            Previous consultations will appear here.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-teal-800 disabled:opacity-50 transition-colors"
        >
          <Save size={15} />
          {saving ? "Saving..." : saved ? "Saved!" : "Save & Send to Patient"}
        </button>
      </div>
    </div>
  );
}
