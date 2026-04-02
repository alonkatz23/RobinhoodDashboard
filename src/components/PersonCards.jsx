import { useState } from 'react'
import { fmt, fmtPct } from '../fmt'

const PERSON_STYLES = {
  alon:   { bar: 'from-[#7c6bff] to-[#a094ff]', top: 'bg-gradient-to-r from-[#7c6bff] to-[#a094ff]', val: 'text-[#a094ff]' },
  noam:   { bar: 'from-[#00d4aa] to-[#00f5c8]', top: 'bg-gradient-to-r from-[#00d4aa] to-[#00f5c8]', val: 'text-[#00d4aa]' },
  aba:    { bar: 'from-[#ff9f43] to-[#ffcc6b]', top: 'bg-gradient-to-r from-[#ff9f43] to-[#ffcc6b]', val: 'text-[#ff9f43]' },
  sister: { bar: 'from-[#e84393] to-[#ff8ec7]', top: 'bg-gradient-to-r from-[#e84393] to-[#ff8ec7]', val: 'text-[#e84393]' },
}

function PersonCard({ name, cls, afterVal, deposited, gain, pct, grossPct, sisterActive, extra }) {
  const s = PERSON_STYLES[cls]
  const gainPos = gain >= 0
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#10141f] p-3 sm:p-5 transition-all hover:border-white/[0.14] hover:-translate-y-0.5">
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${s.top.replace('bg-gradient-to-r ','')}`} />

      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4 mt-0.5 sm:mt-1">
        <span className="text-sm sm:text-base font-bold text-[#e8ecf4]">{name}</span>
        {extra}
      </div>

      <div className="space-y-1.5 sm:space-y-2.5">
        <Row label="Current Value" value={<span className={s.val}>{fmt(afterVal, 2)}</span>} />
        <Row label="Total Invested" value={fmt(deposited)} />
        <Row label="Market Gain/Loss" mobileLabel="Gain/Loss"
          value={
            <span className={gainPos ? 'text-[#00d4aa]' : 'text-red-400'}>
              {(gain >= 0 ? '+' : '') + fmt(gain, 2)}
              <span className="ml-1 text-[10px] sm:text-xs opacity-70">({gainPos ? '+' : ''}{((gain / deposited) * 100).toFixed(2)}%)</span>
            </span>
          }
        />
        <Row label="Active Pool %" mobileLabel="Active %"
          value={<span className="text-base sm:text-lg font-black text-[#e8ecf4]">{fmtPct(pct)}</span>}
        />
        {sisterActive && grossPct != null && (
          <Row label="of Gross Account" mobileLabel="Gross Acc." value={<span className="text-[#6b7694]">{fmtPct(grossPct)}</span>} />
        )}
      </div>

      {/* Ownership bar */}
      <div className="mt-2 sm:mt-4 h-1 sm:h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-500`}
          style={{ width: `${(pct * 100).toFixed(2)}%` }}
        />
      </div>
    </div>
  )
}

function SisterCard({ sister, spyData, spyShares, onSharesChange, sisterVal, grossTotal }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(String(spyShares))
  const s      = PERSON_STYLES.sister
  const price  = spyData?.price ?? null
  const chgPct = spyData?.changePct ?? null
  const isPos  = chgPct != null ? chgPct >= 0 : null
  const grossPct = grossTotal > 0 ? sisterVal / grossTotal : 0
  const isSnapshot = spyData?.savedSnapshot === true
  const snapDate   = spyData?.savedDate

  function commitEdit() {
    const v = parseFloat(draft)
    if (!isNaN(v) && v !== spyShares) onSharesChange(v)
    setEditing(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#10141f] p-3 sm:p-5 transition-all hover:border-white/[0.14] hover:-translate-y-0.5">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${s.top}`} />

      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4 mt-0.5 sm:mt-1">
        <span className="text-sm sm:text-base font-bold text-[#e8ecf4]">{sister.name || 'Shai'}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e84393]/15 text-[#e84393] border border-[#e84393]/30 rounded px-1.5 py-0.5">SPY</span>
        {price != null && (
          <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isSnapshot ? 'bg-[#6b7694]/20 text-[#6b7694]' : 'bg-[#00d4aa]/15 text-[#00d4aa]'}`}>
            {isSnapshot ? (snapDate ? snapDate : 'saved') : 'live'}
          </span>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2.5">
        <Row label="Current Value"
          value={<span className="text-[#e84393]">{price != null ? fmt(sisterVal, 2) : '—'}</span>}
        />
        {/* Shares row with inline edit */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6b7694]">Shares</span>
          <div className="flex items-center gap-1.5">
            {editing ? (
              <>
                <input
                  autoFocus
                  type="number"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
                  className="w-24 bg-transparent border-b border-[#e84393] text-[#e8ecf4] font-semibold text-sm outline-none text-right"
                  step="0.000001"
                />
                <button onClick={commitEdit} className="text-[#00d4aa] text-xs font-bold hover:opacity-80">✓</button>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-[#e8ecf4]">{spyShares.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                <button
                  onClick={() => { setDraft(String(spyShares)); setEditing(true) }}
                  className="text-[#6b7694] hover:text-[#e84393] transition-colors ml-1"
                  title="Edit shares"
                >✎</button>
              </>
            )}
          </div>
        </div>
        <Row label="SPY Price" value={price != null ? `$${price.toFixed(2)}` : '—'} />
        <Row label="Total Invested" value={fmt(sister.initialInvestment || 0)} />
        {sister.initialInvestment != null && sisterVal > 0 && (() => {
          const sisterGain = sisterVal - sister.initialInvestment
          const sisterGainPct = sister.initialInvestment > 0 ? (sisterGain / sister.initialInvestment) * 100 : 0
          const gPos = sisterGain >= 0
          return (
          <Row label="Market Gain/Loss" mobileLabel="Gain/Loss"
              value={
                <span className={gPos ? 'text-[#00d4aa]' : 'text-red-400'}>
                  {(gPos ? '+' : '') + fmt(sisterGain, 2)}
                  <span className="ml-1.5 text-xs opacity-70">({gPos ? '+' : ''}{sisterGainPct.toFixed(2)}%)</span>
                </span>
              }
            />
          )
        })()}
        {sisterVal > 0 && (
          <Row label="of Gross Account" mobileLabel="Gross Acc."
            value={<span className="text-base sm:text-lg font-black text-[#e84393]">{fmtPct(grossPct)}</span>}
          />
        )}
      </div>

      <div className="mt-2 sm:mt-4 h-1 sm:h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-500`}
          style={{ width: `${(grossPct * 100).toFixed(2)}%` }}
        />
      </div>
    </div>
  )
}

function Row({ label, mobileLabel, value }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[10px] sm:text-xs text-[#6b7694] whitespace-nowrap shrink-0">
        {mobileLabel ? <><span className="sm:hidden">{mobileLabel}</span><span className="hidden sm:inline">{label}</span></> : label}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-[#e8ecf4] text-right">{value}</span>
    </div>
  )
}

export function PersonCards({ personStats, sister, spyData, spyShares, onSharesChange, sisterVal }) {
  const grossTotal = personStats.reduce((s, p) => s + p.afterVal, 0) + sisterVal

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 xl:gap-4 mb-4 sm:mb-6 xl:mb-8">
      {personStats.map(p => (
        <PersonCard
          key={p.name}
          {...p}
          sisterActive={sisterVal > 0}
          grossPct={p.grossPct}
        />
      ))}
      <SisterCard
        sister={sister}
        spyData={spyData}
        spyShares={spyShares}
        onSharesChange={onSharesChange}
        sisterVal={sisterVal}
        grossTotal={grossTotal}
      />
    </div>
  )
}
