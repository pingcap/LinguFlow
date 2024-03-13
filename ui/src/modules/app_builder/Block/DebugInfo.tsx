import { ActionIcon, Box, Code, CopyButton, Group, HoverCard, ScrollArea, Stack, Text, Tooltip } from '@mantine/core'
import { IconBug, IconCheck, IconCopy } from '@tabler/icons-react'

export const DebugInfo: React.FC<{ data: string }> = ({ data }) => {
  return (
    <HoverCard width={500} withinPortal openDelay={500}>
      <HoverCard.Target>
        <Box
          p="sm"
          maw={300}
          style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}
          bg="green.0"
        >
          <IconBug size="1.2rem" />
          <Text span style={{ verticalAlign: 'text-bottom' }} ml="xs">
            {data}
          </Text>
        </Box>
      </HoverCard.Target>
      <HoverCard.Dropdown onDoubleClick={(e) => e.stopPropagation()}>
        <Stack gap="xs">
          <Group justify="flex-end">
            <CopyButton value={data} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                    {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <ScrollArea mah={300} fz="xs">
            <Code block>{data}</Code>
          </ScrollArea>
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
