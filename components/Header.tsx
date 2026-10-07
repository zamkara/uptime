import Link from 'next/link'
import { pageConfig } from '@/uptime.config'
import { PageConfigLink } from '@/types/config'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { Menu, Moon, Sun } from 'lucide-react'

export default function Header({ style }: { style?: React.CSSProperties }) {
  const { t } = useTranslation('common')
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const handleLinkClick = (link: PageConfigLink) => {
    if (link.link.startsWith('/')) {
      window.location.href = link.link
    } else {
      window.open(link.link, '_blank', 'noopener,noreferrer')
    }
  }

  const linkToElement = (link: PageConfigLink, i: number) => {
    return (
      <Button
        key={i}
        variant={link.highlight ? 'default' : 'outline'}
        onClick={() => handleLinkClick(link)}
      >
        {link.label}
      </Button>
    )
  }

  const links = [{ label: t('Incidents'), link: '/incidents' }, ...(pageConfig.links || [])]

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-6" style={style}>
      <div className="container mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
        <div>
          <Link href="/" className="flex items-center">
            {/* Light mode logo */}
            <Image
              src="/ic_dark.svg"
              width={42}
              height={28}
              className="h-8 w-auto dark:hidden"
              alt="logo"
            />
            {/* Dark mode logo */}
            <Image
              src="/ic_light.svg"
              width={42}
              height={28}
              className="hidden h-8 w-auto dark:block"
              alt="logo"
            />
          </Link>
        </div>

        <div>
          {/* Desktop & Tablet: ButtonGroup */}
          <div className="hidden sm:block">
            <ButtonGroup>
              {links?.map(linkToElement)}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </ButtonGroup>
          </div>

          {/* Mobile: DropdownMenu */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {links.map((link, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => handleLinkClick(link)}
                    className="cursor-pointer font-medium"
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
