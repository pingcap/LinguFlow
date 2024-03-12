import { useMemo, useState } from 'react'
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Code,
  Container,
  Divider,
  Group,
  Input,
  Loader,
  Menu,
  Modal,
  Skeleton,
  Stack,
  Text,
  Title,
  useMantineTheme
} from '@mantine/core'
import { IconApps, IconDots, IconEdit, IconRocket, IconSearch, IconTrash } from '@tabler/icons-react'
import { Link, useParams } from 'react-router-dom'
import {
  getListAppVersionsApplicationsApplicationIdVersionsGetQueryKey,
  useDeleteAppVersionApplicationsApplicationIdVersionsVersionIdDelete,
  useGetAppApplicationsApplicationIdGet,
  useListAppVersionsApplicationsApplicationIdVersionsGet
} from '@api/linguflow'
import { ApplicationInfo, ApplicationVersionInfo } from '@api/linguflow.schemas'
import { useQueryClient } from 'react-query'
import { useDisclosure } from '@mantine/hooks'
import { Pagination } from '../../components/Pagination'

import { NoResult } from '../../components/NoResult'
import { Layout } from '../../components/Layout/Layout'
import classes from './index.module.css'
import { getDateTime } from './utils'
import { VersionListHeader } from './Header'

const PAGE_SIZE = 12

export const VersionList: React.FC = () => {
  const theme = useMantineTheme()
  const { appId } = useParams()
  const { data: appData, isLoading: appLoading } = useGetAppApplicationsApplicationIdGet(appId!)
  const { data: versionData, isLoading: versionLoading } = useListAppVersionsApplicationsApplicationIdVersionsGet(
    appId!
  )
  const app = appData?.application
  const versions = versionData?.versions
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const totalPage = Math.ceil((versions?.length || 0) / PAGE_SIZE)
  const searchedVersions = useMemo(
    () => (search ? versions?.filter((v) => v.id.includes(search)) : versions),
    [versions, search]
  )
  const displayedVersions = useMemo(() => searchedVersions?.slice((page - 1) * 12, page * 12), [searchedVersions, page])

  return (
    <Layout
      header={{
        height: app?.active_version ? 213 : 184,
        withBorder: false,
        bottomSection: <VersionListHeader app={app} versions={versions} appLoading={appLoading} />
      }}
    >
      <Stack mih="100vh" gap={0} align="stretch">
        <Container size="lg" py="xl" w="100%">
          <Stack>
            {(versionLoading || !!versions?.length) && (
              <Group justify="space-between">
                <Input
                  className={classes.search_input}
                  leftSection={appLoading ? <Loader color="gray" size={14} /> : <IconSearch size={16} />}
                  placeholder="Search versions"
                  disabled={appLoading || versionLoading}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
              </Group>
            )}

            {versionLoading && <LoadingList />}
            {!versionLoading && !!displayedVersions?.length && <List app={app!} versions={displayedVersions} />}
            {!versionLoading && !versions?.length && (
              <Stack align="center">
                <Avatar size="lg" radius="sm" variant="default">
                  <IconApps size="2rem" color={theme.colors.gray[6]} />
                </Avatar>
                <Text c="gray.7" fz="sm">
                  Create your first version
                </Text>
              </Stack>
            )}
            {!versionLoading && !displayedVersions?.length && !!versions?.length && <NoResult />}

            {!versionLoading && (searchedVersions?.length || 0) > PAGE_SIZE && (
              <Pagination page={page} onChange={setPage} total={totalPage} />
            )}
          </Stack>
        </Container>
      </Stack>
    </Layout>
  )
}

const LIST_ITEM_HEIGHT = 86

const List: React.FC<{ app: ApplicationInfo; versions: ApplicationVersionInfo[] }> = ({ app, versions }) => {
  return (
    <Card withBorder p={0}>
      {versions.map((v, i) => {
        const isPublished = app?.active_version === v.id
        return (
          <>
            <Group p="md" justify="space-between" h={LIST_ITEM_HEIGHT}>
              <Stack gap={4} w="60%">
                <Group gap="xs" wrap="nowrap">
                  <Anchor component={Link} to={`./ver/${v.id}`} maw="80%" lineClamp={1} underline="never" c="dark">
                    <Title order={5}>{v.name}</Title>
                  </Anchor>
                  {isPublished && (
                    <Badge color="blue" radius="sm" variant="light">
                      Published
                    </Badge>
                  )}
                </Group>
                <Text c="gray.7" fz="sm" truncate>
                  Ver. {v.id.toUpperCase()}
                </Text>
              </Stack>

              <Group>
                <Stack gap={4} align="flex-end" c="gray.7" fz="sm">
                  <Text>{getDateTime(v.created_at)}</Text>
                  <Text>by Default User</Text>
                </Stack>
                <Menu shadow="md" width={140} withinPortal position="bottom-end" keepMounted>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => e.stopPropagation()}>
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                    <Menu.Item leftSection={<IconEdit size={14} />}>Edit</Menu.Item>
                    <Menu.Item leftSection={<IconRocket size={14} />} disabled={isPublished}>
                      Publish
                    </Menu.Item>
                    <Menu.Divider />

                    <DeleteVersionButton ver={v} disabled={isPublished} />
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            {i !== versions.length - 1 && <Divider color="gray.3" />}
          </>
        )
      })}
    </Card>
  )
}

const LoadingList: React.FC = () => {
  return (
    <Card withBorder p={0}>
      {Array(PAGE_SIZE)
        .fill(0)
        .map((_, i) => (
          <>
            <Group p="md" justify="space-between" h={LIST_ITEM_HEIGHT}>
              <Stack w="35%">
                <Skeleton height={12} />
                <Skeleton height={12} width="70%" />
              </Stack>
              <Skeleton height={12} width="25%" />
            </Group>
            {i !== PAGE_SIZE - 1 && <Divider color="gray.3" />}
          </>
        ))}
    </Card>
  )
}

const DeleteVersionButton: React.FC<{ ver: ApplicationVersionInfo; disabled?: boolean }> = ({ ver, disabled }) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isLoading } = useDeleteAppVersionApplicationsApplicationIdVersionsVersionIdDelete({
    mutation: {
      onSuccess: () =>
        queryClient.fetchQuery({ queryKey: getListAppVersionsApplicationsApplicationIdVersionsGetQueryKey(ver.app_id) })
    }
  })
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Modal
        closeOnClickOutside={!isLoading}
        closeOnEscape={!isLoading}
        withCloseButton={!isLoading}
        opened={opened}
        onClose={close}
        title={
          <Title order={5}>
            Delete <Code fz="md">{ver.id}</Code>
          </Title>
        }
        centered
      >
        <Text size="sm">Deleting the app version may cause online malfunctions. Confirm to delete the version?</Text>

        <Group mt="xl" justify="end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button
            color="dark"
            loading={isLoading}
            onClick={async () => {
              await mutateAsync({ applicationId: ver.app_id, versionId: ver.id })
              close()
            }}
          >
            I understand, delete it.
          </Button>
        </Group>
      </Modal>

      <Menu.Item disabled={disabled} color="red" leftSection={<IconTrash size={14} />} onClick={open}>
        Delete
      </Menu.Item>
    </>
  )
}
