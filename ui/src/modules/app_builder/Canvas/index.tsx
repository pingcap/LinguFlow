import { useHotkeys } from '@mantine/hooks'
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Node,
  XYPosition,
  useEdgesState,
  useNodesState,
  useReactFlow
} from 'reactflow'
import { nanoid } from 'nanoid'
import { BlockInfo, InteractionInfo, Metadata } from '@api/linguflow.schemas'
import { useEffect, useRef } from 'react'
import { BLOCK_NODE_NAME, BlockNode, BlockNodeProps } from '../Block'
import { Config, MetadataUI } from '../linguflow.type'
import { useBlockSchema } from '../useSchema'
import { HotKeyMenu } from './HotKeyMenu'
import { useHotKeyMenu } from './useHotKeyMenu'

export interface BuilderCanvasProps {
  config?: Config
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const NODE_TYPES = {
  [BLOCK_NODE_NAME]: BlockNode
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ config, onClick }) => {
  const { blocks, blockMap } = useBlockSchema()
  const { getNodes, getEdges, fitView, project, getViewport } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // init app
  const initApp = useRef(
    ({
      config,
      blockMap,
      interaction,
      fitview = true
    }: {
      config: Config
      blockMap: {
        [k: string]: BlockInfo
      }
      interaction?: InteractionInfo
      fitview?: boolean
    }) => {
      const { nodes, edges } = appConfigToReactflow(config, blockMap)
      setNodes(nodes)
      setEdges(edges)

      // Object.keys(getValues()).forEach((k) => unregister(k))
      // nodes.forEach((n) => register(n.data.props.id, { value: n.data.props }))

      if (!fitview) {
        return
      }
      window.requestAnimationFrame(() => {
        fitView()
      })
    }
  )
  useEffect(() => {
    if (!config || !blocks.length) {
      return
    }
    initApp.current({ config, blockMap })
  }, [config, blockMap, blocks])

  // add node
  const addNode = useRef((node: Node<BlockNodeProps>) => {
    setNodes((nds) => nds.concat(node))
  })

  // hot keys
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
      <HotKeyMenu
        opened={hotKeyMenuOpened}
        setOpened={setHotKeyMenuOpened}
        menuPosition={menuPosition}
        onCreateBlock={addNode.current}
      />

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
        nodeTypes={NODE_TYPES}
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

const appConfigToReactflow = (
  config: Config,
  blockMap: { [k: string]: BlockInfo }
  // interaction?: InteractionDebugResponse
): { nodes: Node[]; edges: Edge[] } => {
  const { nodes, edges } = config
  // const interactionMap =
  //   interaction?.debug.reduce((prev, current) => {
  //     prev[current.block] = current
  //     return prev
  //   }, {} as { [k: string]: DebugInfo }) || {}
  return {
    nodes:
      // ui?.nodes ||
      nodes?.map((n) => {
        const schema = blockMap[n.name]
        if (!schema) {
          throw new Error(`Unknown block: ${n.name}`)
        }
        return toCustomNode({
          // ...getMetadataUINode(n.id, metadata),
          id: n.id,
          data: { schema, node: n }
        })
      }) || [],
    edges: edges.map((e) => {
      return toCustomEdge({
        id: `${e.src_block!}_${e.dst_block!}_${e.dst_port!}`,
        source: e.src_block!,
        target: e.dst_block!,
        targetHandle: e.dst_port,
        label: `${e.alias ? e.alias : ''}${typeof e.case === 'boolean' ? '(' + e.case?.toString() + ')' : ``}`,
        data: e
      })
    })
  }
}

const DEFAULT_POSITION: XYPosition = { x: 0, y: 0 }

export const toCustomNode = (node: Partial<Node<BlockNodeProps>>): Node<BlockNodeProps | null> => {
  return {
    position: DEFAULT_POSITION,
    id: nanoid(),
    data: null,
    ...node,
    type: BLOCK_NODE_NAME
  }
}

export const toCustomEdge = (edge: Edge | Connection): Edge => {
  return {
    ...edge,
    id: nanoid(),
    animated: typeof (edge as Edge).data.case === 'boolean',
    markerEnd: {
      type: MarkerType.ArrowClosed
    }
  } as Edge
}

const getMetadataUINode = (id: string, metadata: Metadata) => {
  const metadataUI = (metadata as any).custom_fields?.ui as MetadataUI
  if (!metadataUI) {
    return {}
  }
  return metadataUI.nodes.find((n) => n.id === id) || {}
}
