import { ActionIcon, Button, Card, FocusTrap, Stack, Text, Textarea } from '@mantine/core'
import { IconCircleX } from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import type { InteractionProps } from '.'

export const ListIntercation: React.FC<InteractionProps<string[]>> = ({ value = [], onChange }) => {
  const [showAddInput, { open, close }] = useDisclosure(false)
  return (
    <Stack>
      {value?.map((item, index) => (
        <ListItem
          data={item}
          onDelete={() => onChange(value.filter((_, _index) => index !== _index))}
          onEdit={(v) => onChange([...value.slice(0, index), v, ...value.slice(index + 1)])}
        />
      ))}
      {showAddInput && (
        <FocusTrap active>
          <Textarea
            size="xs"
            autosize
            onBlur={(e) => {
              if (!e.target.value) {
                return
              }
              onChange([...value, e.target.value])
              close()
            }}
          />
        </FocusTrap>
      )}
      {!showAddInput && (
        <Button variant="default" onClick={open} style={{ borderStyle: 'dashed' }}>
          Add
        </Button>
      )}
    </Stack>
  )
}

const ListItem: React.FC<{ data: string; onDelete: () => void; onEdit: (v: string) => void }> = ({
  data,
  onDelete,
  onEdit
}) => {
  const [isEdit, { open, close }] = useDisclosure(false)
  return !isEdit ? (
    <Card p="xs" style={{ position: 'relative', cursor: 'pointer' }} withBorder shadow="xs" onClick={open}>
      <Text>{data}</Text>
      <ActionIcon
        style={{ position: 'absolute', right: 10, top: 10 }}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <IconCircleX size="1rem" />
      </ActionIcon>
    </Card>
  ) : (
    <FocusTrap active>
      <Textarea
        size="xs"
        autosize
        onBlur={(e) => {
          if (!e.target.value) {
            return
          }
          onEdit(e.target.value)
          close()
        }}
      />
    </FocusTrap>
  )
}
