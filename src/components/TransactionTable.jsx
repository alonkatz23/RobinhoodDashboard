import { Trash2 } from 'lucide-react'
import { Badge } from './ui/badge'
import { fmt, fmtPct, fmtDate } from '../fmt'

const PERSON_COLORS = {
  Alon: 'alon',
  Noam: 'noam',
  Aba:  'aba',
}

function CellInput({ value, onChange, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      defaultValue={value}
      onBlur={e => {
        const v = type === 'number' ? parseFloat(e.target.value) : e.target.value
        if (v !== value) onChange(v)
      }}
      className={`w-full bg-transparent border-b border-transparent text-[#e8ecf4] text-sm font-medium outline-none focus:border-[#7c6bff] transition-colors py-0.5 ${className}`}
    />
  )
}

function PersonSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-transparent border-none text-sm font-medium text-[#e8ecf4] outline-none cursor-pointer appearance-none focus:ring-0"
    >
      <option value="Alon" className="bg-[#1a1f30]">Alon</option>
      <option value="Noam" className="bg-[#1a1f30]">Noam</option>
      <option value="Aba"  className="bg-[#1a1f30]">Aba</option>
    </select>
  )
}

export function TransactionTable({ rows, onUpdateTx, onDeleteTx }) {
  return (
    <div>
      {/* ── Mobile card list (hidden on md+) ─────────────────────── */}
      <div className="md:hidden space-y-2 mb-4">
        {rows.length === 0 && (
          <div className="text-center text-sm text-[#6b7694] py-6">No transactions yet</div>
        )}
        {rows.map(({ tx, isMarket, pctChange, alonPct, noamPct, abaPct, newTotal }) => {
          const isDeposit    = !isMarket && (tx.amount || 0) > 0
          const isWithdrawal = !isMarket && (tx.amount || 0) < 0
          const mktPct = pctChange > 0 ? ((pctChange - 1) * 100) : null
          const mktPctPos = mktPct != null && mktPct >= 0
          const cardStyle = isMarket
            ? 'border-l-4 border-l-blue-400 bg-blue-500/35'
            : isDeposit
            ? 'border-l-4 border-l-green-400 bg-green-500/35'
            : 'border-l-4 border-l-red-400 bg-red-500/35'

          return (
            <div key={tx.id} className={`rounded-xl border border-white/[0.07] pl-4 pr-4 py-3 ${cardStyle}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isMarket
                      ? <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30 rounded px-1.5 py-0.5">📊 Market Update</span>
                      : <span className={`text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border ${isDeposit ? 'bg-green-500/20 text-green-300 border-green-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'}`}>{isDeposit ? '↑ Deposit' : '↓ Withdrawal'}</span>
                    }
                    {!isMarket && tx.person && (
                      <span className="text-[10px] font-semibold text-[#6b7694]">{tx.person}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#e8ecf4] truncate">{tx.action || '—'}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-[#6b7694]">Total: <span className="text-[#e8ecf4] font-semibold">{fmt(newTotal)}</span></span>
                    {mktPct != null && Math.abs(mktPct) > 0.001 && (
                      <span className={`text-xs font-semibold ${mktPctPos ? 'text-[#00d4aa]' : 'text-red-400'}`}>{mktPctPos ? '+' : ''}{mktPct.toFixed(2)}%</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {!isMarket && (
                    <div className={`text-base font-bold ${isDeposit ? 'text-green-400' : 'text-red-400'}`}>
                      {isDeposit ? '+' : ''}{fmt(tx.amount || 0)}
                    </div>
                  )}
                  <div className="text-[11px] text-[#6b7694] mt-0.5">{tx.date ? fmtDate(tx.date) : '—'}</div>
                  <button onClick={() => onDeleteTx(tx.id)} className="mt-1 text-[#6b7694] hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop table (hidden on mobile) ─────────────────────── */}
      <div className="hidden md:block rounded-xl border border-white/[0.07] bg-[#10141f] overflow-hidden">
        {/* Header */}
        <div className="grid px-5 py-2.5 bg-[#161b2a] border-b border-white/[0.07]" style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr 1.2fr 0.8fr 0.8fr 0.8fr 1.2fr' }}>
          {['Description','Person','Mkt Val Before','Δ Amount','% Mkt Chg','New Total','Alon %','Noam %','Aba %','Date'].map(h => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-[0.8px] text-[#6b7694]">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {rows.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-[#6b7694]">No transactions yet — add one above</div>
        )}
        {rows.map(({ tx, isMarket, pctChange, alonPct, noamPct, abaPct, newTotal }) => {
          const mktPct    = pctChange > 0 ? ((pctChange - 1) * 100) : null
          const mktPctPos = mktPct != null && mktPct >= 0
          const isDeposit    = !isMarket && (tx.amount || 0) > 0
          const isWithdrawal = !isMarket && (tx.amount || 0) < 0

          // Row style: left border accent + visible bg tint per type
          const rowStyle = isMarket
            ? 'border-l-4 border-l-blue-400 bg-blue-500/35 hover:bg-blue-500/45'
            : isDeposit
            ? 'border-l-4 border-l-green-400 bg-green-500/35 hover:bg-green-500/45'
            : 'border-l-4 border-l-red-400 bg-red-500/35 hover:bg-red-500/45'

          return (
            <div
              key={tx.id}
              className={`grid pl-4 pr-5 py-3 border-b border-white/[0.05] last:border-0 transition-colors items-center gap-2 ${rowStyle}`}
              style={{ gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr 1.2fr 0.8fr 0.8fr 0.8fr 1.2fr' }}
            >
              {/* Description */}
              <CellInput value={tx.action} onChange={v => onUpdateTx(tx.id, 'action', v)} />

              {/* Person */}
              <div>
                {isMarket
                  ? <Badge variant="market">📊 Market</Badge>
                  : <Badge variant={PERSON_COLORS[tx.person] || 'default'}>
                      <PersonSelect value={tx.person} onChange={v => onUpdateTx(tx.id, 'person', v)} />
                    </Badge>
                }
              </div>

              {/* Market val before */}
              <CellInput type="number" value={tx.totalBefore} onChange={v => onUpdateTx(tx.id, 'totalBefore', v)} />

              {/* Amount */}
              {isMarket
                ? <span className="text-xs text-[#6b7694]">—</span>
                : <CellInput
                    type="number"
                    value={tx.amount}
                    onChange={v => onUpdateTx(tx.id, 'amount', v)}
                    className={isDeposit ? 'text-[#00d4aa] font-semibold' : 'text-red-400 font-semibold'}
                  />
              }

              {/* % market change */}
              <span className={`text-sm tabular-nums ${mktPct == null ? 'text-[#6b7694]' : mktPctPos ? 'text-[#00d4aa]' : 'text-red-400'}`}>
                {mktPct != null ? (mktPctPos ? '+' : '') + mktPct.toFixed(2) + '%' : '—'}
              </span>

              {/* New total */}
              <span className="text-sm font-semibold text-[#e8ecf4]">{fmt(newTotal)}</span>

              {/* Percentages */}
              <span className="text-[13px] tabular-nums text-[#a094ff]">{fmtPct(alonPct)}</span>
              <span className="text-[13px] tabular-nums text-[#00d4aa]">{fmtPct(noamPct)}</span>
              <span className="text-[13px] tabular-nums text-[#ff9f43]">{fmtPct(abaPct)}</span>

              {/* Date + delete */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={tx.date || ''}
                  onChange={e => onUpdateTx(tx.id, 'date', e.target.value || null)}
                  className="bg-transparent border-none text-[11px] text-[#6b7694] outline-none cursor-pointer w-[90px]"
                />
                <button
                  onClick={() => onDeleteTx(tx.id)}
                  className="p-1 rounded-md text-[#6b7694] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


