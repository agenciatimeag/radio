import type { ButtonHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const buttonVariants = cva(
  'inline-flex w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        accent:
          'bg-accent text-on-accent shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_0_40px_-6px_rgba(237,233,166,0.45)]',
        outline: 'border border-border-strong bg-white/[0.02] text-text backdrop-blur-sm',
      },
      size: {
        default: 'px-6 py-4',
        sm: 'px-4 py-2.5 text-xs',
      },
    },
    defaultVariants: { variant: 'accent', size: 'default' },
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
