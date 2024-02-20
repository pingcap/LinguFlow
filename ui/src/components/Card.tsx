import { Card, Skeleton } from '@mantine/core'

const CustomCard = (({ children, ...props }: React.PropsWithChildren) => {
  return (
    <Card
      h="150px"
      padding="lg"
      radius="md"
      withBorder
      style={(theme) => ({
        cursor: 'pointer',
        ':hover': {
          boxShadow: theme.shadows.md
        },
        transitionProperty: 'all',
        transitionDuration: '.3s',
        transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)'
      })}
      {...props}
    >
      {children}
    </Card>
  )
}) as typeof Card

const LoadingCard: React.FC = () => {
  return (
    <Skeleton>
      <CustomCard />
    </Skeleton>
  )
}

export { CustomCard as Card, LoadingCard }
