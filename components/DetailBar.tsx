import { MonitorState, MonitorTarget } from '@/types/config'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
const moment = require('moment')
require('moment-precise-range-plugin')

export default function DetailBar({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const barRef = useRef<HTMLDivElement>(null)
  const [barWidth, setBarWidth] = useState(800)
  const [modalOpened, setModalOpened] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)

  useEffect(() => {
    if (!barRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBarWidth(entry.contentRect.width)
      }
    })
    ro.observe(barRef.current)
    return () => ro.disconnect()
  }, [])

  const overlapLen = (x1: number, x2: number, y1: number, y2: number) => {
    return Math.max(0, Math.min(x2, y2) - Math.max(x1, y1))
  }

  const uptimePercentBars = []

  const currentTime = Math.round(Date.now() / 1000)
  const montiorStartTime = state.incident[monitor.id][0].start[0]

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  for (let i = 89; i >= 0; i--) {
    const dayStart = Math.round(todayStart.getTime() / 1000) - i * 86400
    const dayEnd = dayStart + 86400

    const dayMonitorTime = overlapLen(dayStart, dayEnd, montiorStartTime, currentTime)
    let dayDownTime = 0
    let incidentReasons: string[] = []

    for (let incident of state.incident[monitor.id]) {
      const incidentStart = incident.start[0]
      const incidentEnd = incident.end ?? currentTime
      const overlap = overlapLen(dayStart, dayEnd, incidentStart, incidentEnd)
      dayDownTime += overlap

      if (overlap > 0) {
        for (let j = 0; j < incident.error.length; j++) {
          let partStart = incident.start[j]
          let partEnd =
            j === incident.error.length - 1 ? incident.end ?? currentTime : incident.start[j + 1]
          partStart = Math.max(partStart, dayStart)
          partEnd = Math.min(partEnd, dayEnd)

          if (overlapLen(dayStart, dayEnd, partStart, partEnd) > 0) {
            const startStr = new Date(partStart * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            const endStr = new Date(partEnd * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
            incidentReasons.push(`[${startStr}-${endStr}] ${incident.error[j]}`)
          }
        }
      }
    }

    const dayPercent = (((dayMonitorTime - dayDownTime) / dayMonitorTime) * 100).toPrecision(4)

    const numPercent = Number(dayPercent)
    let barColorClass = 'bg-muted'
    if (!Number.isNaN(numPercent)) {
      if (numPercent >= 99) {
        barColorClass = 'bg-success'
      } else if (numPercent >= 95) {
        barColorClass = 'bg-warning'
      } else {
        barColorClass = 'bg-destructive'
      }
    }

    uptimePercentBars.push(
      <Tooltip key={i} delayDuration={100}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'h-8 w-1.75 mx-px rounded-xs cursor-pointer transition-opacity hover:opacity-80 shrink-0',
              barColorClass
            )}
            onClick={() => {
              if (dayDownTime > 0) {
                setModalTitle(
                  t('incidents at', {
                    name: monitor.name,
                    date: new Date(dayStart * 1000).toLocaleDateString(),
                  })
                )
                setModalContent(
                  <div className="space-y-2 text-sm">
                    {incidentReasons.map((reason, index) => (
                      <div key={index} className="p-2 rounded bg-muted/60 font-mono text-xs">
                        {reason}
                      </div>
                    ))}
                  </div>
                )
                setModalOpened(true)
              }
            }}
          />
        </TooltipTrigger>
        <TooltipContent side="top">
          {Number.isNaN(Number(dayPercent)) ? (
            <div>{t('No Data')}</div>
          ) : (
            <div className="text-center">
              <div>
                {t('percent at date', {
                  percent: dayPercent,
                  date: new Date(dayStart * 1000).toLocaleDateString(),
                })}
              </div>
              {dayDownTime > 0 && (
                <div className="text-destructive font-medium">
                  {t('Down for', {
                    duration: moment.preciseDiff(moment(0), moment(dayDownTime * 1000)),
                  })}
                </div>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  const visibleBarsCount = Math.floor(Math.max(9 * 90 - barWidth, 0) / 9)

  return (
    <>
      <Dialog open={modalOpened} onOpenChange={setModalOpened}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          {modalContent}
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <div
          ref={barRef}
          className="hidden min-[540px]:flex items-center my-2.5 overflow-hidden w-full"
        >
          {uptimePercentBars.slice(visibleBarsCount, 90)}
        </div>
      </TooltipProvider>
    </>
  )
}
