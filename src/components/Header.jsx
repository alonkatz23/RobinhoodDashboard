import { TrendingUp, Save, Loader2 } from 'lucide-react'
import { Button } from './ui/button'

export function Header({ saveStatus, onAddEntry }) {
  const dotColor = {
    saved:   'bg-[#00d4aa]',
    saving:  'bg-[#ffcc6b] animate-pulse',
    error:   'bg-red-400',
    idle:    'bg-[#6b7694]',
  }[saveStatus.state] || 'bg-[#6b7694]'

  const labelColor = {
    saved:  'text-[#00d4aa]',
    saving: 'text-[#ffcc6b]',
    error:  'text-red-400',
    idle:   'text-[#6b7694]',
  }[saveStatus.state] || 'text-[#6b7694]'

  return (
    <header className="flex items-center justify-between py-5 sm:py-7 border-b border-white/[0.07] mb-6 sm:mb-9">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#7c6bff] to-[#00d4aa] flex items-center justify-center shadow-lg shrink-0">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#e8ecf4]">Portfolio Tracker</h1>
          <span className="hidden sm:block text-xs text-[#6b7694]">Alon · Noam · Aba</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className={`hidden sm:flex items-center gap-2 text-xs font-medium ${labelColor}`}>
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span>{saveStatus.label}</span>
        </div>
        {/* Mobile: just the dot */}
        <div className={`sm:hidden w-2 h-2 rounded-full ${dotColor}`} title={saveStatus.label} />
        <Button onClick={onAddEntry} size="sm" className="sm:text-sm">
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">Add Entry</span>
        </Button>
      </div>
    </header>
  )
}
