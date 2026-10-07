import Head from 'next/head'
import { Inter } from 'next/font/google'
import { MonitorTarget } from '@/types/config'
import { maintenances, pageConfig } from '@/uptime.config'
import OverallStatus from '@/components/OverallStatus'
import Header from '@/components/Header'
import MonitorList from '@/components/MonitorList'
import MonitorDetail from '@/components/MonitorDetail'
import Footer from '@/components/Footer'
import { useTranslation } from 'react-i18next'
import { CompactedMonitorStateWrapper, getFromStore } from '@/worker/src/store'

export const runtime = 'experimental-edge'
const inter = Inter({ subsets: ['latin'] })

export default function Home({
  compactedStateStr,
  monitors,
}: {
  compactedStateStr: string
  monitors: MonitorTarget[]
  tooltip?: string
  statusPageLink?: string
}) {
  const { t } = useTranslation('common')
  let state = new CompactedMonitorStateWrapper(compactedStateStr).uncompact()

  // Specify monitorId in URL hash to view a specific monitor (can be used in iframe)
  const monitorId = typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
  if (monitorId) {
    const monitor = monitors.find((m) => m.id === monitorId)
    if (!monitor || !state) {
      return (
        <div className="p-8 text-center font-bold text-foreground">
          {t('Monitor not found', { id: monitorId })}
        </div>
      )
    }
    return (
      <div className="max-w-3xl mx-auto p-4">
        <MonitorDetail monitor={monitor} state={state} />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
      </Head>

      <main className={`${inter.className} min-h-screen flex flex-col justify-between`}>
        <div>
          <Header />

          {state.lastUpdate === 0 ? (
            <div className="py-20 text-center font-medium text-muted-foreground">
              {t('Monitor State not defined')}
            </div>
          ) : (
            <div>
              <OverallStatus state={state} monitors={monitors} maintenances={maintenances} />
              <MonitorList monitors={monitors} state={state} />
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const { workerConfig } = await import('@/uptime.config')
  // Read state as string from storage (supports Cloudflare runtime and local REST API)
  let compactedStateStr: string | null = null
  try {
    const { fetchStoreState } = await import('@/lib/d1')
    compactedStateStr = await fetchStoreState()
  } catch (e) {
    console.error('Error fetching state from store:', e)
  }

  // Graceful fallback for local development preview (no Cloudflare D1 binding required)
  if (!compactedStateStr) {
    const now = Math.round(Date.now() / 1000)
    compactedStateStr = JSON.stringify({
      lastUpdate: now,
      overallUp: workerConfig.monitors.length,
      overallDown: 0,
      incident: Object.fromEntries(
        workerConfig.monitors.map((m) => [
          m.id,
          {
            start: [now - 86400],
            end: [now],
            error: ['dummy'],
          },
        ])
      ),
      latency: {},
    })
  }

  // Only present these values to client
  const monitors = workerConfig.monitors.map((monitor) => {
    return {
      id: monitor.id,
      name: monitor.name,
      tooltip: monitor?.tooltip ?? null,
      statusPageLink: monitor?.statusPageLink ?? null,
      hideLatencyChart: monitor?.hideLatencyChart ?? false,
    }
  })

  return { props: { compactedStateStr, monitors } }
}
