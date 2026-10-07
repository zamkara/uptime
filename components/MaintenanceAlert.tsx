import { AlertTriangle } from 'lucide-react'
import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { pageConfig } from '@/uptime.config'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export default function MaintenanceAlert({
  maintenance,
  style,
  upcoming = false,
}: {
  maintenance: Omit<MaintenanceConfig, 'monitors'> & { monitors?: (MonitorTarget | undefined)[] }
  style?: React.CSSProperties
  upcoming?: boolean
}) {
  const { t } = useTranslation('common')

  return (
    <div
      style={style}
      className={cn(
        'relative mx-auto rounded-lg border p-4 shadow-sm',
        upcoming
          ? 'border-border bg-muted/50 text-foreground'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className={cn('h-5 w-5 shrink-0 mt-0.5', upcoming ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-400')} />
          <div>
            <h4 className="font-medium text-base leading-none tracking-tight">
              {(upcoming ? t('Upcoming') + ': ' : '') + (maintenance.title || t('Scheduled Maintenance'))}
            </h4>
            <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground dark:text-foreground/80">
              {maintenance.body}
            </p>

            {maintenance.monitors && maintenance.monitors.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t('Affected components')}
                </span>
                <ul className="mt-1 list-disc list-inside text-sm text-foreground/90 space-y-0.5">
                  {maintenance.monitors.map((comp, compIdx) => (
                    <li key={compIdx}>{comp?.name ?? t('MONITOR ID NOT FOUND')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Date range */}
        <div className="shrink-0 text-xs text-muted-foreground bg-background/50 rounded-md p-2 border">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="font-medium text-right">{upcoming ? t('Scheduled for') : t('From')}:</span>
            <span>{new Date(maintenance.start).toLocaleString()}</span>
            <span className="font-medium text-right">{upcoming ? t('Expected end') : t('To')}:</span>
            <span>{maintenance.end ? new Date(maintenance.end).toLocaleString() : t('Until further notice')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
