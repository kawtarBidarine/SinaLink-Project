import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const hash = (p: string) => bcrypt.hash(p, 12)

const DOCTORS = [
  {
    email: 'doctor@sinalink.com',
    name: 'Dr. Amine Karim',
    specialty: 'General Practice',
    licenseNumber: 'MA-2024-00123',
    bio: 'General practitioner with 12 years of experience in family medicine and preventive care.',
  },
  {
    email: 'sara.idrissi@sinalink.com',
    name: 'Dr. Sara Idrissi',
    specialty: 'Cardiology',
    licenseNumber: 'MA-2024-00456',
    bio: 'Cardiologist specializing in hypertension management and heart disease prevention.',
  },
  {
    email: 'youssef.bennani@sinalink.com',
    name: 'Dr. Youssef Bennani',
    specialty: 'Dermatology',
    licenseNumber: 'MA-2024-00789',
    bio: 'Dermatologist with a focus on acne, eczema, and skin cancer screening.',
  },
  {
    email: 'nadia.fassi@sinalink.com',
    name: 'Dr. Nadia Fassi',
    specialty: 'Pediatrics',
    licenseNumber: 'MA-2024-01011',
    bio: 'Pediatrician caring for infants through adolescents, focused on growth and vaccination.',
  },
  {
    email: 'omar.tazi@sinalink.com',
    name: 'Dr. Omar Tazi',
    specialty: 'Orthopedics',
    licenseNumber: 'MA-2024-01213',
    bio: 'Orthopedic surgeon treating sports injuries, joint pain, and fractures.',
  },
  {
    email: 'hind.berrada@sinalink.com',
    name: 'Dr. Hind Berrada',
    specialty: 'Psychiatry',
    licenseNumber: 'MA-2024-01415',
    bio: 'Psychiatrist specializing in anxiety, depression, and stress-related conditions.',
  },
]

const SAMPLE_COMMENTS = [
  'Very attentive and explained everything clearly.',
  'Short wait time and the consultation felt thorough.',
  'Helped me understand my treatment options without rushing.',
  'Professional, kind, and easy to talk to.',
  'Great bedside manner, would book again.',
  'Listened carefully and followed up afterward.',
]

const REASONS = [
  'Routine checkup',
  'Back pain follow-up',
  'Skin rash evaluation',
  'Blood pressure monitoring',
  'Anxiety management',
  'Vaccination',
  'General fatigue',
  'Knee pain assessment',
]

async function main() {
  console.log('🌱 Starting seed...')

  // ── Main patient ──────────────────────────────────────────────
  const mainPatientUser = await prisma.user.upsert({
    where: { email: 'patient@sinalink.com' },
    update: {},
    create: {
      name: 'Layla Bensaid',
      email: 'patient@sinalink.com',
      password: await hash('password123'),
      role: 'PATIENT',
      patient: {
        create: {
          bloodType: 'A+',
          allergies: ['Penicillin'],
        },
      },
    },
    include: { patient: true },
  })

  // ── Reviewer patients ─────────────────────────────────────────
  const reviewerEmails = [
    'reviewer1@sinalink.com',
    'reviewer2@sinalink.com',
    'reviewer3@sinalink.com',
  ]
  const reviewers: Array<{ patient: { id: string } | null }> = []

  for (const email of reviewerEmails) {
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: email.split('@')[0],
        email,
        password: await hash('password123'),
        role: 'PATIENT',
        patient: { create: {} },
      },
      include: { patient: true },
    })
    reviewers.push(u as any)
  }

  // ── Doctors ───────────────────────────────────────────────────
  const seededDoctors: Array<{ id: string; userId: string }> = []

  for (const doc of DOCTORS) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        name: doc.name,
        email: doc.email,
        password: await hash('password123'),
        role: 'DOCTOR',
        doctor: {
          create: {
            specialty: doc.specialty,
            licenseNumber: doc.licenseNumber,
            bio: doc.bio,
          },
        },
      },
      include: { doctor: true },
    })

    if (!user.doctor) continue
    const doctorId = user.doctor.id
    seededDoctors.push({ id: doctorId, userId: user.id })

    // ── Reviews ─────────────────────────────────────────────────
    const ratings = [4, 5, 5]
    for (let i = 0; i < reviewers.length; i++) {
      const reviewer = reviewers[i]
      if (!reviewer.patient) continue
      await prisma.review.upsert({
        where: {
          doctorId_patientId: {
            doctorId,
            patientId: reviewer.patient.id,
          },
        },
        update: {},
        create: {
          doctorId,
          patientId: reviewer.patient.id,
          rating: ratings[i % ratings.length],
          comment:
            SAMPLE_COMMENTS[
              (i + DOCTORS.indexOf(doc)) % SAMPLE_COMMENTS.length
            ],
        },
      })
    }

    // Update rating + reviewCount
    const allReviews = await prisma.review.findMany({ where: { doctorId } })
    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        rating: Math.round(avg * 10) / 10,
        reviewCount: allReviews.length,
      },
    })

    console.log(`  ✓ Doctor: ${doc.name}`)
  }

  // ── Appointments for main patient ─────────────────────────────
  if (!mainPatientUser.patient) {
    console.log('⚠️  Main patient record missing, skipping appointments')
    return
  }
  const patientId = mainPatientUser.patient.id
  const now = new Date()

  // Past appointments (COMPLETED)
  const pastAppointments = [
    { daysAgo: 30, doctorIdx: 0, reason: REASONS[0], isTelehealth: false },
    { daysAgo: 14, doctorIdx: 1, reason: REASONS[3], isTelehealth: true },
    { daysAgo: 7,  doctorIdx: 2, reason: REASONS[2], isTelehealth: false },
  ]

  for (const appt of pastAppointments) {
    const dateTime = new Date(now)
    dateTime.setDate(dateTime.getDate() - appt.daysAgo)
    dateTime.setHours(10, 0, 0, 0)

    const doctor = seededDoctors[appt.doctorIdx]
    if (!doctor) continue

    // Check if already exists to avoid duplicates
    const existing = await prisma.appointment.findFirst({
      where: { patientId, doctorId: doctor.id, dateTime },
    })
    if (existing) continue

    await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId,
        dateTime,
        reason: appt.reason,
        isTelehealth: appt.isTelehealth,
        meetingLink: appt.isTelehealth
          ? `https://meet.sinalink.com/past-${Math.random().toString(36).slice(2, 8)}`
          : null,
        status: 'COMPLETED',
      },
    })
    console.log(`  ✓ Past appointment: ${appt.reason} (${appt.daysAgo} days ago)`)
  }

  // Upcoming appointments (CONFIRMED / PENDING)
  const upcomingAppointments = [
    { daysFromNow: 3,  doctorIdx: 3, reason: REASONS[5], isTelehealth: false, status: 'CONFIRMED' as const },
    { daysFromNow: 7,  doctorIdx: 4, reason: REASONS[7], isTelehealth: false, status: 'PENDING' as const },
    { daysFromNow: 12, doctorIdx: 5, reason: REASONS[4], isTelehealth: true,  status: 'CONFIRMED' as const },
  ]

  for (const appt of upcomingAppointments) {
    const dateTime = new Date(now)
    dateTime.setDate(dateTime.getDate() + appt.daysFromNow)
    dateTime.setHours(14, 0, 0, 0)

    const doctor = seededDoctors[appt.doctorIdx]
    if (!doctor) continue

    const existing = await prisma.appointment.findFirst({
      where: { patientId, doctorId: doctor.id, dateTime },
    })
    if (existing) continue

    await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId,
        dateTime,
        reason: appt.reason,
        isTelehealth: appt.isTelehealth,
        meetingLink: appt.isTelehealth
          ? `https://meet.sinalink.com/upcoming-${Math.random().toString(36).slice(2, 8)}`
          : null,
        status: appt.status,
      },
    })
    console.log(`  ✓ Upcoming appointment: ${appt.reason} (in ${appt.daysFromNow} days)`)
  }

  console.log('\n✅ Seed complete!')
  console.log('   doctor@sinalink.com / password123')
  console.log('   patient@sinalink.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })