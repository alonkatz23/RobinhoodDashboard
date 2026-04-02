export async function loadData() {
  const res = await fetch('/api/data')
  if (!res.ok) throw new Error('Server error')
  return res.json()
}

export async function saveData(payload) {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Save failed')
}

export async function fetchSpyPrice() {
  const res = await fetch('/api/spy-price')
  if (!res.ok) throw new Error('SPY fetch failed')
  return res.json()
}
