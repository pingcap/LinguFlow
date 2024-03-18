import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Code,
  Container,
  Group,
  Loader,
  Menu,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { IconDots, IconPlus, IconSearch } from '@tabler/icons-react'
import { getHotkeyHandler, useDisclosure } from '@mantine/hooks'
import {
  getListAppApplicationsGetQueryKey,
  useCreateAppApplicationsPost,
  useDeleteAppApplicationsApplicationIdDelete,
  useListAppApplicationsGet,
  useUpdateAppMetaApplicationsApplicationIdPut
} from '@api/linguflow'
import { ApplicationInfo } from '@api/linguflow.schemas'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useQueryClient } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Card, LoadingCard } from '../../components/Card'
import { Pagination } from '../../components/Pagination'

import { NoResult } from '../../components/NoResult'
import classes from './index.module.css'

const PAGE_SIZE = 12

export const AppList: React.FC = () => {
  const { data, isLoading } = useListAppApplicationsGet()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const totalPage = Math.ceil((data?.applications.length || 0) / PAGE_SIZE)
  const searchedData = useMemo(
    () =>
      search
        ? data?.applications.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
        : data?.applications,
    [data, search]
  )
  const displayedData = useMemo(() => searchedData?.slice((page - 1) * 12, page * 12), [searchedData, page])
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <Container size="lg" py="lg">
      <Stack mih="100vh" gap="lg">
        <Group justify="space-between">
          <TextInput
            className={classes.search_input}
            leftSection={isLoading ? <Loader color="gray" size={14} /> : <IconSearch size={16} />}
            placeholder="Search applications"
            disabled={isLoading}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <ModifyAppModel opened={opened} onClose={close} />
          <NewAppButton onClick={open} />
        </Group>

        <SimpleGrid cols={{ lg: 3, md: 2, sm: 1 }} spacing={{ lg: 'lg', md: 'md', sm: 'sm' }}>
          {isLoading &&
            Array(PAGE_SIZE)
              .fill(0)
              .map((_, i) => <LoadingCard key={i} />)}
          {!isLoading && !!displayedData?.length && displayedData.map((app) => <AppCard app={app} key={app.id} />)}
          {!isLoading && !displayedData?.length && !data?.applications.length && <NewAppCard onClick={open} />}
        </SimpleGrid>

        {!isLoading && !displayedData?.length && !!data?.applications.length && <NoResult />}

        {!isLoading && (searchedData?.length || 0) > PAGE_SIZE && (
          <Pagination page={page} onChange={setPage} total={totalPage} />
        )}
      </Stack>
    </Container>
  )
}

interface ModifyAppModelProps {
  opened: boolean
  onClose: () => void
  app?: ApplicationInfo
}

const ModifyAppModel: React.FC<ModifyAppModelProps> = ({ opened, onClose, app }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState(app?.name || '')
  const [langfusePK, setLangfusePK] = useState(app?.langfuse_public_key || '')
  const [langfuseSK, setLangfuseSK] = useState(app?.langfuse_secret_key || '')
  const { mutateAsync: createApp, isLoading: isCreating } = useCreateAppApplicationsPost({
    mutation: {
      onSuccess: async (data) => {
        await queryClient.fetchQuery({ queryKey: getListAppApplicationsGetQueryKey() })
        onClose()
        navigate(`/app/${data.id}`)
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
        <Title order={5}>
          {!app ? (
            'New Application'
          ) : (
            <>
              Edit <Code fz="md">{app.name}</Code>
            </>
          )}
        </Title>
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

const NewAppButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      leftSection={
        <Box visibleFrom="sm">
          <IconPlus size={16} />
        </Box>
      }
      color="dark"
      onClick={onClick}
    >
      <Text visibleFrom="sm">New App</Text>
      <Box hiddenFrom="sm">
        <IconPlus size={16} />
      </Box>
    </Button>
  )
}

const NewAppCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Card onClick={onClick}>
      <Stack align="center">
        <Avatar size="lg" radius="sm">
          <IconPlus size="1.5rem" />
        </Avatar>
        <Text c="gray.7" fz="sm">
          Create your first application
        </Text>
      </Stack>
    </Card>
  )
}

const AppCard: React.FC<{ app: ApplicationInfo }> = ({ app }) => {
  const [opened, { open, close }] = useDisclosure(false)
  const createdAt = useMemo(() => {
    const isLargeThan22h = dayjs().diff(dayjs.unix(app.created_at), 'hour') > 22
    const timeFromNow = dayjs.unix(app.created_at).fromNow()
    return isLargeThan22h
      ? `Created at ${dayjs.unix(app.created_at).format('MMM D, YYYY')} (${timeFromNow})`
      : `Created ${timeFromNow}`
  }, [app])

  return (
    <Card component={Link} to={`/app/${app.id}`}>
      <Stack>
        <Group justify="space-between">
          <Stack gap={0} maw="80%">
            <Title order={6} lineClamp={1}>
              {app.name}
            </Title>
            <Text c="gray.7" fz="sm" truncate>
              {app.active_version ? `Published ver. ${app.active_version}` : 'No published version'}
            </Text>
          </Stack>

          <Menu shadow="md" width={120} withinPortal position="bottom-start" keepMounted>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Menu.Item onClick={open}>Edit</Menu.Item>
              <ModifyAppModel opened={opened} onClose={close} app={app} />

              <Menu.Divider />

              <DeleteAppButton app={app} />
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Stack gap={0}>
          <Text c="gray.6" fz="sm" truncate>
            Owned by Default User
          </Text>
          <Text c="gray.6" fz="sm" truncate>
            {createdAt}
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}

const DeleteAppButton: React.FC<{ app: ApplicationInfo }> = ({ app }) => {
  const queryClient = useQueryClient()
  const { mutateAsync, isLoading } = useDeleteAppApplicationsApplicationIdDelete({
    mutation: {
      onSuccess: () => queryClient.fetchQuery({ queryKey: getListAppApplicationsGetQueryKey() })
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
            Delete <Code fz="md">{app.name}</Code>
          </Title>
        }
        centered
      >
        <Text size="sm">
          Deleting the application may cause online malfunctions. Confirm to delete the application?
        </Text>

        <Group mt="xl" justify="end">
          <Button variant="default" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            color="dark"
            loading={isLoading}
            onClick={async () => {
              await mutateAsync({ applicationId: app.id })
              close()
            }}
          >
            I understand, delete it.
          </Button>
        </Group>
      </Modal>

      <Menu.Item color="red" onClick={open}>
        Delete
      </Menu.Item>
    </>
  )
}
