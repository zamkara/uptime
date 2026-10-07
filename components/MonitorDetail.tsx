import { MonitorState, MonitorTarget } from '@/types/config'
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import DetailChart from './DetailChart'
import DetailBar from './DetailBar'
import { cn } from '@/lib/utils'
import { maintenances } from '@/uptime.config'
import { useTranslation } from 'react-i18next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Frame, FrameHeader, FramePanel } from './reui/frame'

export default function MonitorDetail({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')

  if (!state.latency[monitor.id]) {
    return (
      <div className="py-3">
        <p className="font-medium text-foreground">{monitor.name}</p>
        <p className="text-sm text-muted-foreground">{t('No data available')}</p>
      </div>
    )
  }

  let statusIcon =
    state.incident[monitor.id].slice(-1)[0].end === null ? (
      <AlertCircle className="h-4 w-4 text-destructive mr-1.5 shrink-0" />
    ) : (
      <CheckCircle2 className="h-4 w-4 text-success mr-1.5 shrink-0" />
    )

  // Hide real status icon if monitor is in maintenance
  const now = new Date()
  const hasMaintenance = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .find((maintenance) => maintenance.monitors?.includes(monitor.id))

  if (hasMaintenance) {
    statusIcon = <AlertTriangle className="h-4 w-4 text-warning mr-1.5 shrink-0" />
  }

  let totalTime = Date.now() / 1000 - state.incident[monitor.id][0].start[0]
  let downTime = 0
  for (let incident of state.incident[monitor.id]) {
    downTime += (incident.end ?? Date.now() / 1000) - incident.start[0]
  }

  const uptimePercent = (((totalTime - downTime) / totalTime) * 100).toPrecision(4)

  const monitorNameElement = (
    <div className="inline-flex items-center font-medium text-foreground text-sm sm:text-base">
      {monitor.statusPageLink ? (
        <a
          href={monitor.statusPageLink}
          target="_blank"
          className="inline-flex items-center text-inherit hover:underline underline-offset-4"
        >
          {statusIcon} {monitor.name}
        </a>
      ) : (
        <>
          {statusIcon} {monitor.name}
        </>
      )}
    </div>
  )

  return (
    <Frame className="h-full">
      <FrameHeader className="justify-between flex flex-row">
        {monitor.tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">{monitorNameElement}</div>
              </TooltipTrigger>
              <TooltipContent>{monitor.tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          monitorNameElement
        )}

        <span
          className={cn(
            'text-sm font-medium shrink-0',
            Number(uptimePercent) >= 99
              ? 'text-success'
              : Number(uptimePercent) >= 95
              ? 'text-warning'
              : 'text-destructive'
          )}
        >
          {t('Overall', { percent: uptimePercent })}
        </span>
      </FrameHeader>

      <FramePanel className="p-3">
        <DetailBar monitor={monitor} state={state} />
        {!monitor.hideLatencyChart && <DetailChart monitor={monitor} state={state} />}
      </FramePanel>
    </Frame>
  )
}
