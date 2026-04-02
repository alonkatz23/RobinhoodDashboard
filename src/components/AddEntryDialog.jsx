import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { fmt } from '../fmt'

export function AddEntryDialog({ open, onClose, onSubmit, currentTotal, spyData, spyShares }) {
  const [type, setType]         = useState('deposit')
  const [action, setAction]     = useState('')
  const [person, setPerson]     = useState('Alon')
  const [amount, setAmount]     = useState('')
  const [totalBefore, setTotalBefore] = useState('')
  const [gross, setGross]       = useState('')
  const [date, setDate]         = useState(() => new Date().toISOString().split('T')[0])

  const isMarket   = type === 'market_update'
  const spyPrice   = spyData?.price ?? null
  const sisterVal  = spyPrice != null ? spyShares * spyPrice : null
  const grossNum   = parseFloat(gross)
  const activeAuto = (!isNaN(grossNum) && grossNum > 0 && sisterVal != null) ? grossNum - sisterVal : null

  // Auto-fill active when gross changes
  useEffect(() => {
    if (activeAuto != null) setTotalBefore(String(Math.round(activeAuto)))
  }, [gross, sisterVal])

  // Reset when opened
  useEffect(() => {
    if (open) {
      setType('deposit')
      setAction('')
      setAmount('')
      setGross('')
      setDate(new Date().toISOString().split('T')[0])
      setTotalBefore(String(Math.round(currentTotal)))
    }
  }, [open, currentTotal])

  function handleSubmit() {
    if (!action.trim()) return alert('Please enter a description')
    const tb = parseFloat(totalBefore)
    if (isNaN(tb)) return alert('Please enter the active portfolio value')
    if (!isMarket) {
      const amt = parseFloat(amount)
      if (isNaN(amt)) return alert('Please enter a valid amount')
      onSubmit({ type: 'deposit', action: action.trim(), person, amount: amt, totalBefore: tb, date: date || null })
    } else {
      onSubmit({ type: 'market_update', action: action.trim(), totalBefore: tb, date: date || null })
    }
  }

  const TypeBtn = ({ t, label }) => (
    <button
      onClick={() => setType(t)}
      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
        type === t
          ? t === 'deposit'
            ? 'bg-[#7c6bff]/15 border-[#7c6bff]/40 text-[#a094ff]'
            : 'bg-[#00d4aa]/12 border-[#00d4aa]/35 text-[#00d4aa]'
          : 'bg-white/[0.03] border-white/10 text-[#6b7694] hover:text-[#e8ecf4]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>➕ New Entry</DialogTitle>
        </DialogHeader>

        {/* Type toggle */}
        <div className="flex gap-2 mb-5">
          <TypeBtn t="deposit"       label="💸 Deposit / Withdrawal" />
          <TypeBtn t="market_update" label="📊 Market Update" />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7694] block mb-1.5">Description</label>
          <Input
            value={action}
            onChange={e => setAction(e.target.value)}
            placeholder={isMarket ? 'e.g. Portfolio check – Apr 2026' : 'e.g. Alon added $10,000'}
          />
        </div>

        {/* Deposit-only fields */}
        {!isMarket && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7694] block mb-1.5">Person</label>
              <Select value={person} onValueChange={setPerson}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alon">Alon</SelectItem>
                  <SelectItem value="Noam">Noam</SelectItem>
                  <SelectItem value="Aba">Aba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7694] block mb-1.5">Amount ($)</label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 10000 or -1500" />
            </div>
          </div>
        )}

        {/* Gross calculator */}
        <div className="rounded-xl border border-[#e84393]/20 bg-[#e84393]/[0.04] p-4 mb-4 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#e84393] mb-2">📊 Gross Account Calculator</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6b7694]">Enter gross Robinhood total:</span>
            <Input
              type="number"
              value={gross}
              onChange={e => setGross(e.target.value)}
              placeholder="e.g. 450,000"
              className="w-36 text-right"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6b7694]">Sister's SPY ({spyShares} shares @ {spyPrice ? '$' + spyPrice.toFixed(2) : '—'}):</span>
            <span className="font-semibold text-[#e84393]">{sisterVal != null ? fmt(sisterVal, 2) : '— (refresh SPY)'}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-bold border-t border-white/[0.07] pt-2 mt-1">
            <span>Active portfolio (→ fills below):</span>
            <span className="text-[#00d4aa]">{activeAuto != null ? fmt(activeAuto, 2) : '—'}</span>
          </div>
        </div>

        {/* Shared fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7694] block mb-1.5">
              Active Portfolio Value ($)
            </label>
            <Input type="number" value={totalBefore} onChange={e => setTotalBefore(e.target.value)} placeholder="e.g. 425000" />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7694] block mb-1.5">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{isMarket ? 'Log Update' : 'Add Transaction'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
