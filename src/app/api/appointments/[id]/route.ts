import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Verify ownership — doctors can update their own appointments
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user?.id;
  const role = session.user?.role;

  const isOwner =
    (role === "DOCTOR" && appointment.doctor.userId === userId) ||
    (role === "PATIENT" && appointment.patient.userId === userId);

  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json(updated);
}
