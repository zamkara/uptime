import { MonitorState, MonitorTarget } from '@/types/config'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import MonitorDetail from './MonitorDetail'
import { pageConfig } from '@/uptime.config'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Frame, FramePanel } from './reui/frame'

function countDownCount(state: MonitorState, ids: string[]) {
  let downCount = 0
  for (let id of ids) {
    if (state.incident[id] === undefined || state.incident[id].length === 0) {
      continue
    }

    if (state.incident[id].slice(-1)[0].end === null) {
      downCount++
    }
  }
  return downCount
}

function getStatusTextColor(state: MonitorState, ids: string[]) {
  let downCount = countDownCount(state, ids)
  if (downCount === 0) {
    return 'text-emerald-500'
  } else if (downCount === ids.length) {
    return 'text-destructive'
  } else {
    return 'text-amber-500'
  }
}

export default function MonitorList({
  monitors,
  state,
}: {
  monitors: MonitorTarget[]
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const group = pageConfig.group
  const groupedMonitor = group && Object.keys(group).length > 0

  // Load expanded groups from localStorage
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    if (typeof window === 'undefined') return Object.keys(group || {})
    const saved = localStorage.getItem('expandedGroups')
    return saved ? JSON.parse(saved) : Object.keys(group || {})
  })

  useEffect(() => {
    localStorage.setItem('expandedGroups', JSON.stringify(expandedGroups))
  }, [expandedGroups])

  if (groupedMonitor && group) {
    return (
      <div className="container mx-auto max-w-4xl px-4 mt-6">
        <Accordion
          type="multiple"
          value={expandedGroups}
          onValueChange={setExpandedGroups}
          className="space-y-4"
        >
          {Object.keys(group).map((groupName) => (
            <AccordionItem
              key={groupName}
              value={groupName}
              className="rounded-lg border bg-card px-4 text-card-foreground shadow-sm"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex w-full items-center justify-between pr-4">
                  <span className="font-medium text-base">{groupName}</span>
                  <span className={`text-sm font-medium ${getStatusTextColor(state, group[groupName])}`}>
                    {group[groupName].length - countDownCount(state, group[groupName])}/
                    {group[groupName].length} {t('Operational')}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monitors
                    .filter((monitor) => group[groupName].includes(monitor.id))
                    .sort((a, b) => group[groupName].indexOf(a.id) - group[groupName].indexOf(b.id))
                    .map((monitor) => (
                      <MonitorDetail key={monitor.id} monitor={monitor} state={state} />
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    )
  }

  // Ungrouped monitors
  return (
    <div className="container mx-auto max-w-[1600px] px-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monitors.map((monitor) => (
          <MonitorDetail key={monitor.id} monitor={monitor} state={state} />
        ))}
      </div>
    </div>
  )
}
