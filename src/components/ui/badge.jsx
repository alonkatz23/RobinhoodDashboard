import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-white/[0.08] text-[#6b7694]',
    alon: 'bg-[#7c6bff]/20 text-[#a094ff] border border-[#7c6bff]/30',
    noam: 'bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/25',
    aba:  'bg-[#ff9f43]/15 text-[#ff9f43] border border-[#ff9f43]/25',
    sister: 'bg-[#e84393]/15 text-[#e84393] border border-[#e84393]/25',
    market: 'bg-[#00d4aa]/12 text-[#00d4aa] border border-[#00d4aa]/25',
    gain: 'bg-[#00d4aa]/15 text-[#00d4aa]',
    loss: 'bg-red-500/15 text-red-400',
  }
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold', variants[variant] || variants.default, className)} {...props} />
  )
}
