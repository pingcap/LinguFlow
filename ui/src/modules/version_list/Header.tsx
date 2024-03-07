import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  CopyButton,
  Divider,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
  rem,
  useMantineTheme
} from '@mantine/core'
import { IconCheck, IconChevronUp, IconCirclesRelation, IconCopy, IconEdit } from '@tabler/icons-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApplicationInfo, ApplicationVersionInfo } from '@api/linguflow.schemas'
import { getDateTime } from './utils'
import { ConnectionGuidance } from './ConnectionGuidance'

export interface VersionListHeaderProps {
  app?: ApplicationInfo
  versions?: ApplicationVersionInfo[]
  appLoading?: boolean
}

export const VersionListHeader: React.FC<VersionListHeaderProps> = ({ app, versions, appLoading }) => {
  const navigate = useNavigate()
  const { colors } = useMantineTheme()
  const updatedAt = useMemo(() => getDateTime(app?.updated_at), [app])

  return (
    <>
      <Divider color="gray.3" />
      <Card shadow="sm" p={0}>
        <Container size="lg" py={30} w="100%" style={{ position: 'relative' }}>
          <Stack>
            <Group justify="space-between">
              <Skeleton w="80%" component="span" visible={appLoading}>
                <Group gap="xs" wrap="nowrap">
                  <Title maw="80%" order={2} lineClamp={1}>
                    {app?.name || 'Default App'}
                  </Title>
                  <CopyButton value={app?.id || ''} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy App ID'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                          {copied ? <IconCheck style={{ width: rem(16) }} /> : <IconCopy style={{ width: rem(16) }} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Skeleton>

              <Button
                color="dark"
                disabled={appLoading}
                onClick={() => navigate(!versions?.length ? './ver' : `./ver/${versions[0].id}`)}
              >
                <Text visibleFrom="sm">{!versions?.length ? 'Create' : 'Edit the latest'}</Text>
                <Box hiddenFrom="sm">
                  <IconEdit size={16} />
                </Box>
              </Button>
            </Group>

            <Skeleton w="60%" component="span" visible={appLoading}>
              <Stack gap={4}>
                <Text c="gray.7" fz="sm" truncate>
                  {app?.active_version ? (
                    <Group gap="xs">
                      Published ver.
                      <Anchor component={Link} to={`./ver/${app.active_version}`}>
                        <Badge color="blue" radius="sm" variant="light">
                          {app.active_version}
                        </Badge>
                      </Anchor>
                    </Group>
                  ) : (
                    'No published version'
                  )}
                </Text>
                {!!app?.active_version && (
                  <Text c="gray.6" fz="sm" truncate>
                    Published at {updatedAt}
                  </Text>
                )}
              </Stack>
            </Skeleton>
            {!!app?.active_version && (
              <Group
                px="sm"
                pt="xs"
                w="140px"
                gap={8}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <Box w="20px" h="20px">
                  {/* <IconChevronUp style={{ width: '100%', height: '100%', color: colors.gray[7] }} stroke={1} /> */}
                  <IconCirclesRelation style={{ width: '100%', height: '100%', color: colors.gray[7] }} stroke={1} />
                </Box>
                <Text size="sm" c="gray.7">
                  Connect App
                </Text>
              </Group>
            )}
            {/* <ConnectionGuidance /> */}
          </Stack>
        </Container>
      </Card>
    </>
  )
}
