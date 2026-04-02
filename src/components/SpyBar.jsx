import { RefreshCw } from 'lucide-react'
import { fmt, fmtDate } from '../fmt'

export function SpyBar({ spyData, spyShares, onSharesChange, onRefresh, isRefreshing }) {
  const price      = spyData?.price ?? null
  const change     = spyData?.change ?? null
  const changePct  = spyData?.changePct ?? null
  const isPos      = change != null ? change >= 0 : null
  const sisterVal  = price != null ? spyShares * price : null
  const isSnapshot = spyData?.savedSnapshot === true
  const snapDate   = spyData?.savedDate

  return (
    <div className="flex items-center gap-5 rounded-xl border border-[#e84393]/20 bg-[#e84393]/[0.05] px-5 py-3 mb-6 flex-wrap">
      {/* SPY Price */}
      <div className="min-w-[130px]">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7694]">SPY (S&P 500)</p>
          {price != null && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isSnapshot ? 'bg-[#6b7694]/20 text-[#6b7694]' : 'bg-[#00d4aa]/15 text-[#00d4aa]'}`}>
              {isSnapshot ? (snapDate ? fmtDate(snapDate) : 'saved') : 'live'}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-[#e8ecf4]">
            {price != null ? `$${price.toFixed(2)}` : '—'}
          </span>
          {changePct != null && (
            <span className={`text-xs font-semibold ${isPos ? 'text-[#00d4aa]' : 'text-red-400'}`}>
              {isPos ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* Sister Shares */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7694] mb-1">Sister's Shares</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={spyShares}
            onChange={e => onSharesChange(parseFloat(e.target.value) || 0)}
            className="w-24 bg-transparent border-b border-[#e84393]/40 text-[#e8ecf4] font-semibold text-sm pb-0.5 outline-none focus:border-[#e84393] text-right transition-colors"
            min="0"
            step="0.001"
          />
          <span className="text-xs text-[#6b7694]">shares</span>
        </div>
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* Sister Value */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7694] mb-1">Sister's Value</p>
        <span className="text-xl font-black text-[#e84393]">
          {sisterVal != null ? fmt(sisterVal, 2) : price == null ? '— (refresh)' : '—'}
        </span>
      </div>

      {change != null && (
        <>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7694] mb-1">Day Change</p>
            <span className={`text-sm font-semibold ${isPos ? 'text-[#00d4aa]' : 'text-red-400'}`}>
              {isPos ? '+' : ''}{change.toFixed(2)} ({isPos ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          </div>
        </>
      )}

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="ml-auto flex items-center gap-1.5 rounded-lg border border-[#e84393]/25 px-3 py-1.5 text-xs font-semibold text-[#e84393] hover:bg-[#e84393]/10 transition-colors disabled:opacity-60"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  )
}
