import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import { pageConfig } from '@/uptime.config'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { IconStack } from './reui/icon-stack'
import { Alert, AlertDescription, AlertTitle } from './reui/alert'

function useWindowVisibility() {
  const [isVisible, setIsVisible] = useState(true)
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  return isVisible
}

export default function OverallStatus({
  state,
  maintenances,
  monitors,
}: {
  state: { overallUp: number; overallDown: number; lastUpdate: number }
  maintenances: MaintenanceConfig[]
  monitors: MonitorTarget[]
}) {
  const { t } = useTranslation('common')
  let group = pageConfig.group
  let groupedMonitor = (group && Object.keys(group).length > 0) || false

  let statusString = ''
  let icon = <AlertCircle />
  let statusColor = 'text-destructive'

  if (state.overallUp === 0 && state.overallDown === 0) {
    statusString = t('No data yet')
    icon = <AlertTriangle className="text-warning" />
    statusColor = 'text-warning'
  } else if (state.overallUp === 0) {
    statusString = t('All systems not operational')
    icon = <AlertCircle className="text-destructive" />
    statusColor = 'text-destructive'
  } else if (state.overallDown === 0) {
    statusString = t('All systems operational')
    icon = <CheckCircle2 className="text-success" />
    statusColor = 'text-success'
  } else {
    statusString = t('Some systems not operational', {
      down: state.overallDown,
      total: state.overallUp + state.overallDown,
    })
    icon = <AlertTriangle className="text-warning" />
    statusColor = 'text-warning'
  }

  const [openTime] = useState(Math.round(Date.now() / 1000))
  const [currentTime, setCurrentTime] = useState(Math.round(Date.now() / 1000))
  const isWindowVisible = useWindowVisibility()
  const [expandUpcoming, setExpandUpcoming] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWindowVisible) return
      if (currentTime - state.lastUpdate > 300 && currentTime - openTime > 30) {
        window.location.reload()
      }
      setCurrentTime(Math.round(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  })

  const now = new Date()

  const activeMaintenances = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const upcomingMaintenances = maintenances
    .filter((m) => now < new Date(m.start))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  return (
    <div className="container mx-auto max-w-[1600px] px-6 py-8">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <IconStack className='size-42'>
          {icon}
        </IconStack>
        <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          {statusString}
        </h1>
        <Alert className='w-fit'>
          <Info />
          <AlertDescription>
              {t('Last updated on', {
                date: new Date(state.lastUpdate * 1000).toLocaleString(),
                seconds: currentTime - state.lastUpdate,
              })}
          </AlertDescription>
        </Alert>

        {/* Upcoming Maintenance */}
        {upcomingMaintenances.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {t('upcoming maintenance', { count: upcomingMaintenances.length })}{' '}
            <button
              type="button"
              className="font-medium underline underline-offset-4 hover:text-foreground cursor-pointer"
              onClick={() => setExpandUpcoming(!expandUpcoming)}
            >
              {expandUpcoming ? t('Hide') : t('Show')}
            </button>
          </div>
        )}
      </div>

      {upcomingMaintenances.length > 0 && expandUpcoming && (
        <div className="mt-6 space-y-4">
          {upcomingMaintenances.map((maintenance, idx) => (
            <MaintenanceAlert
              key={`upcoming-${idx}`}
              maintenance={maintenance}
              upcoming
            />
          ))}
        </div>
      )}

      {/* Active Maintenance */}
      {activeMaintenances.length > 0 && (
        <div className="mt-6 space-y-4">
          {activeMaintenances.map((maintenance, idx) => (
            <MaintenanceAlert
              key={`active-${idx}`}
              maintenance={maintenance}
            />
          ))}
        </div>
      )}
    </div>
  )
}
