import { Box, Menu, TextInput } from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { useRef, useState } from 'react'
import ReactFlow, { Background, Controls, useEdgesState, useNodesState } from 'reactflow'

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } }
]
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }]

export interface BuilderCanvasProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ onClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const { events: paneEvents, hotKeyMenuOpened, setHotKeyMenuOpened, menuPosition } = useBuilderHotKeyMenu()

  useHotkeys([
    [
      'mod+A',
      (e) => {
        e.preventDefault()
        onNodesChange(nodes.map((n) => ({ id: n.id, type: 'select', selected: true })))
        onEdgesChange(edges.map((e) => ({ id: e.id, type: 'select', selected: true })))
      }
    ]
  ])

  return (
    <>
      <HotKeyMenu opened={hotKeyMenuOpened} setOpened={setHotKeyMenuOpened} menuPosition={menuPosition} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.2}
        fitView
        onClick={(e) => {
          setHotKeyMenuOpened(false)
          onClick?.(e)
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
    </>
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
