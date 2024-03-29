import {
  getGetAppApplicationsApplicationIdGetQueryKey,
  useActiveAppVersionApplicationsApplicationIdVersionsVersionIdActivePut
} from '@api/linguflow'
import { ApplicationVersionInfo } from '@api/linguflow.schemas'
import { Button, Code, Group, Modal, Text } from '@mantine/core'
import { useQueryClient } from 'react-query'

export interface PublishModalProps {
  opened: boolean
  close: () => void
  ver?: ApplicationVersionInfo
  beforePublish?: () => void
  onSuccess?: () => void
}

export const PublishModal: React.FC<PublishModalProps> = ({ opened, close, ver, beforePublish, onSuccess }) => {
  const qc = useQueryClient()
  const { mutateAsync: activeVersion, isLoading } =
    useActiveAppVersionApplicationsApplicationIdVersionsVersionIdActivePut({
      mutation: {
        onSuccess: () => {
          qc.fetchQuery(getGetAppApplicationsApplicationIdGetQueryKey(ver!.app_id))
          onSuccess?.()
        }
      }
    })

  return (
    <Modal
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      withCloseButton={!isLoading}
      opened={opened}
      onClose={close}
      title={
        <Text fw="bold">
          Publish <Code fz="md">{ver?.name}</Code>
        </Text>
      }
      centered
    >
      <Text size="sm">Publish the app version may change online app behavior. Confirm to publish the version?</Text>

      <Group mt="xl" justify="end">
        <Button variant="default" onClick={close} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          color="dark"
          loading={isLoading}
          onClick={async () => {
            beforePublish?.()
            await activeVersion({ applicationId: ver!.app_id, versionId: ver!.id })
            close()
          }}
        >
          I understand, publish it.
        </Button>
      </Group>
    </Modal>
  )
}
