'use client'

import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { MonitorState, MonitorTarget } from '@/types/config'
import { codeToCountry } from '@/util/iata'
import { useTranslation } from 'react-i18next'

const chartConfig = {
  ping: {
    label: 'Latency',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export default function DetailChart({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')

  const chartData = useMemo(() => {
    const rawData = state.latency[monitor.id] || []
    return rawData.map((point) => {
      const date = new Date(point.time * 1000)
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes()
      ).padStart(2, '0')}`
      return {
        timestamp: point.time * 1000,
        time: timeStr,
        ping: point.ping,
        loc: point.loc,
        country: codeToCountry(point.loc),
      }
    })
  }, [state.latency, monitor.id])

  if (!chartData.length) return null

  const gradientId = `chart-latency-${monitor.id}`

  return (
    <div className="w-full pt-4">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {t('Response times')}
        </span>
      </div>

      <ChartContainer config={chartConfig} className="h-[140px] w-full">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 10, right: 12, bottom: 0, left: 10 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-ping)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-ping)"
                stopOpacity={0.0}
              />
            </linearGradient>
            <filter
              id={`${gradientId}-glow`}
              x="-10%"
              y="-20%"
              width="120%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />

          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            className="text-[11px] fill-muted-foreground"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={72}
            className="text-[11px] fill-muted-foreground font-mono"
            tickFormatter={(value) => `${value}ms`}
            domain={['dataMin - 5', 'dataMax + 5']}
          />

          <ChartTooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                indicator="dot"
                className="min-w-40 gap-2 font-sans"
                formatter={(value, name, item) => {
                  const payload = item?.payload as (typeof chartData)[number] | undefined
                  return (
                    <div className="flex w-full items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span>{t('Response time')}</span>
                        {payload?.country && (
                          <span className="text-[10px] text-muted-foreground/80">
                            ({payload.country})
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-foreground tabular-nums">
                        {value}ms
                      </span>
                    </div>
                  )
                }}
              />
            }
          />

          <Area
            dataKey="ping"
            type="natural"
            fill={`url(#${gradientId})`}
            stroke="var(--color-ping)"
            strokeWidth={2}
            filter={`url(#${gradientId}-glow)`}
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              stroke: 'var(--background)',
              fill: 'var(--color-ping)',
            }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
