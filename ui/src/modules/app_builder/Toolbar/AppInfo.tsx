import { ApplicationInfo, ApplicationVersionInfo } from '@api/linguflow.schemas'
import { ActionIcon, Group, Stack, Text, TextInput } from '@mantine/core'
import { IconCheck, IconPencil, IconX } from '@tabler/icons-react'
import { useState } from 'react'

export const AppInfo: React.FC<{
  app?: ApplicationInfo
  ver?: ApplicationVersionInfo
}> = ({ app, ver }) => {
  const [name, setName] = useState(app?.name)
  const [isEditable, setIsEditable] = useState(false)
  const [verName, setVerName] = useState('')
  const [isVerEditable, setIsVerEditable] = useState(false)

  const confirmUpdateName = () => {
    // await updateName({ applicationId: app?.id, data: { ...app.metadata, name: name?.trim() } })
    setIsEditable(false)
  }
  const confirmUpdateVerName = () => {
    // await updateName({ applicationId: app?.id, data: { ...app.metadata, name: name?.trim() } })
    setIsVerEditable(false)
  }

  return (
    <Stack gap={4}>
      <Group align="center" gap="xs" h="30">
        <Text w="90" fz="xs" style={{ display: 'inline-block' }}>
          App Name:{' '}
        </Text>

        {isEditable ? (
          <>
            <TextInput
              autoFocus
              size="xs"
              placeholder="App Name"
              value={name}
              // disabled={isUpdatingName}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setName(app?.name)
                  setIsEditable(false)
                  return
                }
                if (e.key !== 'Enter') {
                  return
                }
                confirmUpdateName()
              }}
              rightSection={
                <ActionIcon variant="subtle" c="gray" size="sm" onClick={confirmUpdateName}>
                  <IconCheck size="1rem" />
                </ActionIcon>
              }
            />
            <ActionIcon size="sm" variant="subtle" c="gray" onClick={() => setIsEditable(false)}>
              <IconX size="1rem" />
            </ActionIcon>
          </>
        ) : (
          <>
            <Text fw="bold" fz="xs" span>
              {app?.name}
            </Text>
            <ActionIcon size="sm" variant="subtle" c="gray" onClick={() => setIsEditable(true)}>
              <IconPencil size="1rem" />
            </ActionIcon>
          </>
        )}
      </Group>

      <Group align="center" gap="xs" h="30">
        <Text w="90" fz="xs" style={{ display: 'inline-block' }}>
          App ID:{' '}
        </Text>
        <Text fw="bold" fz="xs" span>
          {app?.id}
        </Text>
      </Group>

      <Group align="center" gap="xs" h="30">
        <Text w="90" fz="xs" style={{ display: 'inline-block' }}>
          Version Name:{' '}
        </Text>

        {isVerEditable ? (
          <>
            <TextInput
              autoFocus
              size="xs"
              placeholder="Version Name"
              value={verName}
              // disabled={isUpdatingName}
              onChange={(e) => setVerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setVerName('')
                  setIsVerEditable(false)
                  return
                }
                if (e.key !== 'Enter') {
                  return
                }
                confirmUpdateVerName()
              }}
              rightSection={
                <ActionIcon variant="subtle" c="gray" size="sm" onClick={confirmUpdateVerName}>
                  <IconCheck size="1rem" />
                </ActionIcon>
              }
            />
            <ActionIcon size="sm" variant="subtle" c="gray" onClick={() => setIsVerEditable(false)}>
              <IconX size="1rem" />
            </ActionIcon>
          </>
        ) : (
          <>
            <Text fw="bold" fz="xs" span>
              Ver name
            </Text>
            <ActionIcon size="sm" variant="subtle" c="gray" onClick={() => setIsVerEditable(true)}>
              <IconPencil size="1rem" />
            </ActionIcon>
          </>
        )}
      </Group>

      <Group align="center" gap="xs" h="30">
        <Text w="90" fz="xs" style={{ display: 'inline-block' }}>
          Version ID:{' '}
        </Text>
        <Text fw="bold" fz="xs" span>
          {ver?.id}
        </Text>
      </Group>
    </Stack>
  )
}
