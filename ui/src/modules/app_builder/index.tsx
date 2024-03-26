import { ActionIcon, Anchor, Badge, Box, FileButton, Group, Loader, LoadingOverlay, Menu, rem } from '@mantine/core'
import { IconChevronLeft, IconDeviceFloppy, IconDownload, IconMenu2, IconRocket, IconUpload } from '@tabler/icons-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import 'reactflow/dist/style.css'
import {
  getBlocksBlocksGetQueryKey,
  getPatternsPatternsGetQueryKey,
  useBlocksBlocksGet,
  useGetAppApplicationsApplicationIdGet,
  useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet,
  usePatternsPatternsGet
} from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import download from 'downloadjs'
import yaml from 'js-yaml'
import { useDebouncedValue, useDisclosure, useHotkeys } from '@mantine/hooks'
import { ReactFlowProvider, useNodesInitialized, useReactFlow } from 'reactflow'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { ApplicationInfo, ApplicationVersionInfo, InteractionInfo, VersionMetadata } from '@api/linguflow.schemas'
import { useIsFetching } from 'react-query'
import { GithubLogo } from '../../components/Layout/GithubLogo'
import { PublishModal } from '../shared/PublishModal'
import { BuilderCanvas } from './Canvas'
import { SchemaProvider } from './useSchema'
import { Config, ConfigAndMetadataUI, MetadataUI } from './linguflow.type'
import { ContainerElemProvider } from './Canvas/useContainerElem'
import { TOOLBAR_HEIGHT, TOOLBAR_PANE_HEIGHT, Toolbar } from './Toolbar'
import { getCurrentDateTimeName, useCreateVersion, useUpdateVersion } from './useMutateVersion'
import { useCloseAllDrawer } from './Block/useBlockDrawer'
import { ErrorInteraction } from './Toolbar/Debug'

const MENU_ZINDEX = 99

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
  const [importConfig, setImportConfig] = useState<Config | null>(null)
  const [importMetadata, setImportMetadata] = useState<MetadataUI | null>(null)
  const { data: verData, isLoading: isVerLoading } = useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet(
    appId!,
    verId!,
    {
      query: {
        enabled: !!appId && !!verId,
        onSuccess: () => {
          setImportConfig(null)
          setImportMetadata(null)
        }
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
  const verConfig = useMemo(() => {
    return importConfig || (verDataCache?.version?.configuration as Config | undefined)
  }, [verDataCache, importConfig])
  const verMetadata = useMemo<VersionMetadata | undefined>(() => {
    return (importMetadata ? { ui: importMetadata } : verDataCache?.version?.metadata) as VersionMetadata
  }, [verDataCache, importMetadata])
  const isBlocksLoading = useIsFetching(getBlocksBlocksGetQueryKey()) > 0
  const isPatternsLoading = useIsFetching(getPatternsPatternsGetQueryKey()) > 0
  const isInfoLoading = isBlocksLoading || isPatternsLoading || isAppLoading || (isVerLoading && !firstInitRef.current)

  const containerElem = useRef<HTMLDivElement>(null)
  const [menuOpened, setMenuOpened] = useState(false)
  const [toolbarPaneOpened, setToolbarPaneOpened] = useState(false)

  const [currentInteraction, setCurrentInteraction] = useState<InteractionInfo>()
  const [errorInteraction, setErrorInteraction] = useState<ErrorInteraction>()

  const {
    formState: { dirtyFields }
  } = useFormContext()
  const dirtyKeys = Object.keys(dirtyFields).join(',')
  const closeAllDrawer = useCloseAllDrawer()
  const nodesInitialized = useNodesInitialized()
  const {
    createVersion: _createVersion,
    isCreatingVersion: _isCreatingVersion,
    canSave,
    setCanSave
  } = useCreateVersion(verData?.version)
  const isCreatingVersion = _isCreatingVersion || isVerLoading
  const createVersion = () => {
    setToolbarPaneOpened(false)
    closeAllDrawer()
    return _createVersion()
  }
  const { canUpdate, setCanUpdate, updateVersion } = useUpdateVersion(verData?.version)
  const [debouncedCanUpdate] = useDebouncedValue(canUpdate, 5 * 1000, { leading: false })

  useEffect(() => {
    if (!dirtyKeys.length) {
      return
    }
    setCanSave(true)
  }, [dirtyKeys, setCanSave])

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
          app={appData?.application}
          ver={verData?.version}
          opened={menuOpened}
          setOpened={setMenuOpened}
          loading={isCreatingVersion}
          canSave={canSave}
          createVersion={createVersion}
          importApp={(config) => {
            setImportConfig(config.config)
            setImportMetadata(config.ui)
            setCanSave(true)
          }}
        />
        <Anchor
          href="https://github.com/pingcap/LinguFlow"
          style={{ position: 'absolute', top: '15px', right: '15px', zIndex: MENU_ZINDEX }}
          target="_blank"
        >
          <ActionIcon variant="default" aria-label="GitHub" size="lg">
            <GithubLogo />
          </ActionIcon>
        </Anchor>

        <Box
          w="100%"
          pos="relative"
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
            config={verConfig}
            metadata={verMetadata}
            interaction={currentInteraction}
            errorInteraction={errorInteraction}
            onClick={() => setMenuOpened(false)}
            onNodeDragStop={() => setCanUpdate(true)}
            onRelayout={() => setCanUpdate(true)}
            onNodesDelete={() => setCanSave(true)}
            onAddNode={() => setCanSave(true)}
            onConnect={() => setCanSave(true)}
            onEdgeChange={(c) => {
              const isSelect = c.some((e) => e.type === 'select')
              if (isSelect) {
                return
              }
              setCanSave(true)
            }}
            onCanSave={() => setCanSave(true)}
          />
        </Box>
        <Toolbar
          app={appData?.application}
          ver={verData?.version}
          toolbarPaneOpened={toolbarPaneOpened}
          setToolbarPaneOpened={setToolbarPaneOpened}
          isCreatingVersion={isCreatingVersion}
          onUpdateCurrentInteraction={setCurrentInteraction}
          onInteractionError={setErrorInteraction}
        />
      </Box>
    </ContainerElemProvider>
  )
}

const BuilderMenu: React.FC<{
  app?: ApplicationInfo
  ver?: ApplicationVersionInfo
  opened: boolean
  setOpened: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
  canSave: boolean
  createVersion: () => void
  importApp: (config: ConfigAndMetadataUI) => void
}> = ({ app, ver, opened, setOpened, loading, canSave, createVersion, importApp }) => {
  const { appId, verId } = useParams()
  const navigate = useNavigate()
  const { getNodes, getEdges } = useReactFlow()
  const { getValues } = useFormContext()

  const importYAML = async (f: File | null) => {
    if (!f) {
      return
    }

    const yamlStr = await f.text()
    const config = yaml.load(yamlStr) as ConfigAndMetadataUI
    importApp(config)
  }

  const exportYAML = () => {
    const config: ConfigAndMetadataUI = {
      config: {
        nodes: Object.values(getValues()),
        edges: getEdges().map((e) => ({
          src_block: e.source,
          dst_block: e.target,
          dst_port: e.targetHandle!,
          alias: e.data?.alias,
          case: e.data?.case
        }))
      },
      ui: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        nodes: getNodes().map(({ data, ...n }) => ({ ...n, data: undefined }))
      }
    }
    download(yaml.dump(config), `${app?.name || appId!}.${getCurrentDateTimeName()}.linguflow.yaml`, 'text/plain')
  }

  const [publishModalOpened, { open: openPublishModal, close: closePublishModal }] = useDisclosure(false)

  return (
    <Group style={{ position: 'absolute', top: '15px', left: '15px', zIndex: MENU_ZINDEX }}>
      <ActionIcon.Group>
        <ActionIcon
          variant="default"
          aria-label="Go Back"
          size="lg"
          onClick={() => navigate(verId ? '../..' : '..', { replace: true, relative: 'path' })}
        >
          <IconChevronLeft style={{ width: '60%', height: '60%', color: '#000' }} stroke={1.5} />
        </ActionIcon>

        <Menu shadow="md" width={140} position="bottom-start" opened={opened} onChange={setOpened} keepMounted>
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
              disabled={!ver || canSave || ver.id === app?.active_version}
              leftSection={<IconRocket style={{ width: rem(14), height: rem(14) }} />}
              onClick={openPublishModal}
            >
              Publish
            </Menu.Item>
            <PublishModal opened={publishModalOpened} close={closePublishModal} ver={ver} />

            <Menu.Divider />

            <FileButton onChange={importYAML} accept=".yml,.yaml">
              {(props) => (
                <Menu.Item {...props} leftSection={<IconUpload style={{ width: rem(14), height: rem(14) }} />}>
                  Import
                </Menu.Item>
              )}
            </FileButton>
            <Menu.Item onClick={exportYAML} leftSection={<IconDownload style={{ width: rem(14), height: rem(14) }} />}>
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
