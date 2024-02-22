import {
  ActionIcon,
  Box,
  Button,
  Code,
  Container,
  FocusTrap,
  Group,
  Input,
  Loader,
  Menu,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core'
import { IconDots, IconHistory, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { getHotkeyHandler, useDisclosure } from '@mantine/hooks'
import {
  getListAppApplicationsGetQueryKey,
  useCreateAppApplicationsPost,
  useDeleteAppApplicationsApplicationIdDelete,
  useListAppApplicationsGet
} from '@api/linguflow'
import { ApplicationInfo } from '@api/linguflow.schemas'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useQueryClient } from 'react-query'
import { Card, LoadingCard } from '../../components/Card'
import { Footer } from '../../components/Layout/Footer'
import { Pagination } from '../../components/Pagination'

import classes from './index.module.css'

export const AppList: React.FC = () => {
  const { data, isLoading } = useListAppApplicationsGet()

  return (
    <>
      <Container size="lg" py="lg">
        <Stack mih="100vh" gap="lg">
          <Group justify="space-between">
            <Input
              className={classes.search_input}
              leftSection={isLoading ? <Loader color="gray" size={14} /> : <IconSearch size={16} />}
              placeholder="Search applications"
              disabled={isLoading}
            />
            <NewAppButton />
          </Group>

          <SimpleGrid cols={{ lg: 3, md: 2, sm: 1 }} spacing={{ lg: 'lg', md: 'md', sm: 'sm' }}>
            {isLoading
              ? Array(12)
                  .fill(0)
                  .map(() => <LoadingCard />)
              : data?.applications.map((app) => <AppCard app={app} />)}
          </SimpleGrid>

          {!isLoading && (data?.applications.length || 0) > 12 && <Pagination />}
        </Stack>
      </Container>
      <Footer />
    </>
  )
}

const NewAppButton: React.FC = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isLoading } = useCreateAppApplicationsPost({
    mutation: {
      onSuccess: () => queryClient.fetchQuery({ queryKey: getListAppApplicationsGetQueryKey() })
    }
  })
  const [opened, { open, close }] = useDisclosure(false)
  const [name, setName] = useState('')
  const onClose = () => {
    setName('')
    close()
  }
  const handleCreate = async () => {
    if (isLoading || !opened || !name) {
      return
    }
    await mutateAsync({ data: { name } })
    onClose()
  }

  return (
    <>
      <Modal
        closeOnClickOutside={!isLoading}
        closeOnEscape={!isLoading}
        withCloseButton={!isLoading}
        opened={opened}
        onClose={onClose}
        title={<Title order={5}>New Application</Title>}
        centered
        trapFocus={false}
      >
        <FocusTrap active={opened}>
          <TextInput
            label="Name"
            placeholder="Please input the application name"
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value)
            }}
            onKeyDown={getHotkeyHandler([['Enter', handleCreate]])}
          />
        </FocusTrap>

        <Group mt="xl" justify="end">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button color="dark" loading={isLoading} disabled={!name} onClick={handleCreate}>
            Confirm
          </Button>
        </Group>
      </Modal>

      <Button
        leftSection={
          <Box visibleFrom="sm">
            <IconPlus size={16} />
          </Box>
        }
        color="dark"
        onClick={open}
      >
        <Text visibleFrom="sm">Add New App</Text>
        <Box hiddenFrom="sm">
          <IconPlus size={16} />
        </Box>
      </Button>
    </>
  )
}

const AppCard: React.FC<{ app: ApplicationInfo }> = ({ app }) => {
  const createdAt = useMemo(() => {
    const isLargeThan22h = dayjs().diff(dayjs.unix(app.created_at), 'hour') > 22
    const timeFromNow = dayjs.unix(app.created_at).fromNow()
    return isLargeThan22h
      ? `Created at ${dayjs.unix(app.created_at).format('MMM D, YYYY')} (${timeFromNow})`
      : `Created ${timeFromNow}`
  }, [app])

  return (
    <Card>
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

          <Menu shadow="md" width={140} withinPortal position="bottom-start" keepMounted>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => e.stopPropagation()}>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Label>Application</Menu.Label>
              <Menu.Item leftSection={<IconHistory size={14} />}>Edit Name</Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>
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
          <Button variant="default" onClick={close}>
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

      <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={open}>
        Delete
      </Menu.Item>
    </>
  )
}
