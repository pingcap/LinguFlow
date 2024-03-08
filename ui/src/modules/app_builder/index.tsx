import { ActionIcon, Box, Group, Menu, rem, useMantineTheme } from '@mantine/core'
import {
  IconBug,
  IconChevronLeft,
  IconDeviceFloppy,
  IconDownload,
  IconMenu2,
  IconRocket,
  IconUpload
} from '@tabler/icons-react'
import React, { useState } from 'react'

import 'reactflow/dist/style.css'
import { useGetAppApplicationsApplicationIdGet } from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import { useHotkeys } from '@mantine/hooks'
import classes from './index.module.css'
import { BuilderCanvas } from './Canvas'

const TOOLBAR_HEIGHT = 30

const AppBuilder: React.FC = () => {
  const { appId, verId } = useParams()
  const { data: appData } = useGetAppApplicationsApplicationIdGet(appId!)

  const [menuOpened, setMenuOpened] = useState(false)

  useHotkeys([
    [
      'mod+S',
      (e) => {
        e.preventDefault()
        console.log('save')
      }
    ]
  ])

  return (
    <Box w="100vw" h="100vh">
      <BuilderMenu opened={menuOpened} setOpened={setMenuOpened} />
      <Box w="100%" h={`calc(100% - ${TOOLBAR_HEIGHT}px)`}>
        <BuilderCanvas onClick={() => setMenuOpened(false)} />
        <Toolbar />
      </Box>
    </Box>
  )
}

const BuilderMenu: React.FC<{ opened: boolean; setOpened: React.Dispatch<React.SetStateAction<boolean>> }> = ({
  opened,
  setOpened
}) => {
  const navigate = useNavigate()

  return (
    <ActionIcon.Group style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 999 }}>
      <ActionIcon variant="default" aria-label="Go Back" size="lg" onClick={() => navigate(-1)}>
        <IconChevronLeft style={{ width: '60%', height: '60%', color: '#000' }} stroke={1.5} />
      </ActionIcon>

      <Menu shadow="md" width={140} position="bottom-start" opened={opened} onChange={setOpened}>
        <Menu.Target>
          <ActionIcon variant="default" aria-label="Menu" size="lg">
            <IconMenu2 style={{ width: '60%', height: '60%', color: '#000' }} stroke={1.5} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item leftSection={<IconDeviceFloppy style={{ width: rem(14), height: rem(14) }} />}>Save</Menu.Item>
          <Menu.Item leftSection={<IconRocket style={{ width: rem(14), height: rem(14) }} />}>Publish</Menu.Item>

          <Menu.Divider />

          <Menu.Item leftSection={<IconUpload style={{ width: rem(14), height: rem(14) }} />}>Import</Menu.Item>
          <Menu.Item leftSection={<IconDownload style={{ width: rem(14), height: rem(14) }} />}>Export</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </ActionIcon.Group>
  )
}

const Toolbar: React.FC = () => {
  return (
    <Group
      justify="space-between"
      h={TOOLBAR_HEIGHT}
      style={(theme) => ({ borderTop: `1px solid ${theme.colors.gray[1]}` })}
    >
      <ToolbarButton />
    </Group>
  )
}

const ToolbarButton: React.FC = () => {
  const { colors } = useMantineTheme()
  return (
    <Group
      justify="center"
      align="center"
      p={4}
      w={TOOLBAR_HEIGHT}
      h={TOOLBAR_HEIGHT}
      style={{ cursor: 'pointer' }}
      className={classes.toolbar_button}
    >
      <IconBug style={{ width: '80%', height: '80%', color: colors.gray[9] }} stroke={1} />
    </Group>
  )
}

export default AppBuilder
