import { AppShell, Box, Group } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { PropsWithChildren, ReactNode } from 'react'
import { Title } from './Title'

interface LayoutProps {
  header?: {
    leftSection?: ReactNode
    centerSection?: ReactNode
    rightSection?: ReactNode
  }
  navbar?: ReactNode
}

const HEADER_HEIGHT = 50

export const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({
  children,
  header: { leftSection, centerSection, rightSection } = {},
  navbar
}) => {
  return (
    <AppShell padding={0} header={{ height: HEADER_HEIGHT }}>
      <AppShell.Header zIndex={99}>
        <Group h={HEADER_HEIGHT} justify="space-between" px={20}>
          <Box>{leftSection || <Title />}</Box>
          <Box>{centerSection}</Box>
          <Box>{rightSection}</Box>
        </Group>
      </AppShell.Header>

      {!!navbar && (
        <AppShell.Navbar>
          (
          <Box mt={HEADER_HEIGHT} h="calc(100vh - var(--mantine-header-height))">
            {navbar}
          </Box>
          )
        </AppShell.Navbar>
      )}

      <AppShell.Main>{children ? children : <Outlet />}</AppShell.Main>
    </AppShell>
  )
}
