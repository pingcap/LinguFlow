import { useHotkeys } from '@mantine/hooks'
import ReactFlow, {
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  Node,
  NodeDragHandler,
  XYPosition,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow
} from 'reactflow'
import { nanoid } from 'nanoid'
import { BlockInfo, InteractionInfo, VersionMetadata, VersionMetadataMetadata } from '@api/linguflow.schemas'
import { useCallback, useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { BLOCK_NODE_NAME, BlockNode, BlockNodeProps } from '../Block'
import { Config, MetadataUI } from '../linguflow.type'
import { useBlockSchema } from '../useSchema'
import { useNodeType } from '../Block/useValidConnection'
import { HotKeyMenu } from './HotKeyMenu'
import { useHotKeyMenu } from './useHotKeyMenu'

export interface BuilderCanvasProps {
  config?: Config
  metadata?: VersionMetadata
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onNodeDragStop: NodeDragHandler
  interaction?: InteractionInfo
}

const NODE_TYPES = {
  [BLOCK_NODE_NAME]: BlockNode
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  config,
  metadata,
  onClick,
  onNodeDragStop,
  interaction
}) => {
  const { blocks, blockMap } = useBlockSchema()
  const { getNodes, getEdges, fitView, project, getViewport } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const { register, unregister, getValues } = useFormContext()

  // init app
  const initApp = useRef(
    ({
      config,
      metadata,
      blockMap,
      interaction,
      needFitview = true
    }: {
      config: Config
      metadata: VersionMetadata
      blockMap: {
        [k: string]: BlockInfo
      }
      interaction?: InteractionInfo
      needFitview?: boolean
    }) => {
      const { nodes, edges } = appConfigToReactflow(config, blockMap, metadata, interaction)
      setNodes(nodes)
      setEdges(edges)

      Object.keys(getValues()).forEach((k) => unregister(k))
      nodes.forEach((n) => n.data && register(n.id, { value: n.data.node }))

      if (!needFitview) {
        return
      }
      fitView()
    }
  )
  useEffect(() => {
    if (!config || !blocks.length || !metadata) {
      return
    }
    initApp.current({ config, blockMap, metadata })
  }, [config, blockMap, blocks, metadata])
  useEffect(() => {
    if (!config || !blocks.length || !metadata) {
      return
    }
    initApp.current({ config, blockMap, metadata, interaction, needFitview: false })
  }, [interaction])

  // manipulate nodes
  const getNodeType = useNodeType()
  const addNode = useRef((node: Node<BlockNodeProps>) => {
    setNodes((nds) => nds.concat(node))
    register(node.data.node.id, { value: node.data.node })
  })
  const onNodesDeleteFn = useCallback(
    (n: Node[]) =>
      n.forEach((node) => {
        unregister(node.id)
        setEdges((es) => es.filter((e) => e.target !== node.id || e.source !== node.id))
      }),
    [setEdges, unregister]
  )
  const onConnectFn = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const isBoolean = getNodeType(params.source!)?.data?.schema?.outport === 'boolean'
        return addEdge(toCustomEdge({ ...params, data: { case: isBoolean ? true : null } }), eds)
      })
    },
    [getNodeType, setEdges]
  )

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
        minZoom={0.2}
        fitView
        connectionMode={ConnectionMode.Strict}
        nodeTypes={NODE_TYPES}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectFn}
        onClick={(e) => {
          setHotKeyMenuOpened(false)
          onClick?.(e)
        }}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDeleteFn}
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
  blockMap: { [k: string]: BlockInfo },
  metadata: VersionMetadataMetadata,
  interaction?: InteractionInfo
): { nodes: Node<BlockNodeProps | null>[]; edges: Edge[] } => {
  const { nodes, edges } = config

  return {
    nodes:
      // ui?.nodes ||
      nodes?.map((n) => {
        const schema = blockMap[n.name]
        if (!schema) {
          throw new Error(`Unknown block: ${n.name}`)
        }
        return toCustomNode({
          ...getMetadataUINode(n.id, metadata),
          id: n.id,
          data: { schema, node: n, interaction: interaction?.data?.[n.id] }
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

const getMetadataUINode = (id: string, metadata: VersionMetadataMetadata) => {
  const metadataUI = metadata.ui as MetadataUI
  if (!metadataUI) {
    return {}
  }
  return metadataUI.nodes.find((n) => n.id === id) || {}
}