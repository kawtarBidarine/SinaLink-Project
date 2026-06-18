import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const specialty = req.nextUrl.searchParams.get("specialty");

  const doctors = await prisma.doctor.findMany({
    where: specialty && specialty !== "All" ? { specialty } : undefined,
    include: {
      user: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { patient: { include: { user: true } } },
      },
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json(doctors);
}