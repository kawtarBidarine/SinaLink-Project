"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
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
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span className="font-serif text-2xl text-teal-900">SinaLink</span>
          </div>
          <p className="text-stone-400 text-sm">Create your account</p>
        </div>

        {/* Role selector */}
        <div className="flex rounded-xl overflow-hidden border border-stone-200 mb-6">
          {(["PATIENT", "DOCTOR"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={`flex-1 py-2.5 text-sm transition-colors ${
                form.role === r
                  ? "bg-teal-700 text-white font-medium"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              {r === "PATIENT" ? "I am a Patient" : "I am a Doctor"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              { label: "Full Name", field: "name", type: "text", placeholder: "Dr. Amine Karim" },
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-teal-700 hover:text-teal-900 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
