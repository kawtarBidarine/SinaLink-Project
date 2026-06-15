import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span className="font-serif text-xl text-teal-900">SinaLink</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-stone-500 hover:text-stone-800 px-3 py-2">Sign in</Link>
          <Link href="/auth/signup" className="text-sm bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-800 transition-colors">Get started</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 text-xs text-teal-700 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
          Now available in Morocco · سينالينك
        </div>
        <h1 className="font-serif text-6xl text-stone-900 leading-tight mb-6">
          Modern healthcare,<br />
          <span className="text-teal-700 italic">built for everyone.</span>
        </h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Inspired by Ibn Sina — the father of modern medicine. SinaLink connects patients
          and doctors for seamless in-person and telehealth consultations.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup" className="bg-teal-700 text-white px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-teal-800 transition-colors">Book an appointment →</Link>
          <Link href="/auth/signup" className="border border-stone-200 text-stone-700 px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors">Join as a doctor</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-stone-100">
        <h2 className="font-serif text-3xl text-stone-900 text-center mb-14">How it works</h2>
        <div className="grid grid-cols-3 gap-10">
          {[
            { step: "01", title: "Create your profile", desc: "Sign up as a patient or register as a licensed doctor. Your role determines your entire experience.", icon: "◈" },
            { step: "02", title: "Book or schedule", desc: "Patients find doctors by specialty and book in seconds. Doctors manage availability with a full calendar.", icon: "▦" },
            { step: "03", title: "Connect and care", desc: "Join a secure video consultation. Doctors write digital notes and prescriptions — patients receive them instantly.", icon: "▶" },
          ].map((item) => (
            <div key={item.step}>
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 mb-4 text-lg">{item.icon}</div>
              <div className="text-xs text-stone-400 mb-2 font-mono">{item.step}</div>
              <h3 className="font-serif text-lg text-stone-900 mb-2">{item.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="font-serif text-stone-700">SinaLink</span>
          </div>
          <p className="text-xs text-stone-400">Inspired by Ibn Sina (980–1037), father of early modern medicine.</p>
        </div>
      </footer>
    </div>
  );
}
