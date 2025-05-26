import { randomUUID } from 'node:crypto'
import 'dotenv/config'
import type { Environment } from 'vitest'
import { execSync } from 'node:child_process'
import { prisma } from '@/lib/prisma'

function generateDatabaseUrl(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL env variable.')
  }

  const url = new URL(process.env.DATABASE_URL)
  return url.toString()
}

export default <Environment>{
  name: 'prisma',
  transformMode: 'ssr',
  async setup() {
    const schema = randomUUID()
    const databseUrl = generateDatabaseUrl(schema)
    process.env.DATABASE_URL = databseUrl
    execSync('npx prisma migrate deploy')

    return {
      async teardown() {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )

        await prisma.$disconnect()
      },
    }
  },
}
