import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Input,
  Loader,
  Menu,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { IconDots, IconEdit, IconSearch, IconTrash } from '@tabler/icons-react'
import { useParams } from 'react-router-dom'
import { useListAppVersionsApplicationsApplicationIdVersionsGet } from '@api/linguflow'
import { Footer } from '../../components/Layout/Footer'
import { Pagination } from '../../components/Pagination'

import classes from './index.module.css'

export const VersionList: React.FC = () => {
  const { appId } = useParams()
  const { data } = useListAppVersionsApplicationsApplicationIdVersionsGet(appId!)
  const havePublished = false
  const isLoading = false

  return (
    <>
      <Stack mih="100vh" gap={0} align="stretch">
        <Container size="lg" py={30} w="100%">
          <Stack>
            <Group justify="space-between">
              <Title order={2} w="80%" lineClamp={1}>
                App Name
              </Title>

              <Button color="dark">
                <Text visibleFrom="sm">Edit the latest</Text>
                <Box hiddenFrom="sm">
                  <IconEdit size={16} />
                </Box>
              </Button>
            </Group>

            <Stack gap={0}>
              <Text c="gray.7" fz="sm" maw="60%" truncate>
                {havePublished ? (
                  <Text>
                    Published ver. <Anchor>v_2024_01_18_1234</Anchor>
                  </Text>
                ) : (
                  'No published version'
                )}
              </Text>
              {havePublished && (
                <Text c="gray.6" fz="sm" maw="60%" truncate>
                  Dec 4, 2023 at 2:58 PM (a month ago)
                </Text>
              )}
            </Stack>
          </Stack>
        </Container>

        <Divider color="gray.3" />

        <Container size="lg" py="xl" w="100%">
          <Stack>
            <Group justify="space-between">
              <Input
                className={classes.search_input}
                leftSection={isLoading ? <Loader color="gray" size={14} /> : <IconSearch size={16} />}
                placeholder="Search versions"
              />
            </Group>

            <List havePublished={havePublished} />

            {/* <Pagination /> */}
          </Stack>
        </Container>
      </Stack>

      <Footer />
    </>
  )
}

const List: React.FC<{ havePublished: boolean }> = ({ havePublished }) => {
  return (
    <Card withBorder p={0}>
      {Array(12)
        .fill(0)
        .map((v, i) => (
          <>
            <Group p="md" justify="space-between">
              <Stack gap={4} maw="60%">
                <Group>
                  <Title order={5} style={{ cursor: 'pointer' }} maw="90%" lineClamp={1}>
                    Version Name
                  </Title>
                  {i === 2 && havePublished && (
                    <Badge color="green" radius="sm" variant="filled">
                      Published
                    </Badge>
                  )}
                </Group>
                <Text c="gray.7" fz="sm" truncate>
                  Long long long long description.
                </Text>
              </Stack>

              <Group>
                <Stack gap={4} align="flex-end" c="gray.7" fz="sm">
                  <Text>Dec 4, 2023 at 2:58 PM (a month ago)</Text>
                  <Text>by Suhaha</Text>
                </Stack>
                <Menu shadow="md" width={140} withinPortal position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm" onClick={(e) => e.stopPropagation()}>
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                    <Menu.Item leftSection={<IconEdit size={14} />}>Edit</Menu.Item>
                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} disabled={i === 2 && havePublished}>
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            {i !== 11 && <Divider color="gray.3" />}
          </>
        ))}
    </Card>
  )
}
