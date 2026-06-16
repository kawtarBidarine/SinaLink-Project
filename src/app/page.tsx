import Link from "next/link";
import {
  Stethoscope,
  CalendarCheck,
  Video,
  ArrowRight,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Heart,
  FileText,
  Users,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-700 flex items-center justify-center">
            <Stethoscope size={14} className="text-white" />
          </div>
          <span className="font-serif text-xl text-teal-900 tracking-tight">SinaLink</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/auth/login"
            className="text-sm text-stone-500 hover:text-stone-800 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup?role=patient"
            className="text-sm text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Book appointment
          </Link>
          <Link
            href="/auth/signup?role=doctor"
            className="text-sm bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition-colors ml-1"
          >
            Doctor portal →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 text-xs text-teal-700 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Now available in Morocco · سينالينك
            </div>
            <h1 className="font-serif text-5xl text-stone-900 leading-tight mb-6">
              Healthcare that works
              <span className="text-teal-700 italic block">for patients and doctors.</span>
            </h1>
            <p className="text-stone-500 text-base leading-relaxed mb-8 max-w-md">
              Inspired by Ibn Sina — the father of modern medicine. Whether you need care
              or you provide it, SinaLink gives you the tools to connect seamlessly.
            </p>

            {/* Dual CTA — clear separation of roles */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signup?role=patient"
                  className="flex items-center gap-2 bg-teal-700 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
                >
                  <Heart size={15} />
                  I need care — Book now
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signup?role=doctor"
                  className="flex items-center gap-2 border border-stone-200 text-stone-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  <Stethoscope size={15} />
                  I am a doctor — Join the platform
                  <ChevronRight size={14} className="text-stone-400" />
                </Link>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-700 hover:underline">Sign in here</Link>
              </p>
            </div>
          </div>

          {/* Right side — trust signals */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "500+", label: "Verified doctors", icon: Users },
                { value: "4.9★", label: "Average rating", icon: Star },
                { value: "<2min", label: "Booking time", icon: Clock },
                { value: "100%", label: "Secure & private", icon: Shield },
              ].map((stat) => (
                <div key={stat.label} className="bg-stone-50 border border-stone-100 rounded-2xl p-5">
                  <stat.icon size={18} className="text-teal-600 mb-3" />
                  <p className="text-2xl font-semibold text-stone-900">{stat.value}</p>
                  <p className="text-xs text-stone-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Sample appointment card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-medium">
                  AK
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">Dr. Amine Karim</p>
                  <p className="text-xs text-stone-400">General Practice · Casablanca</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-stone-500">4.9</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["09:00", "10:30", "14:00"].map((t) => (
                  <button
                    key={t}
                    className="py-2 rounded-lg text-xs border border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-700 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md">In-person</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1">
                  <Video size={10} /> Telehealth
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role clarity section */}
      <section className="border-t border-stone-100 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-serif text-3xl text-stone-900 text-center mb-4">
            Two portals. One platform.
          </h2>
          <p className="text-stone-500 text-center text-sm mb-14 max-w-lg mx-auto">
            SinaLink is built for both sides of healthcare. Each role gets its own
            tailored experience — like a patient app and a clinical dashboard in one.
          </p>

          <div className="grid grid-cols-2 gap-8">
            {/* Patient portal */}
            <div className="bg-white border border-stone-200 rounded-2xl p-8">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <Heart size={18} className="text-teal-700" />
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-2">For Patients</h3>
              <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                Find the right doctor, book in seconds, and attend in-person or via video call.
                Your records, prescriptions, and history — all in one place.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Search doctors by specialty",
                  "Book in-person or telehealth",
                  "Live waiting room status",
                  "Access prescriptions & notes",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?role=patient"
                className="flex items-center gap-2 bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors w-fit"
              >
                Book your first appointment
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Doctor portal */}
            <div className="bg-teal-900 border border-teal-800 rounded-2xl p-8">
              <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center mb-5">
                <Stethoscope size={18} className="text-teal-300" />
              </div>
              <h3 className="font-serif text-xl text-white mb-2">For Doctors</h3>
              <p className="text-teal-300 text-sm mb-6 leading-relaxed">
                A clinical dashboard built around your workflow. Manage your schedule,
                run video consultations, and write digital prescriptions — all in one view.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Weekly calendar & availability",
                  "Searchable patient list",
                  "Split-screen consultation view",
                  "Digital notes & prescriptions",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-teal-200">
                    <div className="w-4 h-4 rounded-full bg-teal-800 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?role=doctor"
                className="flex items-center gap-2 bg-white text-teal-900 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors w-fit"
              >
                Join as a doctor
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl text-stone-900 text-center mb-14">How it works</h2>
        <div className="grid grid-cols-3 gap-10">
          {[
            {
              step: "01",
              title: "Create your profile",
              desc: "Sign up as a patient to book care, or register as a licensed doctor to manage your practice. Your role determines your entire dashboard.",
              icon: Users,
            },
            {
              step: "02",
              title: "Book or schedule",
              desc: "Patients search by specialty and book in seconds. Doctors set their availability on a full weekly calendar and confirm appointments.",
              icon: CalendarCheck,
            },
            {
              step: "03",
              title: "Consult and care",
              desc: "Join a secure video call or attend in person. Doctors write clinical notes and issue prescriptions — patients receive them instantly in their records.",
              icon: FileText,
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                <item.icon size={18} className="text-teal-700" />
              </div>
              <div className="text-xs text-stone-300 mb-2 font-mono">{item.step}</div>
              <h3 className="font-serif text-lg text-stone-900 mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-stone-100 bg-teal-900">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-teal-300 text-sm mb-8">
            Join thousands of patients and doctors already using SinaLink across Morocco.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/signup?role=patient"
              className="flex items-center gap-2 bg-white text-teal-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors"
            >
              <Heart size={15} />
              Book as patient
            </Link>
            <Link
              href="/auth/signup?role=doctor"
              className="flex items-center gap-2 border border-teal-700 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors"
            >
              <Stethoscope size={15} />
              Join as doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-teal-700 flex items-center justify-center">
              <Stethoscope size={10} className="text-white" />
            </div>
            <span className="font-serif text-stone-700">SinaLink</span>
          </div>
          <p className="text-xs text-stone-400">
            Inspired by Ibn Sina (980–1037), father of early modern medicine.
          </p>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <Link href="/auth/login" className="hover:text-stone-600">Sign in</Link>
            <Link href="/auth/signup?role=patient" className="hover:text-stone-600">Patients</Link>
            <Link href="/auth/signup?role=doctor" className="hover:text-stone-600">Doctors</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}