import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { fmt, fmtPct, fmtDate } from '../fmt'

function MetricCard({ label, value, sub, subColor }) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-3 px-3 sm:pb-2 sm:pt-5 sm:px-5">
        <CardTitle className="text-[9px] sm:text-[10px]">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="text-lg sm:text-[28px] font-black tracking-tight leading-none text-[#e8ecf4] mb-1 sm:mb-2">{value}</div>
        {sub && (
          <div className={`text-[10px] sm:text-xs leading-tight ${subColor || 'text-[#6b7694]'}`}>{sub}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function SummaryCards({ summary }) {
  const { current, totalDeposited, marketGain, gainPct, deposits, withdrawals, mktUpdates, lastDate, last } = summary

  const gainPos  = marketGain >= 0
  const lastIsMarket = last?.isMarket

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
      <MetricCard
        label="Total Portfolio"
        value={fmt(current)}
        sub={`Total deposited: ${fmt(totalDeposited)}`}
      />
      <MetricCard
        label="Market Gain"
        value={(marketGain >= 0 ? '+' : '') + fmt(marketGain, 2)}
        sub={
          <span className={gainPos ? 'text-[#00d4aa]' : 'text-red-400'}>
            {fmtPct(Math.abs(gainPct))} return on deposits
          </span>
        }
        subColor={gainPos ? 'text-[#00d4aa]' : 'text-red-400'}
      />
      <MetricCard
        label="Log Entries"
        value={deposits + withdrawals + mktUpdates}
        sub={`${deposits} deposits · ${withdrawals} withdrawals · ${mktUpdates} mkt updates`}
      />
      <MetricCard
        label="Last Event"
        value={last ? (lastIsMarket ? fmt(last.newTotal) : (last.tx.amount >= 0 ? '+' : '') + fmt(last.tx.amount)) : '—'}
        sub={lastDate ? fmtDate(lastDate) : '(no date)'}
      />
    </div>
  )
}
