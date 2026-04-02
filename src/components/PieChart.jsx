import { fmt, fmtPct } from '../fmt'

const SLICES = [
  { key: 'alon', label: 'Alon', color: '#7c6bff', fill: 'url(#alon)' },
  { key: 'noam', label: 'Noam', color: '#00d4aa', fill: 'url(#noam)' },
  { key: 'aba',  label: 'Aba',  color: '#f59e0b', fill: 'url(#aba)'  },
  { key: 'shai', label: 'Shai', color: '#e84393', fill: 'url(#shai)' },
]

function polarToXY(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(cx, cy, r, startDeg, endDeg) {
  const s = polarToXY(cx, cy, r, startDeg)
  const e = polarToXY(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`
}

export function PortfolioPieChart({ personStats, sisterVal }) {
  const total = personStats.reduce((s, p) => s + p.afterVal, 0) + sisterVal
  if (total <= 0) return null

  const values = {
    alon: personStats.find(p => p.name === 'Alon')?.afterVal ?? 0,
    noam: personStats.find(p => p.name === 'Noam')?.afterVal ?? 0,
    aba:  personStats.find(p => p.name === 'Aba')?.afterVal  ?? 0,
    shai: sisterVal,
  }

  const cx = 100, cy = 100, r = 80, gap = 2
  let cursor = 0
  const slices = SLICES.map(s => {
    const pct   = values[s.key] / total
    const sweep = pct * 360
    const start = cursor + gap / 2
    const end   = cursor + sweep - gap / 2
    cursor      += sweep
    return { ...s, pct, value: values[s.key], start, end, sweep }
  }).filter(s => s.sweep > 1)

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#10141f] p-4 sm:p-5 mb-4 sm:mb-6">
      <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b7694] mb-4">Portfolio Distribution</h2>

      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        {/* Pie */}
        <div className="shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200" className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-xl">
            <defs>
              {SLICES.map(s => (
                <radialGradient key={s.key} id={s.key} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={s.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.7" />
                </radialGradient>
              ))}
            </defs>
            {slices.map(s => (
              <path
                key={s.key}
                d={slicePath(cx, cy, r, s.start, s.end)}
                fill={s.fill}
                className="transition-opacity hover:opacity-90 cursor-default"
              />
            ))}
            {/* Center hole */}
            <circle cx={cx} cy={cy} r={46} fill="#10141f" />
            {/* Center text */}
            <text x={cx} y={cy - 6}  textAnchor="middle" fill="#e8ecf4" fontSize="13" fontWeight="800">{fmt(total, 0)}</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fill="#6b7694" fontSize="8"  fontWeight="600" letterSpacing="1">TOTAL</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-2.5 w-full sm:w-auto">
          {slices.map(s => (
            <div key={s.key} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-[#e8ecf4]">{s.label}</span>
                  <span className="text-[10px] sm:text-xs font-bold" style={{ color: s.color }}>{(s.pct * 100).toFixed(1)}%</span>
                </div>
                <div className="text-[10px] text-[#6b7694]">{fmt(s.value, 0)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
