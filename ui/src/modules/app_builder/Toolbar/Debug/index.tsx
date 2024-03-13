// import { ApplicationConfiguration, ApplicationRunInput, InteractionDebugResponse } from '@api/langlink.schemas'
import { ActionIcon, Box, Button, Divider, FileButton, Grid, Group, Kbd, Stack, Title, Tooltip } from '@mantine/core'
import { IconPackageExport, IconPackageImport, IconX } from '@tabler/icons-react'
import { useState } from 'react'
// import {
//   debugInteractionApplicationsApplicationIdDebugInteractionIdGet,
//   useDebugInteractionApplicationsApplicationIdDebugInteractionIdGet,
//   useRunApplicationAsyncApplicationsApplicationIdAsyncPost
// } from '@api/langlink'
import download from 'downloadjs'
import yaml from 'js-yaml'
// import { useBlockSchemas } from '../hooks/useLangLinkSchema'
// import { useAppId } from '../hooks/useAppId'
import { ApplicationInfo, ApplicationVersionInfo, InteractionInfo } from '@api/linguflow.schemas'
import {
  getInteractionInteractionsInteractionIdGet,
  useAsyncRunAppApplicationsApplicationIdAsyncRunPost,
  useAsyncRunAppVersionApplicationsApplicationIdVersionsVersionIdAsyncRunPost,
  useGetInteractionInteractionsInteractionIdGet
} from '@api/linguflow'
import { TextIntercation } from './TextInteraction'
import { ObjectIntercation } from './ObjectInteraction'
import { ListIntercation } from './ListInteraction'

export interface InteractionProps<V = any> {
  value: V
  onChange: (v: V) => void
  onSubmit: () => void
}

const interactionComponents: {
  [k: string]: { component: React.FC<InteractionProps>; defaultValue: () => any }
} = {
  TextInput: { component: TextIntercation, defaultValue: () => '' },
  DictInput: { component: ObjectIntercation, defaultValue: () => ({}) },
  ListInput: { component: ListIntercation, defaultValue: () => [] }
}

export const Debug: React.FC<{
  app: ApplicationInfo
  ver: ApplicationVersionInfo
  // onClose: () => void
  onUpdateCurrentInteraction: (interaction?: InteractionInfo) => void
}> = ({ app, ver, onUpdateCurrentInteraction }) => {
  // const appId = useAppId()
  // const { blocks, blockMap } = useBlockSchemas()
  // const inputBlock = ver.nodes.map((n) => blockMap[n.name]).find((n) => n.dir === 'input')!
  // const InteractionComponent = interactionComponents[inputBlock.name]
  const InteractionComponent = interactionComponents.TextInput
  const [value, setValue] = useState<any>(InteractionComponent.defaultValue())
  const [interactions, setInteractions] = useState<InteractionInfo[]>([])
  const [currentInteraction, _setCurrentInteraction] = useState<InteractionInfo>()
  const setCurrentInteraction = (int?: InteractionInfo) => {
    _setCurrentInteraction(int)
    onUpdateCurrentInteraction(int)
  }
  const { mutateAsync: runVersion } = useAsyncRunAppVersionApplicationsApplicationIdVersionsVersionIdAsyncRunPost()
  const [isError, setIsError] = useState(false)
  const { data: fetchingIntercation, isLoading: isInteractionLoading } = useGetInteractionInteractionsInteractionIdGet(
    currentInteraction?.id as string,
    {
      query: {
        enabled: !!currentInteraction?.id && !Object.keys(currentInteraction?.data || {}).length && !isError,
        refetchInterval: () => {
          if (Object.keys(currentInteraction?.data || {}).length) {
            return false
          }
          return 5000
        },
        refetchIntervalInBackground: true,
        onSuccess: (data) => {
          if (!Object.keys(data.interaction?.data || {}).length) {
            return
          }
          setCurrentInteraction(data.interaction)
          setValue(InteractionComponent.defaultValue())
          setInteractions((v) => [...v, data.interaction!])
        },
        onError: () => setIsError(true)
      }
    }
  )
  const [_isLoading, setIsLoading] = useState(false)
  const isLoading =
    (_isLoading ||
      isInteractionLoading ||
      (!!fetchingIntercation && !Object.keys(fetchingIntercation.interaction?.data || {}).length)) &&
    !isError
  // if (!blocks.length) {
  //   return
  // }

  const runInteraction = async () => {
    setCurrentInteraction(undefined)
    setIsError(false)
    setIsLoading(true)
    try {
      const interactionRst = await runVersion({ applicationId: app.id, versionId: ver.id, data: { input: value } })
      const debugRst = await getInteractionInteractionsInteractionIdGet(interactionRst.id)
      setCurrentInteraction(debugRst.interaction)

      if (!Object.keys(debugRst.interaction?.data || {}).length) {
        return
      }
      setValue(InteractionComponent.defaultValue())
      setInteractions((v) => [...v, debugRst.interaction!])
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Group h="100%">
      <Group align="flex-start" h="100%" style={{ flexGrow: 1 }}>
        <Title order={6}>Input</Title>
        <Box style={{ flexGrow: 1 }}>
          <InteractionComponent.component
            value={value}
            onChange={setValue}
            onSubmit={() => {
              return
            }}
          />
        </Box>
        <Button variant="light" loading={isLoading} onClick={runInteraction}>
          Send
        </Button>
      </Group>

      <Divider orientation="vertical" />

      <Stack h="100%" w="400px" style={{ overflow: 'auto' }} align="flex-start">
        <Group gap="xs">
          <Title order={6}>History(0)</Title>
          <FileButton
            onChange={async (f) => {
              if (!f) {
                return
              }

              const yamlStr = await f.text()
              // const config = yaml.load(yamlStr) as InteractionDebugResponse
              // setCurrentInteraction(config)
              // setInteractions((v) => [...v, config])
            }}
          >
            {(props) => (
              <Tooltip label="Import Interaction">
                <ActionIcon variant="subtle" {...props} c="dark">
                  <IconPackageImport size="1.2rem" />
                </ActionIcon>
              </Tooltip>
            )}
          </FileButton>
        </Group>
        <Stack gap={4} w="100%" h="calc(100% - 24px)" style={{ overflow: 'auto' }}>
          {/* {interactions.map((interaction, index) => (
              <Group key={interaction.interaction} spacing={4}>
                <Kbd>{index}</Kbd>
                <Button
                  variant={interaction.interaction === currentInteraction?.interaction ? 'light' : 'subtle'}
                  color="gray"
                  size="xs"
                  onClick={() => setCurrentInteraction(interactions[index])}
                >
                  {interaction.interaction}
                </Button>
                <Tooltip label="Export Interaction">
                  <ActionIcon
                    onClick={() => {
                      download(
                        yaml.dump(interaction),
                        `${interaction.application}/${interaction.interaction}.langlink_interaction.yaml`,
                        'text/plain'
                      )
                    }}
                  >
                    <IconPackageExport size="1rem" />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ))} */}
        </Stack>
      </Stack>
    </Group>
  )
}
