import { useState, useEffect, useCallback, useRef } from 'react'
import { loadData, saveData, fetchSpyPrice } from './api'
import { calcAll, calcSummary, calcPersonStats, calcChartData } from './calc'
import { Header } from './components/Header'
import { SummaryCards } from './components/SummaryCards'
import { PersonCards } from './components/PersonCards'
import { TransactionTable } from './components/TransactionTable'
import { AddEntryDialog } from './components/AddEntryDialog'
import { PortfolioCharts } from './components/PortfolioCharts'

function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export default function App() {
  const CACHE_KEY = 'portfolio_cache'
  function readCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) } catch { return null } }
  function writeCache(d) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)) } catch {} }

  const cached = readCache()
  const [loading, setLoading]           = useState(!cached)   // skeleton only on very first visit
  const [transactions, setTransactions] = useState(cached?.transactions || [])
  const [initial, setInitial]           = useState(cached?.initial || { alon: 0, noam: 0, aba: 0 })
  const [sister, setSister]             = useState(cached?.sister || { name: 'Shai', spyShares: 0 })
  const [spyData, setSpyData]           = useState(null)
  const [spyShares, setSpyShares]       = useState(cached?.sister?.spyShares ?? 0)
  const [isRefreshingSpy, setIsRefreshingSpy] = useState(false)
  const [nextId, setNextId]             = useState(cached?.nextId ?? 1)
  const [dialogOpen, setDialogOpen]     = useState(false)
  const [saveStatus, setSaveStatus]     = useState({ state: 'idle', label: 'Connecting…' })

  // ── Load (stale-while-revalidate) ───────────────────────────────
  useEffect(() => {
    loadData().then(data => {
      const txs = data.transactions || []
      setInitial(data.initial || { alon: 0, noam: 0, aba: 0 })
      setTransactions(txs)
      setNextId(data.nextId || 1)
      setSister(data.sister || { name: 'Shai', spyShares: 0 })
      setSpyShares(data.sister?.spyShares ?? 0)
      setSaveStatus({ state: 'saved', label: 'Loaded ✓' })
      setLoading(false)
      writeCache(data)   // keep cache fresh for next refresh

      // Restore SPY price from the last market update
      const lastWithSpy = [...txs].reverse().find(t => t.type === 'market_update' && t.spyPrice)
      if (lastWithSpy) {
        setSpyData({ price: lastWithSpy.spyPrice, change: null, changePct: null, savedSnapshot: true, savedDate: lastWithSpy.date })
      }
    }).catch(() => {
      setSaveStatus({ state: 'error', label: 'Server not reachable' })
      setLoading(false)
    })
  }, [])

  // ── SPY ─────────────────────────────────────────────────────────
  async function refreshSpy() {
    setIsRefreshingSpy(true)
    try {
      const data = await fetchSpyPrice()
      setSpyData({ ...data, savedSnapshot: false })
      return data
    } catch (e) {
      console.error('SPY fetch failed', e)
      return null
    } finally {
      setIsRefreshingSpy(false)
    }
  }

  // ── Save ────────────────────────────────────────────────────────
  const doSave = useCallback(async (txs, init, sid, shares, nid) => {
    setSaveStatus({ state: 'saving', label: 'Saving…' })
    try {
      const payload = { initial: init, transactions: txs, nextId: nid, sister: { ...sid, spyShares: shares } }
      await saveData(payload)
      writeCache(payload)   // keep localStorage in sync after every save
      setSaveStatus({ state: 'saved', label: 'Saved ✓' })
    } catch {
      setSaveStatus({ state: 'error', label: 'Save failed' })
    }
  }, [])

  const debouncedSave = useDebounce(doSave, 600)

  function triggerSave(txs, init, sid, shares, nid) {
    setSaveStatus({ state: 'saving', label: 'Saving…' })
    debouncedSave(txs, init, sid, shares, nid)
  }

  // ── Mutations ───────────────────────────────────────────────────
  function updateInitial(key, value) {
    const next = { ...initial, [key]: value }
    setInitial(next)
    triggerSave(transactions, next, sister, spyShares, nextId)
  }

  function updateTx(id, field, value) {
    const next = transactions.map(t => t.id === id ? { ...t, [field]: value } : t)
    setTransactions(next)
    triggerSave(next, initial, sister, spyShares, nextId)
  }

  function deleteTx(id) {
    if (!confirm('Delete this transaction?')) return
    const next = transactions.filter(t => t.id !== id)
    setTransactions(next)
    triggerSave(next, initial, sister, spyShares, nextId)
  }

  async function addEntry(entry) {
    let finalEntry = { ...entry }

    // For market updates, fetch SPY price and embed it into the transaction
    if (entry.type === 'market_update') {
      const livespy = await refreshSpy()
      if (livespy?.price) {
        finalEntry.spyPrice = livespy.price
      }
    }

    const next = [...transactions, { id: nextId, ...finalEntry }]
    const nid  = nextId + 1
    setTransactions(next)
    setNextId(nid)
    setDialogOpen(false)
    triggerSave(next, initial, sister, spyShares, nid)
  }

  function updateSpyShares(shares) {
    setSpyShares(shares)
    triggerSave(transactions, initial, sister, shares, nextId)
  }

  // ── Derived ─────────────────────────────────────────────────────
  const rows        = calcAll(transactions, initial)
  const sisterVal   = spyData?.price ? spyShares * spyData.price : 0
  const summary     = calcSummary(rows, initial, transactions, sisterVal)
  const personStats = calcPersonStats(rows, initial, transactions, sisterVal)
  const chartData    = calcChartData(rows, initial, transactions)
  const currentTotal = summary.current

  // ── Skeleton while loading ───────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between py-5 sm:py-7 border-b border-white/[0.07] mb-6 sm:mb-9">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08]" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 rounded bg-white/[0.08]" />
              <div className="h-3 w-20 rounded bg-white/[0.05]" />
            </div>
          </div>
          <div className="h-8 w-24 rounded-lg bg-white/[0.08]" />
        </div>
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-[#10141f] border border-white/[0.07] p-5 h-24" />
          ))}
        </div>
        {/* Person cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl bg-[#10141f] border border-white/[0.07] p-5 h-48" />
          ))}
        </div>
        {/* Table skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl bg-[#10141f] border border-white/[0.07] h-14" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 pb-16">
      <Header saveStatus={saveStatus} onAddEntry={() => setDialogOpen(true)} />

      <SummaryCards summary={summary} />

      <PortfolioCharts chartData={chartData} personStats={personStats} />

      <PersonCards
        personStats={personStats}
        sister={sister}
        spyData={spyData}
        spyShares={spyShares}
        onSharesChange={updateSpyShares}
        sisterVal={sisterVal}
      />

      <div className="mb-3">
        <h2 className="text-base font-bold text-[#e8ecf4]">Transaction Log</h2>
        <p className="text-xs text-[#6b7694] mt-0.5">All calculations update automatically · changes auto-save to data.json</p>
      </div>

      <TransactionTable
        rows={rows}
        onUpdateTx={updateTx}
        onDeleteTx={deleteTx}
      />

      <AddEntryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={addEntry}
        currentTotal={currentTotal}
        spyData={spyData}
        spyShares={spyShares}
      />
    </div>
  )
}
