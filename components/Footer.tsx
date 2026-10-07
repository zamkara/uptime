import { Separator } from '@/components/ui/separator'
import { pageConfig } from '@/uptime.config'

export default function Footer() {
  const defaultFooter =
    '<p class="text-center text-muted-foreground">Service Monitoring powered by <a href="https://ramaputra.co.id" target="_blank" class="font-medium underline underline-offset-4 hover:text-foreground">Rama Putra Djaya</a>.</p>'

  return (
    <footer className="mt-12 container mx-auto max-w-[1600px] px-6">
      <Separator />
      <div
        className="py-6 [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-muted-foreground hover:[&_a]:text-foreground"
        dangerouslySetInnerHTML={{ __html: pageConfig.customFooter ?? defaultFooter }}
      />
    </footer>
  )
}
