import { ActionIcon, Anchor, Box, Group, Loader, LoadingOverlay, Menu, rem } from '@mantine/core'
import { IconChevronLeft, IconDeviceFloppy, IconDownload, IconMenu2, IconRocket, IconUpload } from '@tabler/icons-react'
import React, { useRef, useState } from 'react'

import 'reactflow/dist/style.css'
import {
  useBlocksBlocksGet,
  useGetAppApplicationsApplicationIdGet,
  useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet,
  usePatternsPatternsGet
} from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import { useHotkeys } from '@mantine/hooks'
import { ReactFlowProvider } from 'reactflow'
import { FormProvider, useForm } from 'react-hook-form'
import { GithubLogo } from '../../components/Layout/GithubLogo'
import { BuilderCanvas } from './Canvas'
import { SchemaProvider } from './useSchema'
import { Config } from './linguflow.type'
import { ContainerElemProvider } from './Canvas/useContainerElem'
import { TOOLBAR_HEIGHT, TOOLBAR_PANE_HEIGHT, Toolbar } from './Toolbar'

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

  const containerElem = useRef<HTMLDivElement>(null)
  const [menuOpened, setMenuOpened] = useState(false)
  const [toolbarPaneOpened, setToolbarPaneOpened] = useState(false)

  const form = useForm()

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
    <ReactFlowProvider>
      <FormProvider {...form}>
        <SchemaProvider value={{ blocks: blocksData?.blocks, patterns: patternsData?.patterns }}>
          <ContainerElemProvider value={containerElem.current}>
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

              <Box
                w="100%"
                h={`calc(100% - ${TOOLBAR_HEIGHT + (toolbarPaneOpened ? TOOLBAR_PANE_HEIGHT : 0)}px)`}
                ref={containerElem}
              >
                <LoadingOverlay
                  visible={isInfoLoading}
                  zIndex={1000}
                  overlayProps={{ radius: 'sm', blur: 2 }}
                  loaderProps={{ color: 'gray.3' }}
                />
                <BuilderCanvas
                  config={verData?.version?.configuration as Config}
                  onClick={() => setMenuOpened(false)}
                />
              </Box>
              <Toolbar
                app={appData?.application}
                ver={verData?.version}
                toolbarPaneOpened={toolbarPaneOpened}
                setToolbarPaneOpened={setToolbarPaneOpened}
              />
            </Box>
          </ContainerElemProvider>
        </SchemaProvider>
      </FormProvider>
    </ReactFlowProvider>
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

export default AppBuilder
