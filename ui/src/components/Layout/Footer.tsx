import { Anchor, Box, Button, Container, Group, Stack } from '@mantine/core'

export const Footer: React.FC = () => {
  return (
    <Container size="lg" py="lg">
      <Stack gap="xs">
        <Box>© 2024 LinguFlow</Box>
        <Group mx="-xs" gap="xs">
          <Anchor href="https://github.com/pingcap/LinguFlow" target="_blank">
            <Button variant="subtle" size="compact-lg" color="dark">
              Docs
            </Button>
          </Anchor>
          <Anchor href="https://github.com/pingcap/LinguFlow" target="_blank">
            <Button variant="subtle" size="compact-lg" color="dark">
              GitHub
            </Button>
          </Anchor>
        </Group>
      </Stack>
    </Container>
  )
}
