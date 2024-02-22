import {
  ActionIcon,
  Box,
  Button,
  Container,
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
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { useListAppApplicationsGet } from '@api/linguflow'
import { ApplicationInfo } from '@api/linguflow.schemas'
import { useMemo } from 'react'
import dayjs from 'dayjs'
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
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Modal opened={opened} onClose={close} title={<Title order={5}>New Application</Title>} centered>
        <TextInput label="Name" placeholder="Please input the application name" />

        <Group mt="xl" justify="end">
          <Button variant="default">Cancel</Button>
          <Button color="dark">Confirm</Button>
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
  const createdAt = useMemo(() => dayjs.unix(app.created_at).format('MMM D, YYYY'), [app])
  const timeFromNow = useMemo(() => dayjs.unix(app.created_at).fromNow(), [app])

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: <Title order={5}>Delete {app.name}</Title>,
      labels: { confirm: 'I understand, delete it.', cancel: 'Cancel' },
      confirmProps: {
        color: 'dark'
      },
      children: (
        <Text size="sm">
          Deleting the application may cause online malfunctions. Confirm to delete the application?
        </Text>
      ),
      centered: true,
      size: 'lg'
    })

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

          <Menu shadow="md" width={140} withinPortal position="bottom-start">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => e.stopPropagation()}>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Label>Application</Menu.Label>
              <Menu.Item leftSection={<IconHistory size={14} />}>Version list</Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={openDeleteModal}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Stack gap={0}>
          <Text c="gray.6" fz="sm" truncate>
            Owned by Default User
          </Text>
          <Text c="gray.6" fz="sm" truncate>
            Created at {createdAt} ({timeFromNow})
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}
