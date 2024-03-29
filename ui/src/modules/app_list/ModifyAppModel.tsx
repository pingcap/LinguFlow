import { Anchor, Box, Button, Chip, Code, Divider, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core'
import { getHotkeyHandler } from '@mantine/hooks'
import {
  getListAppApplicationsGetQueryKey,
  useCreateAppApplicationsPost,
  useUpdateAppMetaApplicationsApplicationIdPut
} from '@api/linguflow'
import { ApplicationInfo } from '@api/linguflow.schemas'
import { useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'

export interface ModifyAppModelProps {
  opened: boolean
  onClose: () => void
  app?: ApplicationInfo
}

export const ModifyAppModel: React.FC<ModifyAppModelProps> = ({ opened, onClose, app }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState(app?.name || '')
  const [langfusePK, setLangfusePK] = useState(app?.langfuse_public_key || '')
  const [langfuseSK, setLangfuseSK] = useState(app?.langfuse_secret_key || '')
  const [template, setTemplate] = useState<string[]>([])
  const { mutateAsync: createApp, isLoading: isCreating } = useCreateAppApplicationsPost({
    mutation: {
      onSuccess: async (data) => {
        await queryClient.fetchQuery({ queryKey: getListAppApplicationsGetQueryKey() })
        onClose()

        const redirectTo = template.length ? `/app/${data.id}/ver?template=${template[0]}` : `/app/${data.id}`
        navigate(redirectTo)
      }
    }
  })
  const { mutateAsync: updateApp, isLoading: isUpdating } = useUpdateAppMetaApplicationsApplicationIdPut({
    mutation: {
      onSuccess: async () => {
        await queryClient.fetchQuery({ queryKey: getListAppApplicationsGetQueryKey() })
        onClose()
      }
    }
  })
  const handleConfirm = async () => {
    if (isLoading || !opened || !name) {
      return
    }

    if (!app) {
      await createApp({ data: { name, langfusePublicKey: langfusePK, langfuseSecretKey: langfuseSK } })
    } else {
      await updateApp({
        applicationId: app.id,
        data: { name, langfusePublicKey: langfusePK, langfuseSecretKey: langfuseSK }
      })
    }
  }

  const isLoading = isCreating || isUpdating

  useEffect(() => {
    if (!opened) {
      return
    }
    setName(app?.name || '')
    setLangfusePK(app?.langfuse_public_key || '')
    setLangfuseSK(app?.langfuse_secret_key || '')
    setTemplate([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened])

  return (
    <Modal
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      withCloseButton={!isLoading}
      opened={opened}
      onClose={onClose}
      title={
        <Text fw="bold">
          {!app ? (
            'New Application'
          ) : (
            <>
              Edit <Code fz="md">{app.name}</Code>
            </>
          )}
        </Text>
      }
      centered
      trapFocus={false}
    >
      <Stack>
        <TextInput
          required
          autoFocus
          label="Name"
          placeholder="Please input the application name"
          value={name}
          disabled={isLoading}
          onChange={(event) => {
            setName(event.currentTarget.value)
          }}
          onKeyDown={getHotkeyHandler([['Enter', handleConfirm]])}
        />

        <TextInput
          label="Langfuse Public Key"
          placeholder="Please input the langfuse public key"
          value={langfusePK}
          disabled={isLoading}
          onChange={(event) => {
            setLangfusePK(event.currentTarget.value)
          }}
        />

        <TextInput
          label="Langfuse Secret Key"
          placeholder="Please input the langfuse secret key"
          value={langfuseSK}
          disabled={isLoading}
          onChange={(event) => {
            setLangfuseSK(event.currentTarget.value)
          }}
          onKeyDown={getHotkeyHandler([['Enter', handleConfirm]])}
        />

        {!app && (
          <>
            <Divider />

            <Title order={6}>
              <Group justify="space-between">
                <Box>Templates </Box>
                <Anchor href="https://github.com/pingcap/LinguFlow/tree/main/ui/examples" target="_blank" fz="xs">
                  More
                </Anchor>
              </Group>
            </Title>

            <Chip.Group
              multiple
              value={template}
              onChange={(ts) =>
                setTemplate((oldTs) => {
                  return ts.filter((t) => !oldTs.includes(t))
                })
              }
            >
              <Group>
                <Chip radius="xs" variant="outline" value="chatbot">
                  Chatbot
                </Chip>
              </Group>
            </Chip.Group>
          </>
        )}
      </Stack>

      <Group mt="xl" justify="end">
        <Button variant="default" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button color="dark" loading={isLoading} disabled={!name} onClick={handleConfirm}>
          Confirm
        </Button>
      </Group>
    </Modal>
  )
}
