import { Avatar, Stack, Text } from '@mantine/core'
import { IconBox } from '@tabler/icons-react'

export const NoResult: React.FC = () => {
  return (
    <Stack align="center">
      <Avatar size="lg" radius="sm">
        <IconBox size="1.8rem" />
      </Avatar>
      <Text c="gray.7" fz="sm">
        No Result.
      </Text>
    </Stack>
  )
}
