import { ApplicationInfo, ApplicationVersionInfo } from '@api/linguflow.schemas'
import { ActionIcon, CopyButton, Group, Stack, Text, TextInput, Tooltip, rem } from '@mantine/core'
import { IconCheck, IconCopy, IconPencil, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet } from '@api/linguflow'
import { useParams } from 'react-router-dom'
import { useUpdateVersion } from '../useMutateVersion'

export const AppInfo: React.FC<{
  app?: ApplicationInfo
  ver?: ApplicationVersionInfo
}> = ({ app, ver }) => {
  const { appId, verId } = useParams()
  const [verName, setVerName] = useState(ver?.name)
  const [isVerEditable, setIsVerEditable] = useState(false)
  const { updateVersion, isUpdatingVersion } = useUpdateVersion(ver)
  const { refetch, isRefetching } = useGetAppVersionApplicationsApplicationIdVersionsVersionIdGet(appId!, verId!, {
    query: {
      enabled: false
    }
  })

  const disabled = isUpdatingVersion || isRefetching

  const confirmUpdateVerName = async () => {
    await updateVersion(verName, true)
    await refetch()
    setIsVerEditable(false)
  }

  return (
    <Stack gap={4}>
      <Group align="center" gap="xs" h="30">
        <Text w="90" fz="xs" style={{ display: 'inline-block' }}>
          App Name:{' '}
        </Text>
        <Text fw="bold" fz="xs" span>
          {app?.name}
        </Text>
      </Group>

      <Group align="center" gap="xs" h="30">
        <Text w="90" fz="xs" style={{ display: 'inline-block' }}>
          App ID:{' '}
        </Text>
        <Text fw="bold" fz="xs" span>
          {app?.id}
        </Text>
        <CopyButton value={app?.id || ''} timeout={2000}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
              <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                {copied ? <IconCheck style={{ width: rem(16) }} /> : <IconCopy style={{ width: rem(16) }} />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
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
              disabled={disabled}
              value={verName}
              onChange={(e) => setVerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setVerName(ver?.name)
                  setIsVerEditable(false)
                  return
                }
                if (e.key !== 'Enter') {
                  return
                }
                confirmUpdateVerName()
              }}
              rightSection={
                <ActionIcon variant="subtle" c="gray" size="sm" onClick={confirmUpdateVerName} disabled={disabled}>
                  <IconCheck size="1rem" />
                </ActionIcon>
              }
            />
            <ActionIcon
              size="sm"
              variant="subtle"
              c="gray"
              onClick={() => {
                setVerName(ver?.name)
                setIsVerEditable(false)
              }}
              disabled={disabled}
            >
              <IconX size="1rem" />
            </ActionIcon>
          </>
        ) : (
          <>
            <Text fw="bold" fz="xs" span>
              {ver?.name}
            </Text>
            <ActionIcon size="sm" variant="subtle" c="gray" onClick={() => setIsVerEditable(true)} disabled={disabled}>
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
