import { Box, Menu, TextInput, rem } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { BlockInfo } from '@api/linguflow.schemas'
import { DIR_SORTS, useBlockSchema } from '../useSchema'

export const HotKeyMenu: React.FC<{
  opened: boolean
  setOpened: (opened: boolean) => void
  menuPosition: number[]
}> = ({ opened, setOpened, menuPosition }) => {
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
  const handleClickBlock = (b: BlockInfo) => {
    console.log(b)
  }

  useEffect(() => {
    opened && setSearch('')
  }, [opened])

  return (
    <Menu width={200} opened={opened} onChange={setOpened} position="bottom-start" trapFocus={false}>
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
