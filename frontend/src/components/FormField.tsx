import type { PropsWithChildren, ReactNode } from 'react'
import { cls } from '@utils/helpers'

export function FormField({ label, hint, icon, children, className }: PropsWithChildren<{ label: string; hint?: string; icon?: ReactNode; className?: string }>) {
  return (
    <label className={cls('flex flex-col gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200', className)}>
      <span className="inline-flex items-center gap-2 text-sm font-bold">
        {icon ? <span className="text-indigo-500">{icon}</span> : null}
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs leading-6 text-slate-400">{hint}</span> : null}
    </label>
  )
}
