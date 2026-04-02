export function fmt(n, decimals = 0) {
  if (n == null || isNaN(n)) return '—'
  const s = Math.abs(n).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return (n < 0 ? '-$' : '$') + s
}

export function fmtPct(n) {
  if (n == null || isNaN(n)) return '—'
  return (n * 100).toFixed(2) + '%'
}

export function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function fmtSign(n, decimals = 0) {
  if (n == null || isNaN(n)) return '—'
  return (n >= 0 ? '+' : '') + fmt(n, decimals)
}
