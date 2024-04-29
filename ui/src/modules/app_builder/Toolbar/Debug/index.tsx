import { ActionIcon, Box, Button, Divider, FileButton, Group, Kbd, Stack, Title, Tooltip } from '@mantine/core'
import { IconPackageExport, IconPackageImport } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import download from 'downloadjs'
import yaml from 'js-yaml'
import { ApplicationInfo, ApplicationVersionInfo, InteractionInfo } from '@api/linguflow.schemas'
import {
  getInteractionInteractionsInteractionIdGet,
  useAsyncRunAppVersionApplicationsApplicationIdVersionsVersionIdAsyncRunPost,
  useGetInteractionInteractionsInteractionIdGet
} from '@api/linguflow'
import { useBlockSchema } from '../../useSchema'
import { Config } from '../../linguflow.type'
import { TextIntercation } from './TextInteraction'
import { ObjectIntercation } from './ObjectInteraction'
import { ListIntercation } from './ListInteraction'

export interface InteractionProps<V = any> {
  value: V
  onChange: (v: V) => void
  onSubmit: () => void
  interactions?: InteractionInfo[]
}

const interactionComponents: {
  [k: string]: { component: React.FC<InteractionProps>; defaultValue: (v?: any) => any }
} = {
  Text_Input: { component: TextIntercation, defaultValue: () => '' },
  Dict_Input: { component: ObjectIntercation, defaultValue: () => ({}) },
  List_Input: { component: ListIntercation, defaultValue: (v) => (v as []) || [] }
}

export const INPUT_NAMES = ['Text_Input', 'Dict_Input', 'List_Input']

const isInteractionFinished = (interaction?: InteractionInfo) => !!interaction?.output

export interface ErrorInteraction {
  id: string
  msg: string
  code: string
}

interface InteractionErrResponse {
  response: { data: { node_id: string; message: string; code: string } }
}

export const Debug: React.FC<{
  app: ApplicationInfo
  ver: ApplicationVersionInfo
  onUpdateCurrentInteraction: (interaction?: InteractionInfo) => void
  onInteractionError: (errorInteraction?: ErrorInteraction) => void
}> = ({ app, ver, onUpdateCurrentInteraction, onInteractionError }) => {
  const { blockMap } = useBlockSchema()
  const inputBlock = (ver.configuration as Config).nodes
    .map((n) => blockMap[n.name])
    .find((n) => INPUT_NAMES.includes(n.name))!
  const InteractionComponent = interactionComponents[inputBlock.name]
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
        enabled: !!currentInteraction?.id && !isInteractionFinished(currentInteraction) && !isError,
        refetchInterval: () => {
          if (isInteractionFinished(currentInteraction)) {
            return false
          }
          return 5000
        },
        refetchIntervalInBackground: true,

        onSuccess: (data) => {
          setCurrentInteraction(data.interaction)
          if (!isInteractionFinished(data.interaction)) {
            return
          }
          setValue(InteractionComponent.defaultValue)
          setInteractions((v) => [...v, data.interaction!])
        },
        onError: (error: InteractionErrResponse) => {
          setIsError(true)
          if (error?.response?.data?.node_id) {
            onInteractionError({
              id: error.response.data.node_id,
              msg: error.response.data.message,
              code: error.response.data.code
            })
          }
        }
      }
    }
  )
  const [_isLoading, setIsLoading] = useState(false)
  const isLoading =
    (_isLoading || isInteractionLoading || (!!fetchingIntercation && !isInteractionFinished(currentInteraction))) &&
    !isError

  const runInteraction = async () => {
    setCurrentInteraction(undefined)
    onInteractionError(undefined)
    setIsError(false)
    setIsLoading(true)
    try {
      const interactionRst = await runVersion({ applicationId: app.id, versionId: ver.id, data: { input: value } })
      const debugRst = await getInteractionInteractionsInteractionIdGet(interactionRst.id)
      setCurrentInteraction(debugRst.interaction)

      if (!isInteractionFinished(debugRst.interaction)) {
        return
      }
      setValue(InteractionComponent.defaultValue)
      setInteractions((v) => [...v, debugRst.interaction!])
    } catch (error: any) {
      setIsError(true)
      if (error?.response?.data?.node_id) {
        onInteractionError({
          id: error.response.data.node_id,
          msg: error.response.data.message,
          code: error.response.data.code
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const btnRef = useRef(null)

  return (
    <Group h="100%" style={{ flexWrap: 'nowrap' }}>
      <Group align="flex-start" h="100%" style={{ flexGrow: 1, flexWrap: 'nowrap' }}>
        <Title order={6}>Input</Title>
        <Box h="100%" style={{ flexGrow: 1, overflowY: 'auto' }}>
          <InteractionComponent.component
            value={value}
            onChange={setValue}
            onSubmit={() => (btnRef.current as any as { click: () => void }).click()}
            interactions={interactions}
          />
        </Box>
        <Button ref={btnRef} variant="light" style={{ flexShrink: 0 }} loading={isLoading} onClick={runInteraction}>
          Send
        </Button>
      </Group>

      <Divider orientation="vertical" />

      <Stack h="100%" w="400px" style={{ overflow: 'auto', flexShrink: 0 }} align="flex-start">
        <Group gap="xs">
          <Title order={6}>History(0)</Title>
          <FileButton
            onChange={async (f) => {
              if (!f) {
                return
              }

              const yamlStr = await f.text()
              const config = yaml.load(yamlStr) as InteractionInfo
              setCurrentInteraction(config)
              setInteractions((v) => [...v, config])
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
          {interactions.map((interaction, index) => (
            <Group key={interaction.id} gap={4}>
              <Kbd>{index}</Kbd>
              <Button
                variant={interaction.id === currentInteraction?.id ? 'light' : 'subtle'}
                color="gray"
                size="xs"
                onClick={() => setCurrentInteraction(interactions[index])}
                style={{ fontFamily: 'monospace' }}
              >
                {interaction.id}
              </Button>
              <Tooltip label="Export Interaction">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    download(yaml.dump(interaction), `${app.name}/${interaction.id}.interaction.yaml`, 'text/plain')
                  }}
                >
                  <IconPackageExport size="1rem" />
                </ActionIcon>
              </Tooltip>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Group>
  )
}
