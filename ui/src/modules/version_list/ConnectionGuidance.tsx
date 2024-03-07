import { TypographyStylesProvider } from '@mantine/core'
import { html } from './guidance.md'

export const ConnectionGuidance: React.FC = () => {
  return (
    <TypographyStylesProvider>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </TypographyStylesProvider>
  )
}
