import { Box, Group, Menu, Popover, Stack, Text, TextInput, Title, rem } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react'
import { BlockInfo } from '@api/linguflow.schemas'
import { nanoid } from 'nanoid'
import { Node, useReactFlow } from 'reactflow'
import { useDisclosure, useHover } from '@mantine/hooks'
import { DIR_SORTS, useBlockSchema } from '../useSchema'
import { BLOCK_NODE_NAME, BlockNodeProps } from '../Block'
import { ROBlock } from '../Block/ROBlock'
import { useContainerElem } from './useContainerElem'

export const HotKeyMenu: React.FC<{
  opened: boolean
  setOpened: (opened: boolean) => void
  menuPosition: number[]
  onCreateBlock: (node: Node<BlockNodeProps>) => void
}> = ({ opened, setOpened, menuPosition, onCreateBlock }) => {
  const { screenToFlowPosition } = useReactFlow()
  const { blocks, blocksByDir } = useBlockSchema()
  const dirAndBlocks = useMemo(
    () => Object.entries(blocksByDir).sort(([dirA], [dirB]) => DIR_SORTS.indexOf(dirA) - DIR_SORTS.indexOf(dirB)),
    [blocksByDir]
  )
  const [search, setSearch] = useState('')
  const searchedBlocks = useMemo(
    () => blocks.filter((b) => b.alias.toLowerCase().includes(search.trim())).slice(0, 6),
    [blocks, search]
  )
  const containerElem = useContainerElem()
  const handleClickBlock = (b: BlockInfo) => {
    const newId = nanoid()
    const reactflowBounds = containerElem.getBoundingClientRect()
    const position = screenToFlowPosition({
      x: menuPosition[0] - reactflowBounds.left,
      y: menuPosition[1] - reactflowBounds.top
    })
    const newNode: Node<BlockNodeProps> = {
      id: newId,
      type: BLOCK_NODE_NAME,
      position,
      data: {
        schema: b,
        node: {
          id: newId,
          name: b.name
        }
      }
    }
    onCreateBlock(newNode)
  }

  useEffect(() => {
    opened && setSearch('')
  }, [opened])

  return (
    <Menu width={200} opened={opened} onChange={setOpened} position="bottom-start" trapFocus={false} shadow="sm">
      <Menu.Target>
        <Box style={{ position: 'fixed', zIndex: 99999, left: menuPosition[0], top: menuPosition[1] }}></Box>
      </Menu.Target>
      <Menu.Dropdown>
        <TextInput
          px="sm"
          autoFocus
          variant="unstyled"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        {(!search || !!searchedBlocks.length) && <Menu.Divider />}

        {!!search && searchedBlocks.map((b) => <BlockItem key={b.name} block={b} onClick={handleClickBlock} />)}
        {!search &&
          dirAndBlocks.map(([dir, blocks]) => (
            <Menu
              key={dir}
              width={200}
              trigger="click-hover"
              position="right-start"
              trapFocus={false}
              transitionProps={{ exitDuration: 0 }}
              shadow="sm"
            >
              <Menu.Target>
                <Menu.Item rightSection={<IconChevronRight style={{ width: rem(14), height: rem(14) }} />}>
                  {dir.toUpperCase()}
                </Menu.Item>
              </Menu.Target>
              <Menu.Dropdown>
                {blocks.map((b) => (
                  <BlockItem key={b.name} block={b} onClick={handleClickBlock} />
                ))}
              </Menu.Dropdown>
            </Menu>
          ))}
      </Menu.Dropdown>
    </Menu>
  )
}

const BlockItem: React.FC<{ block: BlockInfo; onClick: (b: BlockInfo) => void }> = ({ block, onClick }) => {
  const [inItem, setInItem] = useState(false)
  const [opened, { close, open }] = useDisclosure(false)
  const { hovered, ref } = useHover()
  const timerRef: MutableRefObject<number | null> = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current as any as number)
    if (!hovered && !inItem) {
      timerRef.current = setTimeout(() => {
        close()
      }, 100) as any as number
    }
  }, [hovered, inItem, close])

  return (
    <Popover
      opened={opened}
      position="right-end"
      offset={{ mainAxis: 8, crossAxis: 4 }}
      shadow="sm"
      withinPortal={false}
    >
      <Popover.Target>
        <Menu.Item
          onClick={() => onClick(block)}
          onMouseEnter={() => {
            setInItem(true)
            open()
          }}
          onMouseLeave={() => setInItem(false)}
        >
          {block.alias}
        </Menu.Item>
      </Popover.Target>
      <Popover.Dropdown>
        <Group align="flex-start">
          <Stack gap="xs" justify="flex-start" maw="300px">
            {block.description && (
              <>
                <Title order={5}>Description</Title>
                <Text>{block.description}</Text>
              </>
            )}
            {block.examples && (
              <>
                <Title order={5}>Example</Title>
                <Text>{block.examples}</Text>
              </>
            )}
          </Stack>
          {/* <Box ref={ref}>123 {hovered.toString()}</Box> */}
          <ROBlock schema={block} node={{} as any} onClick={() => onClick(block)} />
        </Group>
      </Popover.Dropdown>
    </Popover>
  )
}
