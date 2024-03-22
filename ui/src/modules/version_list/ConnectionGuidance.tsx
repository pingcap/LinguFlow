import { TypographyStylesProvider } from '@mantine/core'
import { useParams } from 'react-router-dom'
import Guidance from './guidance.mdx'

export const ConnectionGuidance: React.FC = () => {
  const { appId } = useParams()
  const baseURL = `${location.protocol}//${location.host}/linguflow-api`
  return (
    <TypographyStylesProvider>
      <Guidance baseURL={baseURL} appId={appId} />
    </TypographyStylesProvider>
  )
}
