import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from './reui/frame'
import { Alert, AlertTitle } from './reui/alert'

export default function NoIncidentsAlert({ style }: { style?: React.CSSProperties }) {
  const { t } = useTranslation('common')
  return (
    <Frame
    >
      <FrameHeader className='p-0'>
        <Alert>
          <Info />
          <AlertTitle>
            {t('No incidents in this month')}
          </AlertTitle>
        </Alert>
      </FrameHeader>
      <FramePanel>
        <FrameDescription>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('There are no incidents for this month')}
          </p>
        </FrameDescription>
      </FramePanel>
    </Frame>
  )
}
