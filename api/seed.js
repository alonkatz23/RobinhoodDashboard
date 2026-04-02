#!/usr/bin/env node
// Run once: node api/seed.js
// Seeds the Postgres DB from the current data.json
import { sql } from '@vercel/postgres'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(join(__dirname, '../data.json'), 'utf8'))

async function seed() {
  console.log('Creating tables...')
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY,
      type        VARCHAR(20) NOT NULL DEFAULT 'deposit',
      action      TEXT,
      person      VARCHAR(20),
      amount      NUMERIC,
      total_before NUMERIC,
      spy_price   NUMERIC,
      date        DATE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS config (
      key   VARCHAR(50) PRIMARY KEY,
      value JSONB NOT NULL
    )
  `

  console.log('Seeding transactions...')
  for (const tx of data.transactions) {
    await sql`
      INSERT INTO transactions (id, type, action, person, amount, total_before, spy_price, date)
      VALUES (
        ${tx.id},
        ${tx.type || 'deposit'},
        ${tx.action ?? null},
        ${tx.person ?? null},
        ${tx.amount ?? null},
        ${tx.totalBefore ?? null},
        ${tx.spyPrice ?? null},
        ${tx.date ?? null}
      )
      ON CONFLICT (id) DO NOTHING
    `
  }

  console.log('Seeding config...')
  const configRows = [
    { key: 'initial', value: data.initial },
    { key: 'sister',  value: data.sister  },
    { key: 'meta',    value: { nextId: data.nextId } },
  ]
  for (const { key, value } of configRows) {
    await sql`
      INSERT INTO config (key, value) VALUES (${key}, ${JSON.stringify(value)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `
  }

  console.log('✅ Seed complete!')
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
