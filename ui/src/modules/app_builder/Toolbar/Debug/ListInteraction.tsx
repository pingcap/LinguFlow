import { ActionIcon, Box, Button, Card, FocusTrap, Group, Stack, Text, Textarea, Tooltip } from '@mantine/core'
import { IconCircleX, IconSwitchHorizontal } from '@tabler/icons-react'
import { getHotkeyHandler, useClickOutside, useDisclosure } from '@mantine/hooks'
import { useEffect, useMemo, useState } from 'react'
import { InteractionInfo } from '@api/linguflow.schemas'
import type { InteractionProps } from '.'

export const ListIntercation: React.FC<InteractionProps<string[]>> = ({
  value = [],
  onChange,
  onSubmit,
  interactions
}) => {
  const [showAddInput, { open, close }] = useDisclosure(false)
  const handleChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!e.target.value) {
      return
    }
    onChange([...value, e.target.value])
    close()
  }
  const [showChat, _setShowChat] = useState(false)
  const handleSetShowChat = (v: React.SetStateAction<boolean>) => {
    onChange([])
    _setShowChat(v)
  }
  const handleAddChat = (t: string) => {
    onChange([...value, t])
  }

  return (
    <Group align="flex-start" style={{ flexWrap: 'nowrap' }}>
      <Tooltip label={showChat ? 'Switch to list mode' : 'Switch to chat mode'}>
        <ActionIcon
          pos="sticky"
          top={0}
          left={0}
          style={{ zIndex: 99 }}
          variant="subtle"
          color="gray"
          aria-label="Switch"
          onClick={() => handleSetShowChat((v) => !v)}
        >
          <IconSwitchHorizontal style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
      <Stack style={{ flexGrow: 1 }}>
        {showChat ? (
          <ListChat interactions={interactions} value={value} onChange={handleAddChat} onSubmit={onSubmit} />
        ) : (
          <>
            {value?.map((item, index) => (
              <ListItem
                key={index}
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
                  onBlur={handleChange}
                  onKeyDown={getHotkeyHandler([['Enter', handleChange]])}
                />
              </FocusTrap>
            )}
            {!showAddInput && (
              <Button variant="default" onClick={open} style={{ borderStyle: 'dashed' }}>
                Add
              </Button>
            )}
          </>
        )}
      </Stack>
    </Group>
  )
}

const ListItem: React.FC<{ data: string; onDelete: () => void; onEdit: (v: string) => void }> = ({
  data,
  onDelete,
  onEdit
}) => {
  const [isEdit, { open, close }] = useDisclosure(false)
  const handleSubmit = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!e.target.value) {
      return
    }
    onEdit(e.target.value)
    close()
  }

  return !isEdit ? (
    <Card p="xs" style={{ position: 'relative', cursor: 'pointer' }} withBorder shadow="xs" onClick={open}>
      <Text>{data}</Text>
      <ActionIcon
        variant="subtle"
        color="gray"
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
      <Textarea size="xs" autosize onBlur={handleSubmit} onKeyDown={getHotkeyHandler([['Enter', handleSubmit]])} />
    </FocusTrap>
  )
}

const ListChat: React.FC<{
  value: string[]
  interactions?: InteractionInfo[]
  onChange: (t: string) => void
  onSubmit: () => void
}> = ({ value, interactions = [], onChange, onSubmit }) => {
  const [chatInput, setChatInput] = useState('')
  useEffect(() => {
    if (!value.length) {
      return
    }
    onChange(interactions[interactions.length - 1].output!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactions])
  const chatItems = useMemo(() => {
    const items = [...value]
    items.reverse()
    return items
  }, [value])
  const outsideRef = useClickOutside(() => {
    if (!chatInput) {
      return
    }
    onChange(chatInput)
    setChatInput('')
  })

  return (
    <Stack ref={outsideRef} pos="relative" maw="100%">
      <Box pos="sticky" top={0} left={0} style={{ zIndex: 99 }}>
        <Textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.currentTarget.value)}
          onKeyDown={getHotkeyHandler([
            [
              'Enter',
              (e: React.FocusEvent<HTMLTextAreaElement>) => {
                if (!e.target.value) {
                  return
                }
                onChange(e.target.value)
                setChatInput('')
                setTimeout(() => {
                  onSubmit()
                }, 500)
              }
            ]
          ])}
        />
      </Box>
      <Stack>
        {chatItems.map((v, i) =>
          (chatItems.length - i) % 2 === 0 ? <AssistantMessage key={i} msg={v} /> : <UserMessage key={i} msg={v} />
        )}
      </Stack>
    </Stack>
  )
}

const UserMessage: React.FC<{ msg: string }> = ({ msg }) => {
  return (
    <Card
      maw="95%"
      px="md"
      py="xs"
      fz="sm"
      bg="blue.0"
      c="gray.8"
      shadow="none"
      style={{
        flexShrink: 0,
        alignSelf: 'end',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}
      withBorder={false}
    >
      {msg}
    </Card>
  )
}

const AssistantMessage: React.FC<{ msg: string }> = ({ msg }) => {
  return (
    <Card
      maw="95%"
      px="md"
      py="xs"
      fz="sm"
      bg="gray.1"
      c="gray.8"
      shadow="none"
      style={{
        position: 'relative',
        flexShrink: 0,
        alignSelf: 'start',
        overflow: 'visible',
        wordBreak: 'break-word'
      }}
      withBorder={false}
    >
      {msg}
    </Card>
  )
}
