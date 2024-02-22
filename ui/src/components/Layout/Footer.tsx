import { Box, Button, Container, Group, Stack } from '@mantine/core'

export const Footer: React.FC = () => {
  return (
    <Container size="lg" py="lg">
      <Stack gap="xs">
        <Box>© 2024 LinguFlow</Box>
        <Group mx="-xs" gap="xs">
          <Button variant="subtle" size="compact-lg" color="dark">
            Docs
          </Button>
          <Button variant="subtle" size="compact-lg" color="dark">
            GitHub
          </Button>
        </Group>
      </Stack>
    </Container>
  )
}
