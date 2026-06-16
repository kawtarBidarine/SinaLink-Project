"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

const DOCTOR_LINKS = [
  { href: "/doctor/dashboard", label: "Dashboard" },
  { href: "/doctor/schedule", label: "Schedule" },
  { href: "/doctor/patient-list", label: "Patients" },
];

const PATIENT_LINKS = [
  { href: "/patient/dashboard", label: "Dashboard" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/patient/records", label: "Records" },
];

interface NavbarProps {
  currentPath?: string;
  session?: {
    user?: {
      name?: string | null;
      role?: string;
    };
  } | null;
}

export function Navbar({ currentPath = "", session }: NavbarProps) {
  const role = session?.user?.role;
  const links = role === "DOCTOR" ? DOCTOR_LINKS : PATIENT_LINKS;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="font-serif text-xl text-teal-900 tracking-tight">
            SinaLink
          </span>
        </Link>

        {session && (
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm transition-colors",
                  currentPath === link.href
                    ? "bg-teal-50 text-teal-800 font-medium"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <UserAvatar
                name={session.user?.name ?? ""}
                role={role ?? ""}
              />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5">
                Sign in
              </Link>
              <Link href="/auth/signup" className="text-sm bg-teal-700 text-white px-4 py-1.5 rounded-lg hover:bg-teal-800 transition-colors">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}