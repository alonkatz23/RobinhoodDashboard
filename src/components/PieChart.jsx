import { fmt } from '../fmt'

// Only Alon, Noam, Aba
const SLICES = [
  { key: 'alon', label: 'Alon', color: '#7c6bff' },
  { key: 'noam', label: 'Noam', color: '#00d4aa' },
  { key: 'aba',  label: 'Aba',  color: '#f59e0b' },
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

export function PortfolioPieChart({ personStats }) {
  const values = {
    alon: personStats.find(p => p.name === 'Alon')?.afterVal ?? 0,
    noam: personStats.find(p => p.name === 'Noam')?.afterVal ?? 0,
    aba:  personStats.find(p => p.name === 'Aba')?.afterVal  ?? 0,
  }
  const total = Object.values(values).reduce((s, v) => s + v, 0)
  if (total <= 0) return null

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
    <div className="rounded-xl border border-white/[0.07] bg-[#10141f] p-4 sm:p-5 mb-4 sm:mb-6 w-full max-w-xs mx-auto sm:mx-0 sm:max-w-[280px]">
      <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b7694] mb-4">Distribution</h2>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200" className="w-28 h-28 drop-shadow-xl">
            <defs>
              {SLICES.map(s => (
                <radialGradient key={s.key} id={`pie-${s.key}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor={s.color} stopOpacity="1"   />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.7" />
                </radialGradient>
              ))}
            </defs>
            {slices.map(s => (
              <path key={s.key} d={slicePath(cx, cy, r, s.start, s.end)}
                fill={`url(#pie-${s.key})`} className="hover:opacity-90 cursor-default transition-opacity" />
            ))}
            <circle cx={cx} cy={cy} r={46} fill="#10141f" />
            <text x={cx} y={cy - 5}  textAnchor="middle" fill="#e8ecf4" fontSize="13" fontWeight="800">{fmt(total, 0)}</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fill="#6b7694" fontSize="8"  fontWeight="600" letterSpacing="1">TOTAL</text>
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 min-w-0">
          {slices.map(s => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#e8ecf4]">{s.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: s.color }}>{(s.pct * 100).toFixed(1)}%</span>
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
