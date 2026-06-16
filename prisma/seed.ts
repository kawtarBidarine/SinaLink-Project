import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 12)

  await prisma.user.upsert({
    where: { email: 'doctor@sinalink.com' },
    update: {},
    create: {
      name: 'Dr. Amine Karim',
      email: 'doctor@sinalink.com',
      password: await hash('password123'),
      role: 'DOCTOR',
      doctor: {
        create: {
          specialty: 'General Practice',
          licenseNumber: 'MA-2024-00123',
        },
      },
    },
  })

  await prisma.user.upsert({
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
  })

  console.log('✅ Seeded successfully')
  console.log('   doctor@sinalink.com / password123')
  console.log('   patient@sinalink.com / password123')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })