// import { ApplicationConfiguration, ApplicationRunInput, InteractionDebugResponse } from '@api/langlink.schemas'
import { ActionIcon, Box, Button, FileButton, Grid, Group, Kbd, Stack, Title, Tooltip } from '@mantine/core'
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
import { TextIntercation } from './TextInteraction'
import { ObjectIntercation } from './ObjectInteraction'
import { ListIntercation } from './ListInteraction'

export const Debug: React.FC<{
  // app: ApplicationConfiguration
  // onUpdateCurrentInteraction: (interaction?: InteractionDebugResponse) => void
}> = () => {
  const [showDebug, setShowDebug] = useState(false)
  // const { blocks } = useBlockSchemas()
  return (
    <DebugArea
    // app={app}
    // onClose={() => setShowDebug(false)}
    // onUpdateCurrentInteraction={onUpdateCurrentInteraction}
    />
  )
}

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

const DebugArea: React.FC<{
  // app: ApplicationConfiguration
  // onClose: () => void
  // onUpdateCurrentInteraction: (interaction?: InteractionDebugResponse) => void
}> = () => {
  // const appId = useAppId()
  // const { blocks, blockMap } = useBlockSchemas()
  // const inputBlock = app.nodes.map((n) => blockMap[n.name]).find((n) => n.dir === 'input')!
  // const InteractionComponent = interactionComponents[inputBlock.name]
  const InteractionComponent = interactionComponents.TextInput
  const [value, setValue] = useState<any>(InteractionComponent.defaultValue())
  // const [interactions, setInteractions] = useState<InteractionDebugResponse[]>([])
  // const [currentInteraction, _setCurrentInteraction] = useState<InteractionDebugResponse>()
  // const setCurrentInteraction = (int?: InteractionDebugResponse) => {
  //   _setCurrentInteraction(int)
  //   onUpdateCurrentInteraction(int)
  // }
  // const { mutateAsync: runApp } = useRunApplicationAsyncApplicationsApplicationIdAsyncPost()
  // const [isError, setIsError] = useState(false)
  // const { data: fetchingIntercation, isLoading: isInteractionLoading } =
  //   useDebugInteractionApplicationsApplicationIdDebugInteractionIdGet(
  //     appId!,
  //     (currentInteraction as any)?.interaction as string,
  //     {},
  //     {
  //       query: {
  //         enabled: !!currentInteraction?.interaction && !currentInteraction?.debug.length && !isError,
  //         refetchInterval: () => {
  //           if (currentInteraction?.debug.length) {
  //             return false
  //           }
  //           return 5000
  //         },
  //         refetchIntervalInBackground: true,
  //         onSuccess: (data) => {
  //           if (!data.debug.length) {
  //             return
  //           }
  //           setCurrentInteraction(data)
  //           setValue(InteractionComponent.defaultValue())
  //           setInteractions((v) => [...v, data])
  //         },
  //         onError: () => setIsError(true)
  //       }
  //     }
  //   )
  const [isLoading, setIsLoading] = useState(false)
  // const isLoading =
  //   (_isLoading || isInteractionLoading || (!!fetchingIntercation && !fetchingIntercation.debug.length)) && !isError
  // if (!blocks.length) {
  //   return
  // }

  // const runInteraction = async () => {
  //   setCurrentInteraction(undefined)
  //   setIsError(false)
  //   setIsLoading(true)
  //   try {
  //     const interactionRst = await runApp({ applicationId: appId!, data: { input: value } })
  //     const debugRst = await debugInteractionApplicationsApplicationIdDebugInteractionIdGet(appId!, interactionRst.id)
  //     setCurrentInteraction(debugRst)

  //     if (!debugRst.debug.length) {
  //       return
  //     }
  //     setValue(InteractionComponent.defaultValue())
  //     setInteractions((v) => [...v, debugRst])
  //   } catch {
  //     setIsError(true)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <Grid h="100%" gutter={0}>
      <Grid.Col h="100%" span={8}>
        <Stack h="100%" style={{ overflow: 'auto' }}>
          <Grid h="calc(100% - 24px)" grow>
            <Grid.Col h="100%" span={10} style={{ overflow: 'auto' }}>
              <InteractionComponent.component
                value={value}
                onChange={setValue}
                onSubmit={() => {
                  return
                }}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              {/* <Button variant="light" loading={isLoading} onClick={runInteraction}> */}
              <Button variant="light" loading={isLoading}>
                Send
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </Grid.Col>

      <Grid.Col h="100%" span={4}>
        <Stack h="100%" style={{ overflow: 'auto' }} align="flex-start">
          <Group gap="xs">
            <Title order={6}>Interactions(0)</Title>
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
      </Grid.Col>
    </Grid>
  )
}
