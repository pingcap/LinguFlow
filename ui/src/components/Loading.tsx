import { Box, Loader, Skeleton } from '@mantine/core'

export const Loading: React.FC = () => {
  return (
    <Box>
      <Skeleton>
        <Box w="100vw" h="100vh"></Box>
      </Skeleton>
      <Box style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 99 }}>
        <Loader color="gray.5" type="dots" />
      </Box>
    </Box>
  )
}
