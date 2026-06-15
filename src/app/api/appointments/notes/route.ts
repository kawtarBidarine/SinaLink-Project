import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const notesSchema = z.object({
  appointmentId: z.string(),
  content: z.string().min(1),
  prescription: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = notesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { appointmentId, content, prescription } = parsed.data;

  // Verify this appointment belongs to the requesting doctor
  const doctor = await prisma.doctor.findUnique({
    where: { userId: session.user.id },
  });
  if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, doctorId: doctor.id },
  });
  if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

  const note = await prisma.medicalNote.upsert({
    where: { appointmentId },
    create: { appointmentId, content, prescription },
    update: { content, prescription },
  });

  // Mark appointment as completed
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json(note, { status: 201 });
}
