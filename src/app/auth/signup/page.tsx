"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Heart } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PATIENT" as "PATIENT" | "DOCTOR",
    specialty: "",
    licenseNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-select role from URL param (?role=doctor or ?role=patient)
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "doctor") setForm((f) => ({ ...f, role: "DOCTOR" }));
    if (roleParam === "patient") setForm((f) => ({ ...f, role: "PATIENT" }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center">
              <Stethoscope size={14} className="text-white" />
            </div>
            <span className="font-serif text-2xl text-teal-900">SinaLink</span>
          </div>
          <p className="text-stone-400 text-sm">Create your account</p>
        </div>

        {/* Role selector — visually distinct */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: "PATIENT" }))}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              form.role === "PATIENT"
                ? "border-teal-600 bg-teal-50 text-teal-800"
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
            }`}
          >
            <Heart size={20} className={form.role === "PATIENT" ? "text-teal-600" : "text-stone-400"} />
            <div className="text-center">
              <p className="text-sm font-medium">I need care</p>
              <p className="text-xs opacity-70">Patient</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, role: "DOCTOR" }))}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              form.role === "DOCTOR"
                ? "border-teal-600 bg-teal-50 text-teal-800"
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
            }`}
          >
            <Stethoscope size={20} className={form.role === "DOCTOR" ? "text-teal-600" : "text-stone-400"} />
            <div className="text-center">
              <p className="text-sm font-medium">I provide care</p>
              <p className="text-xs opacity-70">Doctor</p>
            </div>
          </button>
        </div>

        {/* Context message */}
        <div className={`text-xs px-4 py-3 rounded-lg mb-5 ${
          form.role === "DOCTOR"
            ? "bg-teal-50 text-teal-700 border border-teal-100"
            : "bg-blue-50 text-blue-700 border border-blue-100"
        }`}>
          {form.role === "DOCTOR"
            ? "You'll get access to the clinical dashboard — schedule, patient list, and consultation tools."
            : "You'll be able to search doctors, book appointments, and access your records."}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              { label: "Full Name", field: "name", type: "text", placeholder: form.role === "DOCTOR" ? "Dr. Amine Karim" : "Layla Bensaid" },
              { label: "Email", field: "email", type: "email", placeholder: "you@example.com" },
              { label: "Password", field: "password", type: "password", placeholder: "Min 8 characters" },
            ] as { label: string; field: keyof typeof form; type: string; placeholder: string }[]
          ).map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs text-stone-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 bg-white"
                placeholder={placeholder}
              />
            </div>
          ))}

          {/* Doctor-only fields */}
          {form.role === "DOCTOR" && (
            <>
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 uppercase tracking-wide">Specialty</label>
                <select
                  value={form.specialty}
                  onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                  required
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 bg-white"
                >
                  <option value="">Select specialty</option>
                  {["General Practice", "Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1.5 uppercase tracking-wide">License Number</label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                  required
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-200 bg-white"
                  placeholder="e.g. MA-2024-00123"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : form.role === "DOCTOR" ? "Create doctor account" : "Create patient account"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-teal-700 hover:text-teal-900 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}