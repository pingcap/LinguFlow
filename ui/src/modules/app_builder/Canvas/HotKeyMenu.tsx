import { Box, Menu, TextInput, rem } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { BlockInfo } from '@api/linguflow.schemas'
import { nanoid } from 'nanoid'
import { Node, useReactFlow } from 'reactflow'
import { DIR_SORTS, useBlockSchema } from '../useSchema'
import { BLOCK_NODE_NAME, BlockNodeProps } from '../Block'
import { useContainerElem } from './useContainerElem'

export const HotKeyMenu: React.FC<{
  opened: boolean
  setOpened: (opened: boolean) => void
  menuPosition: number[]
  onCreateBlock: (node: Node<BlockNodeProps>) => void
}> = ({ opened, setOpened, menuPosition, onCreateBlock }) => {
  const { project } = useReactFlow()
  const { blocks, blocksByDir } = useBlockSchema()
  const dirAndBlocks = useMemo(
    () => Object.entries(blocksByDir).sort(([dirA], [dirB]) => DIR_SORTS.indexOf(dirA) - DIR_SORTS.indexOf(dirB)),
    [blocksByDir]
  )
  const [search, setSearch] = useState('')
  const searchedBlocks = useMemo(
    () => blocks.filter((b) => b.alias.toLowerCase().includes(search)).slice(0, 6),
    [blocks, search]
  )
  const containerElem = useContainerElem()
  const handleClickBlock = (b: BlockInfo) => {
    const newId = nanoid()
    const reactflowBounds = containerElem.getBoundingClientRect()
    const position = project({
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
          variant="unstyled"
          placeholder="Search..."
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        {(!search || !!searchedBlocks.length) && <Menu.Divider />}

        {!!search && searchedBlocks.map((b) => <Menu.Item onClick={() => handleClickBlock(b)}>{b.alias}</Menu.Item>)}
        {!search &&
          dirAndBlocks.map(([dir, blocks]) => (
            <Menu
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
                  <Menu.Item onClick={() => handleClickBlock(b)}>{b.alias}</Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          ))}
      </Menu.Dropdown>
    </Menu>
  )
}
