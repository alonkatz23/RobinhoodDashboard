import { sql } from '@vercel/postgres'

async function ensureTables() {
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
}

function rowToTx(row) {
  const tx = {
    id:          row.id,
    action:      row.action,
    totalBefore: row.total_before != null ? parseFloat(row.total_before) : 0,
    date:        row.date ? row.date.toISOString().slice(0, 10) : null,
  }
  if (row.type && row.type !== 'deposit') tx.type = row.type
  if (row.person)    tx.person   = row.person
  if (row.amount != null) tx.amount = parseFloat(row.amount)
  if (row.spy_price != null) tx.spyPrice = parseFloat(row.spy_price)
  return tx
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  await ensureTables()

  // ── GET ──────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const [txResult, cfgResult] = await Promise.all([
      sql`SELECT * FROM transactions ORDER BY id`,
      sql`SELECT key, value FROM config`,
    ])

    const config = {}
    cfgResult.rows.forEach(r => { config[r.key] = r.value })

    // Always derive nextId from actual max id to prevent conflicts
    const maxId = txResult.rows.reduce((m, r) => Math.max(m, r.id), -1)
    const nextId = maxId + 1

    return res.json({
      initial:      config.initial  || { alon: 0, noam: 0, aba: 0 },
      transactions: txResult.rows.map(rowToTx),
      nextId,
      sister:       config.sister   || { name: 'Shai', spyShares: 0, initialInvestment: 36000 },
    })
  }

  // ── POST ─────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { initial, transactions, nextId, sister } = req.body

    // Replace all transactions (simple & safe for small datasets)
    await sql`DELETE FROM transactions`
    for (const tx of transactions) {
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
      `
    }

    // Update config
    const configRows = [
      { key: 'initial', value: initial },
      { key: 'sister',  value: sister  },
      { key: 'meta',    value: { nextId } },
    ]
    for (const { key, value } of configRows) {
      await sql`
        INSERT INTO config (key, value) VALUES (${key}, ${JSON.stringify(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `
    }

    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
