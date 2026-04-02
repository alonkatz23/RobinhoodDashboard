import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-[#e8ecf4] placeholder:text-[#6b7694] focus:border-[#7c6bff] focus:outline-none transition-colors',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
export { Input }
