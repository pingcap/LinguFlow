import { ActionIcon, Box, Group, Menu, TextInput, rem, useMantineTheme } from '@mantine/core'
import {
  IconBug,
  IconChevronLeft,
  IconDeviceFloppy,
  IconDownload,
  IconMenu2,
  IconRocket,
  IconUpload
} from '@tabler/icons-react'
import React, { useRef, useState } from 'react'
import ReactFlow, { Background, Controls, useEdgesState, useNodesState } from 'reactflow'

import 'reactflow/dist/style.css'
import { useGetAppApplicationsApplicationIdGet } from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import { useHotkeys } from '@mantine/hooks'
import classes from './index.module.css'

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } }
]
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

const TOOLBAR_HEIGHT = 30

const AppBuilder: React.FC = () => {
  const { appId, verId } = useParams()
  const { data: appData } = useGetAppApplicationsApplicationIdGet(appId!)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [menuOpened, setMenuOpened] = useState(false)

  const { events: paneEvents, hotKeyMenuOpened, setHotKeyMenuOpened, menuPosition } = useBuilderHotKeyMenu()

  useHotkeys([
    [
      'mod+A',
      (e) => {
        e.preventDefault()
        onNodesChange(nodes.map((n) => ({ id: n.id, type: 'select', selected: true })))
        onEdgesChange(edges.map((e) => ({ id: e.id, type: 'select', selected: true })))
      }
    ],
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

      <HotKeyMenu opened={hotKeyMenuOpened} setOpened={setHotKeyMenuOpened} menuPosition={menuPosition} />

      <Box w="100%" h={`calc(100% - ${TOOLBAR_HEIGHT}px)`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          minZoom={0.2}
          fitView
          onClick={() => {
            setMenuOpened(false)
            setHotKeyMenuOpened(false)
          }}
          {...paneEvents}
        >
          <Background />
          <Controls showInteractive={false}>
            {/* <ControlButton
                onClick={() => {
                  const nodes = layoutedNodes({ nodes: getNodes(), edges: getEdges() })
                  setNodes(nodes)
                  window.requestAnimationFrame(() => {
                    fitView()
                    saveCurrentUIMetadata()
                  })
                }}
                title="reorder"
              >
                <IconSitemap />
              </ControlButton> */}
          </Controls>
        </ReactFlow>
        <Toolbar />
        KH
      </Box>
    </Box>
  )
}

const useBuilderHotKeyMenu = () => {
  const [menuPosition, setMenuPosition] = useState([0, 0])
  const [hotKeyMenuOpened, setHotKeyMenuOpened] = useState(false)
  const paneStatus = useRef({
    inPane: true,
    mouseX: 0,
    mouseY: 0
  })

  const onPaneMouseEnter: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    paneStatus.current.inPane = true
  }
  const onPaneMouseLeave: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    paneStatus.current.inPane = false
  }
  const onPaneMouseMove: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    paneStatus.current.mouseX = e.clientX
    paneStatus.current.mouseY = e.clientY
  }
  const onNodeMouseEnter: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    paneStatus.current.inPane = false
  }
  const onNodeMouseLeave: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    paneStatus.current.inPane = true
  }

  const showHotKeyMenu = () => {
    if (!paneStatus.current.inPane) {
      return
    }
    setMenuPosition([paneStatus.current.mouseX, paneStatus.current.mouseY])
    setHotKeyMenuOpened(true)
  }
  const onPaneContextMenu: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    e.preventDefault()
    showHotKeyMenu()
  }
  const onNodeContextMenu: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    e.preventDefault()
  }
  const onEdgeContextMenu: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    e.preventDefault()
  }

  useHotkeys([['Space', showHotKeyMenu]])

  return {
    hotKeyMenuOpened,
    setHotKeyMenuOpened,
    menuPosition,
    events: {
      onPaneMouseEnter,
      onPaneMouseLeave,
      onPaneMouseMove,
      onPaneContextMenu,
      onNodeMouseEnter,
      onNodeMouseLeave,
      onNodeContextMenu,
      onEdgeContextMenu
    }
  }
}

const HotKeyMenu: React.FC<{ opened: boolean; setOpened: (opened: boolean) => void; menuPosition: number[] }> = ({
  opened,
  setOpened,
  menuPosition
}) => {
  return (
    <Menu shadow="md" width={200} opened={opened} onChange={setOpened} position="bottom-start" trapFocus={false}>
      <Menu.Target>
        <Box style={{ position: 'fixed', zIndex: 99999, left: menuPosition[0], top: menuPosition[1] }}></Box>
      </Menu.Target>

      <Menu.Dropdown>
        <TextInput px="sm" variant="unstyled" placeholder="Search..." autoFocus />
        <Menu.Label>Blocks</Menu.Label>
        <Menu.Item>Input & Output</Menu.Item>
      </Menu.Dropdown>
    </Menu>
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
