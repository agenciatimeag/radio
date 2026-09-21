import type { ButtonHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const buttonVariants = cva(
  'inline-flex w-full items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        gold: 'bg-gradient-to-b from-gold to-gold-600 text-forest-950 shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_10px_30px_-10px_rgba(217,184,114,0.65)]',
        outline: 'border border-gold/35 bg-white/[0.03] text-gold backdrop-blur-sm',
        dark: 'bg-forest-900 text-cream shadow-[0_10px_24px_-12px_rgba(10,36,30,0.5)]',
      },
      size: {
        default: 'px-6 py-4',
        sm: 'px-4 py-2.5 text-xs',
      },
    },
    defaultVariants: { variant: 'gold', size: 'default' },
  },
)

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'ref'> &
  VariantProps<typeof buttonVariants> &
  Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
