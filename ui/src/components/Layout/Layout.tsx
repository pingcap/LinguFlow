import { AppShell, Box, Group } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { PropsWithChildren, ReactNode } from 'react'
import { Title } from './Title'
import { Footer } from './Footer'

interface LayoutProps {
  header?: {
    height?: number
    withBorder?: boolean
    leftSection?: ReactNode
    centerSection?: ReactNode
    rightSection?: ReactNode
    bottomSection?: ReactNode
  }
  navbar?: ReactNode
}

const HEADER_HEIGHT = 50

export const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({
  children,
  header: { height, withBorder, leftSection, centerSection, rightSection, bottomSection } = {},
  navbar
}) => {
  return (
    <AppShell padding={0} header={{ height: height || HEADER_HEIGHT }}>
      <AppShell.Header zIndex={99} withBorder={withBorder} style={{ animation: 'ease-in-out' }}>
        <Group h={HEADER_HEIGHT} justify="space-between" px={20}>
          <Box>{leftSection || <Title />}</Box>
          <Box>{centerSection}</Box>
          <Box>{rightSection}</Box>
        </Group>
        {bottomSection}
      </AppShell.Header>

      {!!navbar && (
        <AppShell.Navbar>
          <Box mt={HEADER_HEIGHT} h="calc(100vh - var(--mantine-header-height))">
            {navbar}
          </Box>
        </AppShell.Navbar>
      )}

      <AppShell.Main>{children ? children : <Outlet />}</AppShell.Main>

      <Footer />
    </AppShell>
  )
}
