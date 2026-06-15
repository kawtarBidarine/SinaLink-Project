"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  role: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({ name, role, imageUrl, size = "md" }: UserAvatarProps) {
  const [open, setOpen] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const roleColor = role === "DOCTOR"
    ? "bg-teal-100 text-teal-800"
    : "bg-blue-100 text-blue-800";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "rounded-full flex items-center justify-center font-medium cursor-pointer ring-2 ring-transparent hover:ring-teal-200 transition-all",
          sizeClasses[size],
          roleColor
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="rounded-full object-cover w-full h-full" />
        ) : (
          getInitials(name)
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-medium text-stone-900">{name}</p>
            <p className="text-xs text-stone-500 capitalize">{role.toLowerCase()}</p>
          </div>
          <a href="/settings" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
            Settings
          </a>
          <a href="/help" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
            Help
          </a>
        </div>
      )}
    </div>
  );
}
