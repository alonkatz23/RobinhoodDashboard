import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { fmt } from '../fmt'

export function AddEntryDialog({ open, onClose, onSubmit, currentTotal, spyData, spyShares, onRefreshSpy }) {
  const [type, setType]               = useState('deposit')
  const [action, setAction]           = useState('')
  const [person, setPerson]           = useState('Alon')
  const [amount, setAmount]           = useState('')
  const [totalBefore, setTotalBefore] = useState('')
  const [gross, setGross]             = useState('')
  const [date, setDate]               = useState(() => new Date().toISOString().split('T')[0])
  const [spyLoading, setSpyLoading]   = useState(false)
  const [spyError, setSpyError]       = useState(false)

  const isMarket   = type === 'market_update'
  const spyPrice   = spyData?.price ?? null
  const sisterVal  = spyPrice != null ? spyShares * spyPrice : null
  const grossNum   = parseFloat(gross)
  const activeAuto = (!isNaN(grossNum) && grossNum > 0 && sisterVal != null) ? grossNum - sisterVal : null

  useEffect(() => {
    if (activeAuto != null) setTotalBefore(String(Math.round(activeAuto)))
  }, [gross, sisterVal])

  useEffect(() => {
    if (open) {
      setType('deposit')
      setAction('')
      setAmount('')
      setGross('')
      setSpyError(false)
      setDate(new Date().toISOString().split('T')[0])
      setTotalBefore(String(Math.round(currentTotal)))
      // Auto-refresh SPY so gross calculator has a live price
      if (onRefreshSpy) {
        setSpyLoading(true)
        onRefreshSpy()
          .catch(() => setSpyError(true))
          .finally(() => setSpyLoading(false))
      }
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

  const Label = ({ children }) => (
    <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#6b7694] block mb-1">
      {children}
    </label>
  )

  const TypeBtn = ({ t, label }) => (
    <button
      onClick={() => setType(t)}
      className={`flex-1 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all border ${
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
      <DialogContent className="w-[95vw] max-w-[520px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2 sm:mb-4">
          <DialogTitle className="text-base sm:text-lg">➕ New Entry</DialogTitle>
        </DialogHeader>

        {/* Type toggle */}
        <div className="flex gap-2 mb-3 sm:mb-5">
          <TypeBtn t="deposit"       label="💸 Deposit / Withdrawal" />
          <TypeBtn t="market_update" label="📊 Market Update" />
        </div>

        {/* Description */}
        <div className="mb-2.5 sm:mb-4">
          <Label>Description</Label>
          <Input
            value={action}
            onChange={e => setAction(e.target.value)}
            placeholder={isMarket ? 'e.g. Portfolio check – Apr 2026' : 'e.g. Alon added $10,000'}
            className="h-8 sm:h-10 text-sm"
          />
        </div>

        {/* Deposit-only fields */}
        {!isMarket && (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-2.5 sm:mb-4">
            <div>
              <Label>Person</Label>
              <Select value={person} onValueChange={setPerson}>
                <SelectTrigger className="h-8 sm:h-10 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alon">Alon</SelectItem>
                  <SelectItem value="Noam">Noam</SelectItem>
                  <SelectItem value="Aba">Aba</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount ($)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 10000" className="h-8 sm:h-10 text-sm" />
            </div>
          </div>
        )}

        {/* Gross calculator */}
        <div className="rounded-xl border border-[#e84393]/20 bg-[#e84393]/[0.04] p-2.5 sm:p-4 mb-2.5 sm:mb-4 space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#e84393]">📊 Gross Account Calculator</p>
            {spyLoading && <span className="text-[9px] text-[#6b7694] animate-pulse">fetching SPY…</span>}
            {spyError   && <span className="text-[9px] text-red-400">SPY unavailable</span>}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="text-[#6b7694]">Gross Robinhood total:</span>
            <Input
              type="number"
              value={gross}
              onChange={e => setGross(e.target.value)}
              placeholder="e.g. 450000"
              className="w-28 sm:w-36 h-7 sm:h-9 text-right text-xs sm:text-sm"
            />
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#6b7694]">
              <span className="sm:hidden">Shai's SPY:</span>
              <span className="hidden sm:inline">Sister's SPY ({spyShares} shares @ {spyLoading ? '…' : spyPrice ? '$' + spyPrice.toFixed(2) : '—'}):</span>
            </span>
            <span className="font-semibold text-[#e84393]">{spyLoading ? '…' : sisterVal != null ? fmt(sisterVal, 2) : '—'}</span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold border-t border-white/[0.07] pt-1.5">
            <span>
              <span className="sm:hidden">Active portfolio:</span>
              <span className="hidden sm:inline">Active portfolio (→ fills below):</span>
            </span>
            <span className="text-[#00d4aa]">{activeAuto != null ? fmt(activeAuto, 2) : '—'}</span>
          </div>
        </div>

        {/* Shared fields */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <Label>
              <span className="sm:hidden">Active Value ($)</span>
              <span className="hidden sm:inline">Active Portfolio Value ($)</span>
            </Label>
            <Input type="number" value={totalBefore} onChange={e => setTotalBefore(e.target.value)} placeholder="e.g. 425000" className="h-8 sm:h-10 text-sm" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 sm:h-10 text-sm" />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} className="h-8 sm:h-10 text-sm">Cancel</Button>
          <Button onClick={handleSubmit} className="h-8 sm:h-10 text-sm">{isMarket ? 'Log Update' : 'Add Transaction'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
