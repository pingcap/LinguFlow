import {
  ActionIcon,
  Anchor,
  Box,
  DefaultMantineColor,
  Group,
  Loader,
  LoadingOverlay,
  Menu,
  Skeleton,
  StyleProp,
  Text,
  rem,
  useMantineTheme
} from '@mantine/core'
import {
  IconBrandGithub,
  IconBug,
  IconChevronLeft,
  IconDeviceFloppy,
  IconDownload,
  IconInfoCircle,
  IconMenu2,
  IconRocket,
  IconUpload
} from '@tabler/icons-react'
import React, { PropsWithChildren, useState } from 'react'

import 'reactflow/dist/style.css'
import {
  useBlocksBlocksGet,
  useGetAppApplicationsApplicationIdGet,
  useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet,
  usePatternsPatternsGet
} from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import { useHotkeys } from '@mantine/hooks'
import { ApplicationInfo, ApplicationVersionInfo } from '@api/linguflow.schemas'
import { GithubLogo } from '../../components/Layout/GithubLogo'
import classes from './index.module.css'
import { BuilderCanvas } from './Canvas'
import { SchemaProvider } from './useSchema'

const TOOLBAR_HEIGHT = 30

const AppBuilder: React.FC = () => {
  const { appId, verId } = useParams()
  const { data: blocksData, isLoading: isBlocksLoading } = useBlocksBlocksGet()
  const { data: patternsData, isLoading: isPatternsLoading } = usePatternsPatternsGet()
  const { data: appData, isLoading: isAppLoading } = useGetAppApplicationsApplicationIdGet(appId!, {
    query: {
      enabled: !!appId
    }
  })
  const { data: verData, isLoading: isVerLoading } = useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet(
    appId!,
    verId!,
    {
      query: {
        enabled: !!appId && !!verId
      }
    }
  )
  const isInfoLoading = isBlocksLoading || isPatternsLoading || isAppLoading || isVerLoading

  const [menuOpened, setMenuOpened] = useState(false)

  useHotkeys([
    [
      'mod+S',
      (e) => {
        e.preventDefault()
        console.log('save')
      }
    ]
  ])

  return (
    <SchemaProvider value={{ blocks: blocksData?.blocks, patterns: patternsData?.patterns }}>
      <Box w="100vw" h="100vh">
        <BuilderMenu opened={menuOpened} setOpened={setMenuOpened} loading={false} />
        <Anchor
          href="https://github.com/pingcap/LinguFlow"
          style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 999 }}
          target="_blank"
        >
          <ActionIcon variant="default" aria-label="GitHub" size="lg">
            <GithubLogo />
          </ActionIcon>
        </Anchor>

        <Box w="100%" h={`calc(100% - ${TOOLBAR_HEIGHT}px)`}>
          <LoadingOverlay
            visible={isInfoLoading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'gray.3' }}
          />
          <BuilderCanvas onClick={() => setMenuOpened(false)} />
        </Box>
        <Toolbar app={appData?.application} ver={verData?.version} />
      </Box>
    </SchemaProvider>
  )
}

const BuilderMenu: React.FC<{
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
}> = ({ opened, setOpened, loading }) => {
  const navigate = useNavigate()

  return (
    <Group style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 999 }}>
      <ActionIcon.Group>
        <ActionIcon variant="default" aria-label="Go Back" size="lg" onClick={() => navigate(-1)}>
          <IconChevronLeft style={{ width: '60%', height: '60%', color: '#000' }} stroke={1.5} />
        </ActionIcon>

        <Menu shadow="md" width={140} position="bottom-start" opened={opened} onChange={setOpened}>
          <Menu.Target>
            <ActionIcon variant="default" aria-label="Menu" size="lg">
              <IconMenu2 style={{ width: '60%', height: '60%', color: '#000' }} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconDeviceFloppy style={{ width: rem(14), height: rem(14) }} />}>Save</Menu.Item>
            <Menu.Item leftSection={<IconRocket style={{ width: rem(14), height: rem(14) }} />}>Publish</Menu.Item>

            <Menu.Divider />

            <Menu.Item leftSection={<IconUpload style={{ width: rem(14), height: rem(14) }} />}>Import</Menu.Item>
            <Menu.Item leftSection={<IconDownload style={{ width: rem(14), height: rem(14) }} />}>Export</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </ActionIcon.Group>
      {loading && <Loader color="gray.5" size="xs" />}
    </Group>
  )
}

const Toolbar: React.FC<{ app?: ApplicationInfo; ver?: ApplicationVersionInfo }> = ({ app, ver }) => {
  const { colors } = useMantineTheme()

  return (
    <Group
      justify="space-between"
      h={TOOLBAR_HEIGHT}
      style={(theme) => ({ borderTop: `1px solid ${theme.colors.gray[1]}` })}
    >
      <ToolbarButton bg="gray.2" w={TOOLBAR_HEIGHT}>
        <IconBug style={{ width: '80%', height: '80%', color: colors.gray[9] }} stroke={1} />
      </ToolbarButton>
      <Group gap="xs" pr="sm">
        {app && ver && (
          <>
            <Box>
              <Text span fw="bold" c="gray.9" size="xs">
                {app.name}
              </Text>
              /
              <Text span c="gray.9" size="xs">
                {ver.id}
              </Text>
            </Box>
            <ToolbarButton w={TOOLBAR_HEIGHT * 1.3}>
              <IconInfoCircle style={{ width: '80%', height: '80%', color: colors.gray[9] }} stroke={1} />
            </ToolbarButton>
          </>
        )}
      </Group>
    </Group>
  )
}

const ToolbarButton: React.FC<
  PropsWithChildren<{ bg?: StyleProp<DefaultMantineColor>; w?: StyleProp<React.CSSProperties['width']> }>
> = ({ children, bg, w }) => {
  return (
    <Group
      justify="center"
      align="center"
      p={4}
      w={w}
      h={TOOLBAR_HEIGHT}
      c="gray.9"
      bg={bg || '#fff'}
      className={classes.toolbar_button}
    >
      {children}
    </Group>
  )
}

export default AppBuilder
