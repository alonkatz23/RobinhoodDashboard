export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const data = await response.json()
    const meta = data.chart.result[0].meta

    const price = meta.regularMarketPrice
    const prev  = meta.chartPreviousClose ?? meta.previousClose

    return res.json({
      price,
      previousClose: prev,
      change:    price - prev,
      changePct: ((price - prev) / prev) * 100,
    })
  } catch (e) {
    console.error('SPY fetch error:', e)
    return res.status(500).json({ error: 'Failed to fetch SPY price' })
  }
}
