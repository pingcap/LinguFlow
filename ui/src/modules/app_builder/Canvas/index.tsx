import { useHotkeys } from '@mantine/hooks'
import ReactFlow, { Background, Controls, useEdgesState, useNodesState } from 'reactflow'
import { HotKeyMenu } from './HotKeyMenu'
import { useHotKeyMenu } from './useHotKeyMenu'

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

  const { events: paneEvents, hotKeyMenuOpened, setHotKeyMenuOpened, menuPosition } = useHotKeyMenu()

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
