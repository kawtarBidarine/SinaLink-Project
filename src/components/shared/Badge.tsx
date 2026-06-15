import { cn } from "@/lib/utils";

type BadgeVariant =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed"
  | "followup"
  | "telehealth"
  | "active";

const variantStyles: Record<BadgeVariant, string> = {
  confirmed: "bg-teal-50 text-teal-800",
  pending:   "bg-amber-50 text-amber-800",
  cancelled: "bg-red-50 text-red-800",
  completed: "bg-stone-100 text-stone-600",
  followup:  "bg-purple-50 text-purple-800",
  telehealth:"bg-blue-50 text-blue-800",
  active:    "bg-teal-50 text-teal-800",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
