import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import NoSsr from '@/components/NoSsr'
import '@/util/i18n'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoSsr>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </NoSsr>
  )
}
