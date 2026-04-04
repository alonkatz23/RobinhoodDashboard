/**
 * Pure calculation engine — no DOM, no side effects.
 * 
 * Logic:
 *   pctChange    = totalBefore / prevTotal  (market return since last tx)
 *   PersonBefore = prevPersonAfter * pctChange
 *   PersonAfter  = PersonBefore + (tx.amount if this person, else 0)
 *   newTotal     = totalBefore + amount  (0 for market_update)
 *   PersonPct    = PersonAfter / newTotal
 */
export function calcAll(transactions, initial) {
  let prevAlon = initial.alon
  let prevNoam = initial.noam
  let prevAba  = initial.aba
  let prevTotal = prevAlon + prevNoam + prevAba

  return transactions.map(tx => {
    const isMarket    = tx.type === 'market_update'
    const totalBefore = tx.totalBefore || 0
    const pctChange   = prevTotal > 0 ? totalBefore / prevTotal : 1

    const alonBefore = prevAlon * pctChange
    const noamBefore = prevNoam * pctChange
    const abaBefore  = prevAba  * pctChange

    const txAmount   = isMarket ? 0 : (tx.amount || 0)
    const alonAfter  = alonBefore + (tx.person === 'Alon' ? txAmount : 0)
    const noamAfter  = noamBefore + (tx.person === 'Noam' ? txAmount : 0)
    const abaAfter   = abaBefore  + (tx.person === 'Aba'  ? txAmount : 0)
    const newTotal   = totalBefore + txAmount

    const alonPct = newTotal > 0 ? alonAfter / newTotal : 0
    const noamPct = newTotal > 0 ? noamAfter / newTotal : 0
    const abaPct  = newTotal > 0 ? abaAfter  / newTotal : 0

    const row = {
      tx, isMarket, pctChange,
      alonBefore, noamBefore, abaBefore,
      alonAfter, noamAfter, abaAfter,
      alonPct, noamPct, abaPct,
      newTotal,
    }

    prevAlon = alonAfter
    prevNoam = noamAfter
    prevAba  = abaAfter
    prevTotal = newTotal

    return row
  })
}

export function calcSummary(rows, initial, transactions, sisterValue = 0) {
  const initTotal     = initial.alon + initial.noam + initial.aba
  const last          = rows[rows.length - 1]
  const current       = last ? last.newTotal : initTotal
  const totalDeposited = initTotal + transactions
    .filter(t => t.type !== 'market_update')
    .reduce((s, t) => s + (t.amount || 0), 0)
  const marketGain    = current - totalDeposited
  const gainPct       = totalDeposited > 0 ? marketGain / totalDeposited : 0
  const grossTotal    = current + sisterValue
  const deposits      = transactions.filter(t => t.type !== 'market_update' && (t.amount || 0) > 0).length
  const withdrawals   = transactions.filter(t => t.type !== 'market_update' && (t.amount || 0) < 0).length
  const mktUpdates    = transactions.filter(t => t.type === 'market_update').length
  const lastDate      = transactions.filter(t => t.date).slice(-1)[0]?.date

  return { current, totalDeposited, marketGain, gainPct, grossTotal, deposits, withdrawals, mktUpdates, lastDate, last }
}

export function calcPersonStats(rows, initial, transactions, sisterValue = 0) {
  const initTotal = initial.alon + initial.noam + initial.aba
  const last      = rows[rows.length - 1]
  const activeTotal = last ? last.newTotal : initTotal
  const grossTotal  = activeTotal + sisterValue

  const people = [
    { name: 'Alon', cls: 'alon', initVal: initial.alon,
      afterVal: last ? last.alonAfter : initial.alon,
      pct: last ? last.alonPct : (initTotal > 0 ? initial.alon / initTotal : 0) },
    { name: 'Noam', cls: 'noam', initVal: initial.noam,
      afterVal: last ? last.noamAfter : initial.noam,
      pct: last ? last.noamPct : (initTotal > 0 ? initial.noam / initTotal : 0) },
    { name: 'Aba',  cls: 'aba',  initVal: initial.aba,
      afterVal: last ? last.abaAfter : initial.aba,
      pct: last ? last.abaPct  : (initTotal > 0 ? initial.aba  / initTotal : 0) },
  ]

  return people.map(p => {
    const deposited = p.initVal + transactions
      .filter(t => t.type !== 'market_update' && t.person === p.name)
      .reduce((s, t) => s + (t.amount || 0), 0)
    const gain     = p.afterVal - deposited
    const gainPct  = deposited > 0 ? (gain / deposited) * 100 : 0
    const grossPct = grossTotal > 0 ? p.afterVal / grossTotal : 0
    return { ...p, deposited, gain, gainPct, grossPct, grossTotal }
  })
}

/**
 * Builds time-series data for the portfolio value and gain/loss charts.
 * Only tracks the active pool (Alon + Noam + Aba) — excludes Shai.
 *
 * IMPORTANT: we must walk ALL rows to keep cumulativeDeposits accurate,
 * then filter to only dated points for display.  Filtering before the map
 * caused undated deposits to be missing from cumulativeDeposits while
 * still being included in newTotal, making gain values wrong.
 */
export function calcChartData(rows, initial, transactions) {
  const initDeposited = initial.alon + initial.noam + initial.aba
  let cumulativeDeposits = initDeposited

  // Walk every row (including undated) so deposits are always counted
  const allPoints = rows.map(r => {
    const { tx, newTotal, isMarket, pctChange } = r
    if (!isMarket) cumulativeDeposits += (tx.amount || 0)

    const gain    = newTotal - cumulativeDeposits
    const gainPct = cumulativeDeposits > 0 ? (gain / cumulativeDeposits) * 100 : 0
    const mktPct  = pctChange > 0 ? ((pctChange - 1) * 100) : 0

    return {
      date:      tx.date ?? null,
      label:     tx.action || tx.date || `Tx #${tx.id}`,
      total:     Math.round(newTotal),
      deposited: Math.round(cumulativeDeposits),
      gain:      Math.round(gain),
      gainPct:   parseFloat(gainPct.toFixed(2)),
      mktPct:    parseFloat(mktPct.toFixed(2)),
      isMarket,
    }
  })

  // Only return dated points — the running totals are already correct above
  return allPoints.filter(p => p.date)
}

