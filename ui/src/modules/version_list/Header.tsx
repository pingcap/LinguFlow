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
  Overlay,
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
  rem,
  useMantineTheme
} from '@mantine/core'
import { IconCheck, IconChevronUp, IconCirclesRelation, IconCopy, IconEdit } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApplicationInfo, ApplicationVersionInfo } from '@api/linguflow.schemas'
import { getDateTime } from './utils'
import { ConnectionGuidance } from './ConnectionGuidance'

export interface VersionListHeaderProps {
  app?: ApplicationInfo
  versions?: ApplicationVersionInfo[]
  appLoading: boolean
  isPublishing: boolean
}

export const VersionListHeader: React.FC<VersionListHeaderProps> = ({ app, versions, appLoading, isPublishing }) => {
  const navigate = useNavigate()
  const { colors } = useMantineTheme()
  const updatedAt = useMemo(() => getDateTime(app?.updated_at), [app])
  const [showGuidance, setShowGuidance] = useState(false)

  return (
    <>
      <Divider color="gray.3" />
      <Card shadow="sm" p={0}>
        <Container size="lg" py={30} w="100%" pos="relative">
          <Stack>
            <Group justify="space-between">
              <Skeleton w="80%" component="span" visible={appLoading}>
                <Group gap="xs" wrap="nowrap">
                  <Title maw="70%" order={2} lineClamp={1}>
                    {app?.name || 'Default App'}
                  </Title>
                  <Group maw="30%" gap={0}>
                    <Text fz="xs">(App ID: </Text>
                    <Text span fz="xs" maw="55%" lineClamp={1} style={{ fontFamily: 'monospace' }}>
                      {app?.id}
                    </Text>
                    <Text fz="xs">)</Text>
                    <CopyButton value={app?.id || ''} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy App ID'} withArrow position="right">
                          <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                            {copied ? (
                              <IconCheck style={{ width: rem(16) }} />
                            ) : (
                              <IconCopy style={{ width: rem(16) }} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </Group>
              </Skeleton>

              <Button
                color="dark"
                disabled={appLoading}
                onClick={() => navigate(!versions?.length ? './ver' : `./ver/${versions[0].id}`)}
              >
                <Text visibleFrom="sm">{!versions?.length ? 'Create' : 'Edit latest version'}</Text>
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
                      {isPublishing ? (
                        'Publishing...'
                      ) : (
                        <>
                          Published ver.
                          <Anchor component={Link} to={`./ver/${app.active_version}`}>
                            <Badge color="blue" radius="sm" variant="light" style={{ textTransform: 'none' }}>
                              {app.active_version}
                            </Badge>
                          </Anchor>
                        </>
                      )}
                    </Group>
                  ) : isPublishing ? (
                    'Publishing...'
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
                onClick={() => setShowGuidance((v) => !v)}
              >
                <Box w="20px" h="20px">
                  {showGuidance ? (
                    <IconChevronUp style={{ width: '100%', height: '100%', color: colors.gray[7] }} stroke={1} />
                  ) : (
                    <IconCirclesRelation style={{ width: '100%', height: '100%', color: colors.gray[7] }} stroke={1} />
                  )}
                </Box>
                <Text size="sm" c="gray.7">
                  Connect App
                </Text>
              </Group>
            )}
            {showGuidance && (
              <Box pos="fixed" left={0} top={0} h="100%" w="100%" style={{ pointerEvents: 'none' }}>
                <Box
                  pos="absolute"
                  top={210}
                  h="calc(100% - 210px)"
                  w="100%"
                  style={{ pointerEvents: 'auto', zIndex: 999999 }}
                >
                  <Overlay backgroundOpacity={0.01} blur={5} />
                </Box>
                <Card
                  pos="absolute"
                  top={210}
                  radius={0}
                  h="60%"
                  w="100%"
                  style={{ overflow: 'auto', zIndex: 9999999, pointerEvents: 'auto' }}
                >
                  <Container size="lg" py={30} w="100%">
                    <ConnectionGuidance />
                  </Container>
                </Card>
              </Box>
            )}
          </Stack>
        </Container>
      </Card>
    </>
  )
}
