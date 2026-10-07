import Head from 'next/head'
import { Inter } from 'next/font/google'
import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { maintenances, pageConfig } from '@/uptime.config'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'
import MaintenanceAlert from '@/components/MaintenanceAlert'
import NoIncidentsAlert from '@/components/NoIncidents'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export const runtime = 'experimental-edge'
const inter = Inter({ subsets: ['latin'] })

function getSelectedMonth() {
  if (typeof window === 'undefined') {
    const now = new Date()
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  }
  const hash = window.location.hash.replace('#', '')
  if (!hash) {
    const now = new Date()
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  }
  return hash.split('-').splice(0, 2).join('-')
}

function filterIncidentsByMonth(
  incidents: MaintenanceConfig[],
  monthStr: string,
  monitors: MonitorTarget[]
): (Omit<MaintenanceConfig, 'monitors'> & { monitors: MonitorTarget[] })[] {
  return incidents
    .filter((incident) => {
      const d = new Date(incident.start)
      const incidentMonth = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
      return incidentMonth === monthStr
    })
    .map((e) => ({
      ...e,
      monitors: (e.monitors || []).map((e) => monitors.find((mon) => mon.id === e)!),
    }))
    .sort((a, b) => (new Date(a.start) > new Date(b.start) ? -1 : 1))
}

function getPrevNextMonth(monthStr: string) {
  const [year, month] = monthStr.split('-').map(Number)
  const date = new Date(year, month - 1)
  const prev = new Date(date)
  prev.setMonth(prev.getMonth() - 1)
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return {
    prev: prev.getFullYear() + '-' + String(prev.getMonth() + 1).padStart(2, '0'),
    next: next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0'),
  }
}

export default function IncidentsPage({ monitors }: { monitors: MonitorTarget[] }) {
  const { t } = useTranslation('common')
  const [selectedMonitor, setSelectedMonitor] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState(getSelectedMonth())

  useEffect(() => {
    const onHashChange = () => setSelectedMonth(getSelectedMonth())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const filteredIncidents = filterIncidentsByMonth(maintenances, selectedMonth, monitors)
  const monitorFilteredIncidents =
    selectedMonitor && selectedMonitor !== 'all'
      ? filteredIncidents.filter((i) => i.monitors.find((e) => e.id === selectedMonitor))
      : filteredIncidents

  const { prev, next } = getPrevNextMonth(selectedMonth)

  return (
    <>
      <Head>
        <title>{pageConfig.title}</title>
        <link rel="icon" href={pageConfig.favicon ?? '/favicon.png'} />
      </Head>

      <main className={`${inter.className} min-h-screen flex flex-col justify-between`}>
        <div>
          <Header />

          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex justify-end mb-6">
              <div className="w-full sm:w-64">
                <Select value={selectedMonitor} onValueChange={setSelectedMonitor}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select monitor')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All')}</SelectItem>
                    {monitors.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {monitorFilteredIncidents.length === 0 ? (
                <NoIncidentsAlert />
              ) : (
                monitorFilteredIncidents.map((incident, i) => (
                  <MaintenanceAlert key={i} maintenance={incident} />
                ))
              )}
            </div>

            <div className="mt-8 pt-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={`#${prev}`}
                      text={t('Backwards').replace(/[←→]/g, '').trim()}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href={`#${selectedMonth}`}
                      isActive
                      className="font-mono px-3 w-auto"
                    >
                      {selectedMonth}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href={`#${next}`}
                      text={t('Forward').replace(/[←→]/g, '').trim()}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}

export async function getServerSideProps() {
  const { workerConfig } = await import('@/uptime.config')
  // Only present these values to client
  const monitors: MonitorTarget[] = workerConfig.monitors.map((monitor) => ({
    id: monitor.id,
    name: monitor.name,
  })) as MonitorTarget[]
  return { props: { monitors } }
}
