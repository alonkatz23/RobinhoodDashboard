import { config } from 'dotenv'
import { sql } from '@vercel/postgres'

config({ path: '.env.local' })

const { rows: txRows } = await sql`SELECT * FROM transactions ORDER BY id ASC`
const { rows: cfgRows } = await sql`SELECT * FROM config LIMIT 1`

console.log('\n=== CONFIG ===')
const cfg = cfgRows[0]?.data || {}
console.log('nextId:', cfg.nextId)
console.log('initial:', JSON.stringify(cfg.initial))

console.log('\n=== TRANSACTIONS (' + txRows.length + ' total) ===')
txRows.forEach(r => {
  const tx = r.data
  console.log(
    'id:' + r.id +
    ' | tx_id:' + tx.id +
    ' | ' + (tx.date || 'no-date') +
    ' | ' + tx.type +
    ' | ' + (tx.person || 'mkt') +
    ' | ' + tx.action +
    ' | amt:' + (tx.amount ?? '-')
  )
})

process.exit(0)
