import { ActionIcon, Box, Code, CopyButton, Group, HoverCard, ScrollArea, Stack, Text, Tooltip } from '@mantine/core'
import { IconBug, IconCheck, IconCopy } from '@tabler/icons-react'
import { useMemo } from 'react'
import type { DisplayedInteraction } from '.'

export const DebugInfo: React.FC<{ data: DisplayedInteraction }> = ({ data: { interaction, isError } }) => {
  const interactionStr = useMemo(
    () => (typeof interaction !== 'string' ? JSON.stringify(interaction) : interaction),
    [interaction]
  )

  return (
    <HoverCard width="target" offset={16} withinPortal openDelay={500} closeDelay={500}>
      <HoverCard.Target>
        <Box
          p="sm"
          maw={500}
          style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}
          bg={isError ? 'red.0' : 'green.0'}
        >
          <IconBug size="1.2rem" />
          <Text span style={{ verticalAlign: 'text-bottom' }} ml="xs">
            {interactionStr}
          </Text>
        </Box>
      </HoverCard.Target>
      <HoverCard.Dropdown miw="400" onDoubleClick={(e) => e.stopPropagation()}>
        <Stack gap="xs">
          <Group justify="flex-end">
            <CopyButton value={interactionStr} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Code block>
            <ScrollArea h={260} fz="xs">
              {interactionStr}
            </ScrollArea>
          </Code>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
