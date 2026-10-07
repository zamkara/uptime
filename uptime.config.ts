// This is a simplified example config file for quickstart
// Some not frequently used features are omitted/commented out here
// For a full-featured example, please refer to `uptime.config.full.ts`

// Don't edit this line
import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

const pageConfig: PageConfig = {
  // Title for your status page
  title: 'Rama Putra Monitor',
  // Links shown at the header of your status page, could set `highlight` to `true`
  links: [
    { link: 'https://lezza.id', label: 'Lezza' },
    { link: 'https://grafana.lezza.id', label: 'Grafana' },
    { link: 'https://airflow.lezza.id', label: 'Airflow' },
    { link: 'https://kafka.ramaputra.co.id', label: 'Kafka' },
  ],
}

const workerConfig: WorkerConfig = {
  // Define all your monitors here
  monitors: [
    {
      id: 'dms_frontend_prod',
      name: 'DMS Frontend',
      method: 'GET',
      target: 'https://dms.ramaputra.co.id/login',
      tooltip: 'DMS Web Application Production',
      statusPageLink: 'https://dms.ramaputra.co.id',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'dms_backend_prod',
      name: 'DMS Backend',
      method: 'GET',
      target: 'https://dms.ramaputra.co.id/api/',
      tooltip: 'DMS API Service Production',
      statusPageLink: 'https://dms.ramaputra.co.id',
      expectedCodes: [200, 404],
      timeout: 10000,
    },
    {
      id: 'dms_frontend_staging',
      name: 'DMS Frontend - Staging',
      method: 'GET',
      target: 'https://dms-dev.ramaputra.co.id/login',
      tooltip: 'DMS Web Application Staging',
      statusPageLink: 'https://dms-dev.ramaputra.co.id',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'dms_backend_staging',
      name: 'DMS Backend - Staging',
      method: 'GET',
      target: 'https://dms-dev.ramaputra.co.id/api/',
      tooltip: 'DMS API Service Staging',
      statusPageLink: 'https://dms-dev.ramaputra.co.id',
      expectedCodes: [200, 404],
      timeout: 10000,
    },
    {
      id: 'kafka_service',
      name: 'Kafka Service',
      method: 'GET',
      target: 'https://kafka.ramaputra.co.id',
      tooltip: 'Kafka / Redpanda Gateway',
      statusPageLink: 'https://kafka.ramaputra.co.id',
      expectedCodes: [200, 401],
      timeout: 10000,
    },
    {
      id: 'redpanda_console',
      name: 'Redpanda Console',
      method: 'GET',
      target: 'https://konsol.ramaputra.co.id',
      tooltip: 'Redpanda Web Console',
      statusPageLink: 'https://kafka.ramaputra.co.id',
      expectedCodes: [200, 401],
      timeout: 10000,
    },
    {
      id: 'erpnext',
      name: 'ERPNext',
      method: 'GET',
      target: 'https://erp.ramaputra.co.id/',
      tooltip: 'ERPNext Application',
      statusPageLink: 'https://erp.ramaputra.co.id',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'airflow',
      name: 'Airflow',
      method: 'GET',
      target: 'https://airflow.lezza.id/health',
      tooltip: 'Apache Airflow Service',
      statusPageLink: 'https://airflow.lezza.id',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'lezza_web',
      name: 'Lezza Website',
      method: 'GET',
      target: 'https://lezza.id/',
      tooltip: 'Lezza Main Website',
      statusPageLink: 'https://lezza.id',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'grafana',
      name: 'Grafana',
      method: 'GET',
      target: 'https://grafana.lezza.id/api/health',
      tooltip: 'Grafana Monitoring Dashboard',
      statusPageLink: 'https://grafana.lezza.id',
      expectedCodes: [200],
      timeout: 10000,
    },
  ],
  // [Optional] Notification settings
  notification: {
    // [Optional] timezone used in notification messages, default to "Etc/GMT"
    timeZone: 'Asia/Jakarta',
    // [Optional] grace period in minutes before sending a notification
    gracePeriod: 5,
  },
  callbacks: {
    onStatusChange: async (
      env: any,
      monitor: any,
      isUp: boolean,
      timeIncidentStart: number,
      timeNow: number,
      reason: string
    ) => {
      const coranUrl = env.CORAN_WEBHOOK_URL
      const token = env.CORAN_BEARER_TOKEN

      if (!coranUrl || !token) return

      try {
        const payload = {
          project: 'uptimeflare',
          status: isUp ? 'success' : 'failed',
          title: isUp
            ? `🟢 [RECOVERED] ${monitor.name} is UP`
            : `🔴 [DOWN] ${monitor.name} is DOWN`,
          description: isUp
            ? `Service **${monitor.name}** is back online and responding normally.`
            : `Service **${monitor.name}** is failing or experiencing downtime.`,
          url: monitor.statusPageLink || monitor.target,
          fields: {
            Service: monitor.name,
            Status: isUp ? 'Operational' : 'Failing',
            ...(isUp
              ? { 'Downtime Duration': `${Math.max(1, Math.round((timeNow - timeIncidentStart) / 60))} minutes` }
              : { Reason: reason || 'Connection Timeout / Non-200 Status' }),
            Time: new Date(timeNow * 1000).toLocaleString('id-ID', {
              timeZone: 'Asia/Jakarta',
            }),
          },
        }

        await fetch(coranUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
      } catch (err) {
        console.error('Failed to notify Coran:', err)
      }
    },
  },
}

// You can define multiple maintenances here
const maintenances: MaintenanceConfig[] = []

// Don't edit this line
export { maintenances, pageConfig, workerConfig }
