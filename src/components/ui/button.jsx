import * as React from 'react'
import { cn } from '@/lib/utils'

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all focus-visible:outline-none disabled:opacity-50 cursor-pointer font-[Inter]'
  const variants = {
    default: 'bg-gradient-to-br from-[#7c6bff] to-[#5a4de0] text-white shadow-[0_4px_20px_rgba(124,107,255,0.3)] hover:shadow-[0_6px_28px_rgba(124,107,255,0.45)] hover:-translate-y-px active:translate-y-0',
    ghost: 'border border-white/10 text-[#6b7694] hover:bg-white/[0.04] hover:text-white',
    destructive: 'border border-red-500/20 text-red-400 hover:bg-red-500/10',
    outline: 'border border-white/10 bg-transparent hover:bg-white/[0.04] text-[#e8ecf4]',
  }
  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-7 px-3 text-xs',
    lg: 'h-11 px-6 text-sm',
    icon: 'h-8 w-8',
  }
  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
})
Button.displayName = 'Button'
export { Button }
