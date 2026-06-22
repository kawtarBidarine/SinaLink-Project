import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const appointmentSchema = z.object({
  doctorId: z.string(),
  date: z.string(),
  time: z.string(),
  reason: z.string().min(5),
  isTelehealth: z.boolean().default(false),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role;
  const userId = session.user?.id;

  if (role === "PATIENT") {
    const patient = await prisma.patient.findUnique({ where: { userId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { doctor: { include: { user: true } } },
      orderBy: { dateTime: "desc" },
    });

    return NextResponse.json(appointments);
  }

  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { patient: { include: { user: true } } },
      orderBy: { dateTime: "asc" },
    });

    return NextResponse.json(appointments);
  }

  return NextResponse.json({ error: "Invalid role" }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { doctorId, date, time, reason, isTelehealth } = parsed.data;

  // Build datetime and validate it's in the future
  const dateTime = new Date(`${date}T${time}:00`);
  if (isNaN(dateTime.getTime())) {
    return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
  }
  if (dateTime <= new Date()) {
    return NextResponse.json(
      { error: "Cannot book an appointment in the past" },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  // Prevent double-booking same doctor at same time
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      dateTime,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "This time slot is already booked" },
      { status: 409 }
    );
  }

  const meetingLink = isTelehealth
    ? `https://meet.sinalink.com/${Math.random().toString(36).slice(2, 10)}`
    : null;

  const appointment = await prisma.appointment.create({
    data: {
      doctorId,
      patientId: patient.id,
      dateTime,
      reason,
      isTelehealth,
      meetingLink,
      status: "PENDING",
    },
    include: {
      doctor: { include: { user: true } },
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}