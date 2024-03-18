import { ActionIcon, Anchor, Badge, Box, Group, Loader, LoadingOverlay, Menu, rem } from '@mantine/core'
import { IconChevronLeft, IconDeviceFloppy, IconDownload, IconMenu2, IconRocket, IconUpload } from '@tabler/icons-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import 'reactflow/dist/style.css'
import {
  getBlocksBlocksGetQueryKey,
  getPatternsPatternsGetQueryKey,
  useActiveAppVersionApplicationsApplicationIdVersionsVersionIdActivePut,
  useBlocksBlocksGet,
  useGetAppApplicationsApplicationIdGet,
  useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet,
  usePatternsPatternsGet
} from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import { useDebouncedValue, useHotkeys } from '@mantine/hooks'
import { ReactFlowProvider, useEdges, useNodesInitialized } from 'reactflow'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { InteractionInfo, VersionMetadata } from '@api/linguflow.schemas'
import { useIsFetching } from 'react-query'
import { GithubLogo } from '../../components/Layout/GithubLogo'
import { BuilderCanvas } from './Canvas'
import { SchemaProvider } from './useSchema'
import { Config } from './linguflow.type'
import { ContainerElemProvider } from './Canvas/useContainerElem'
import { TOOLBAR_HEIGHT, TOOLBAR_PANE_HEIGHT, Toolbar } from './Toolbar'
import { useCreateVersion, useUpdateVersion } from './useMutateVersion'

const AppBuilderWithReactFlowProviders: React.FC = () => {
  const form = useForm()
  const { data: blocksData } = useBlocksBlocksGet()
  const { data: patternsData } = usePatternsPatternsGet()

  return (
    <ReactFlowProvider>
      <FormProvider {...form}>
        <SchemaProvider value={{ blocks: blocksData?.blocks, patterns: patternsData?.patterns }}>
          <AppBuilder />
        </SchemaProvider>
      </FormProvider>
    </ReactFlowProvider>
  )
}

const AppBuilder: React.FC = () => {
  const { appId, verId } = useParams()
  const firstInitRef = useRef(false)
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
  // when route change, the verData will be undefined caused by the verId change
  const verDataCacheRef = useRef(verData)
  const verDataCache = useMemo(() => {
    if (!verData) {
      return verDataCacheRef.current
    }
    verDataCacheRef.current = verData
    return verData
  }, [verData])
  const isBlocksLoading = useIsFetching(getBlocksBlocksGetQueryKey()) > 0
  const isPatternsLoading = useIsFetching(getPatternsPatternsGetQueryKey()) > 0
  const isInfoLoading = isBlocksLoading || isPatternsLoading || isAppLoading || (isVerLoading && !firstInitRef.current)

  const containerElem = useRef<HTMLDivElement>(null)
  const [menuOpened, setMenuOpened] = useState(false)
  const [toolbarPaneOpened, setToolbarPaneOpened] = useState(false)

  const [currentInteraction, setCurrentInteraction] = useState<InteractionInfo>()

  const {
    formState: { dirtyFields }
  } = useFormContext()
  const edges = useEdges()
  const nodesInitialized = useNodesInitialized()
  const { createVersion, isCreatingVersion, canSave, setCanSave } = useCreateVersion(verData?.version)
  const { canUpdate, setCanUpdate, updateVersion } = useUpdateVersion(verData?.version)
  const [debouncedCanUpdate] = useDebouncedValue(canUpdate, 5 * 1000, { leading: false })

  useEffect(() => {
    const dirtyKeys = Object.keys(dirtyFields)
    if (!dirtyKeys.length) {
      return
    }
    setCanSave(true)
  }, [dirtyFields, setCanSave])

  useEffect(() => {
    if (!debouncedCanUpdate || canSave) {
      return
    }
    updateVersion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCanUpdate])

  useEffect(() => {
    if (!nodesInitialized) {
      return
    }

    if (nodesInitialized && !firstInitRef.current) {
      firstInitRef.current = true
      return
    }
  }, [nodesInitialized])

  useEffect(() => {
    if (!firstInitRef.current) {
      return
    }
    setCanSave(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges])

  useHotkeys([
    [
      'mod+S',
      (e) => {
        e.preventDefault()
        createVersion()
      }
    ]
  ])

  return (
    <ContainerElemProvider value={containerElem.current}>
      <Box w="100vw" h="100vh" style={{ overflow: 'hidden' }}>
        <BuilderMenu
          opened={menuOpened}
          setOpened={setMenuOpened}
          loading={isCreatingVersion}
          canSave={canSave}
          createVersion={createVersion}
        />
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
            config={verDataCache?.version?.configuration as Config}
            metadata={verData?.version?.metadata as VersionMetadata}
            interaction={currentInteraction}
            onClick={() => setMenuOpened(false)}
            onNodeDragStop={() => setCanUpdate(true)}
            onRelayout={() => setCanUpdate(true)}
            onNodesDelete={() => setCanSave(true)}
            onAddNode={() => setCanSave(true)}
          />
        </Box>
        <Toolbar
          app={appData?.application}
          ver={verData?.version}
          toolbarPaneOpened={toolbarPaneOpened}
          setToolbarPaneOpened={setToolbarPaneOpened}
          isCreatingVersion={isCreatingVersion}
          onUpdateCurrentInteraction={setCurrentInteraction}
        />
      </Box>
    </ContainerElemProvider>
  )
}

const BuilderMenu: React.FC<{
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
  canSave: boolean
  createVersion: () => void
}> = ({ opened, setOpened, loading, canSave, createVersion }) => {
  const { appId, verId } = useParams()
  const navigate = useNavigate()
  const { mutateAsync: activeVersion } = useActiveAppVersionApplicationsApplicationIdVersionsVersionIdActivePut()

  // const importYAML = async (f: File) => {
  //   if (!f) {
  //     return
  //   }

  //   const yamlStr = await f.text()
  //   const config = yaml.load(yamlStr) as ApplicationConfiguration
  // }

  // const exportYAML = () => {
  //   const appConfig = getAppConfig()
  //   download(yaml.dump(appConfig), `${appConfig.metadata.name!}.langlink.yaml`, 'text/plain')
  // }

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
            <Menu.Item
              leftSection={<IconDeviceFloppy style={{ width: rem(14), height: rem(14) }} />}
              onClick={createVersion}
              disabled={!canSave}
            >
              Save
            </Menu.Item>
            <Menu.Item
              leftSection={<IconRocket style={{ width: rem(14), height: rem(14) }} />}
              onClick={async () => {
                await activeVersion({ applicationId: appId!, versionId: verId! })
              }}
            >
              Publish
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item leftSection={<IconUpload style={{ width: rem(14), height: rem(14) }} />} disabled>
              Import
            </Menu.Item>
            <Menu.Item leftSection={<IconDownload style={{ width: rem(14), height: rem(14) }} />} disabled>
              Export
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </ActionIcon.Group>
      {!loading && canSave && (
        <Badge variant="dot" color="yellow">
          Not saved
        </Badge>
      )}
      {loading && <Loader color="gray.5" size="xs" />}
    </Group>
  )
}

export default AppBuilderWithReactFlowProviders
