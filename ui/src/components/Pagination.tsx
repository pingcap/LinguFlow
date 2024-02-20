import { Button, Group, Text } from '@mantine/core'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'

export const Pagination: React.FC = () => {
  return (
    <Group justify="center">
      <Button leftSection={<IconArrowLeft size={16} />} variant="light" color="gray" disabled>
        Prev
      </Button>
      <Text>Page 1 of 3</Text>
      <Button rightSection={<IconArrowRight size={16} />} variant="light" color="gray">
        Next
      </Button>
    </Group>
  )
}
