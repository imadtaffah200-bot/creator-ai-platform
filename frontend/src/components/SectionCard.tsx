import type { PropsWithChildren, ReactNode } from 'react'
import { Panel, SectionHeading } from './ui'

export function SectionCard({ title, subtitle, eyebrow, actions, children }: PropsWithChildren<{ title: string; subtitle?: string; eyebrow?: string; actions?: ReactNode }>) {
  return (
    <Panel>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions} />
      {children}
    </Panel>
  )
}
