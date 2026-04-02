import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { fmt } from '../fmt'

const PIE_SLICES = [
  { key: 'alon', label: 'Alon', color: '#7c6bff' },
  { key: 'noam', label: 'Noam', color: '#00d4aa' },
  { key: 'aba',  label: 'Aba',  color: '#f59e0b' },
]

function polarToXY(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function slicePath(cx, cy, r, s, e) {
  const p = polarToXY(cx, cy, r, s), q = polarToXY(cx, cy, r, e)
  return `M ${cx} ${cy} L ${p.x} ${p.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${q.x} ${q.y} Z`
}

function fmtK(v) {
  if (v == null) return ''
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`
  return `$${v}`
}

function fmtDate(d) {
  if (!d) return ''
  const [, m, day] = d.split('-')
  return `${m}/${day}`
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1a1f30',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  fontSize: 12,
  color: '#e8ecf4',
}

function ValueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={TOOLTIP_STYLE} className="p-2.5 space-y-0.5">
      <p className="text-[10px] text-[#6b7694] uppercase tracking-wider mb-1">{d?.label}</p>
      <p className="font-bold text-[#a094ff]">Total: ${d?.total?.toLocaleString()}</p>
      <p className="text-[#6b7694]">Deposited: ${d?.deposited?.toLocaleString()}</p>
    </div>
  )
}

function GainTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  const pos = (d?.gain ?? 0) >= 0
  return (
    <div style={TOOLTIP_STYLE} className="p-2.5 space-y-0.5">
      <p className="text-[10px] text-[#6b7694] uppercase tracking-wider mb-1">{d?.label}</p>
      <p className={`font-bold ${pos ? 'text-[#00d4aa]' : 'text-red-400'}`}>
        {pos ? '+' : ''}${d?.gain?.toLocaleString()}
      </p>
      <p className={`text-xs ${pos ? 'text-[#00d4aa]' : 'text-red-400'}`}>
        {pos ? '+' : ''}{d?.gainPct?.toFixed(2)}%
      </p>
    </div>
  )
}

export function PortfolioCharts({ chartData, personStats }) {
  if (!chartData?.length) return null

  // ── Pie data ─────────────────────────────────────────────────────
  const pieValues = {
    alon: personStats?.find(p => p.name === 'Alon')?.afterVal ?? 0,
    noam: personStats?.find(p => p.name === 'Noam')?.afterVal ?? 0,
    aba:  personStats?.find(p => p.name === 'Aba')?.afterVal  ?? 0,
  }
  const pieTotal = Object.values(pieValues).reduce((s, v) => s + v, 0)
  let cursor = 0
  const pieSlices = PIE_SLICES.map(s => {
    const pct = pieTotal > 0 ? pieValues[s.key] / pieTotal : 0
    const sweep = pct * 360
    const start = cursor + 1, end = cursor + sweep - 1
    cursor += sweep
    return { ...s, pct, value: pieValues[s.key], start, end, sweep }
  }).filter(s => s.sweep > 1)
  const cx = 100, cy = 100, r = 80

  // Only show market updates on the gain chart (deposits inflate it misleadingly)
  const gainData = chartData.filter(d => d.isMarket || d === chartData[chartData.length - 1])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">

      {/* ── Donut Pie ──────────────────────────────────────────────── */}
      {pieTotal > 0 && (
      <div className="rounded-xl border border-white/[0.07] bg-[#10141f] p-4 sm:p-5 flex flex-col">
        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b7694] mb-1">Distribution</h2>
        <p className="text-[10px] text-[#6b7694]/70 mb-4">Active pool (Alon · Noam · Aba)</p>
        <div className="flex-1 flex items-center justify-center gap-6">
          <svg viewBox="0 0 200 200" className="w-[45%] max-w-[180px] shrink-0 drop-shadow-xl">
            <defs>{PIE_SLICES.map(s => (
              <radialGradient key={s.key} id={`p-${s.key}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={s.color} stopOpacity="1" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.7" />
              </radialGradient>
            ))}</defs>
            {pieSlices.map(s => <path key={s.key} d={slicePath(cx, cy, r, s.start, s.end)} fill={`url(#p-${s.key})`} className="hover:opacity-90 transition-opacity" />)}
            <circle cx={cx} cy={cy} r={46} fill="#10141f" />
            <text x={cx} y={cy - 5}  textAnchor="middle" fill="#e8ecf4" fontSize="13" fontWeight="800">{fmt(pieTotal, 0)}</text>
            <text x={cx} y={cy + 11} textAnchor="middle" fill="#6b7694" fontSize="8" fontWeight="600" letterSpacing="1">TOTAL</text>
          </svg>
          <div className="space-y-2">
            {pieSlices.map(s => (
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
      )}

      {/* ── Portfolio Value Over Time ─────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.07] bg-[#10141f] p-4 sm:p-5">
        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b7694] mb-1">Portfolio Value Over Time</h2>
        <p className="text-[10px] text-[#6b7694]/70 mb-4">Active pool (Alon · Noam · Aba)</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7c6bff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7c6bff" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="depositGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6b7694" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#6b7694" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#6b7694', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtK}  tick={{ fill: '#6b7694', fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip content={<ValueTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="deposited" stroke="#6b7694"  strokeWidth={1.5} strokeDasharray="4 3" fill="url(#depositGrad)" dot={false} />
            <Area type="monotone" dataKey="total"     stroke="#7c6bff"  strokeWidth={2}   fill="url(#totalGrad)"   dot={{ fill: '#7c6bff', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a094ff' }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#7c6bff]"/><span className="text-[10px] text-[#6b7694]">Portfolio</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#6b7694] border-dashed border-t border-[#6b7694]"/><span className="text-[10px] text-[#6b7694]">Deposited</span></div>
        </div>
      </div>

      {/* ── Gain / Loss Over Time ─────────────────────────────────── */}
      <div className="rounded-xl border border-white/[0.07] bg-[#10141f] p-4 sm:p-5">
        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6b7694] mb-1">Market Gain / Loss</h2>
        <p className="text-[10px] text-[#6b7694]/70 mb-4">Unrealised gain vs total deposited</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={fmtDate} tick={{ fill: '#6b7694', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtK}  tick={{ fill: '#6b7694', fontSize: 10 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip content={<GainTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
            <Bar dataKey="gain" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.gain >= 0 ? '#00d4aa' : '#f87171'} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#00d4aa]"/><span className="text-[10px] text-[#6b7694]">Gain</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400"/><span className="text-[10px] text-[#6b7694]">Loss</span></div>
        </div>
      </div>

    </div>
  )
}
