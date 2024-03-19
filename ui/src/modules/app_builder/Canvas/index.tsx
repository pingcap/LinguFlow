import { useHotkeys } from '@mantine/hooks'
import ReactFlow, {
  Background,
  Connection,
  ConnectionMode,
  ControlButton,
  Controls,
  Edge,
  MarkerType,
  Node,
  NodeDragHandler,
  OnConnect,
  OnEdgesChange,
  OnNodesDelete,
  Position,
  XYPosition,
  addEdge,
  updateEdge,
  useEdgesState,
  useNodesState,
  useReactFlow
} from 'reactflow'
import dagre from 'dagre'
import { nanoid } from 'nanoid'
import { BlockInfo, InteractionInfo, VersionMetadata, VersionMetadataMetadata } from '@api/linguflow.schemas'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { IconSitemap } from '@tabler/icons-react'
import { BLOCK_NODE_NAME, BlockNode, BlockNodeProps } from '../Block'
import { Config, MetadataUI, Edge as LinguEdge } from '../linguflow.type'
import { useBlockSchema } from '../useSchema'
import { BLOCK_PORT_ID_NULL, BOOLEAN_CLASS_NAME, useNodeType } from '../Block/useValidConnection'
import { CUSTOM_EDGE_NAME, CustomEdge, EdgeModal } from '../Edge'
import { HotKeyMenu } from './HotKeyMenu'
import { useHotKeyMenu } from './useHotKeyMenu'

export interface BuilderCanvasProps {
  config?: Config
  metadata?: VersionMetadata
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  interaction?: InteractionInfo
  onNodeDragStop: NodeDragHandler
  onNodesDelete: OnNodesDelete
  onAddNode: (n: Node<BlockNodeProps>) => void
  onConnect: OnConnect
  onEdgeChange: OnEdgesChange
  onRelayout: () => void
  onCanSave: () => void
}

const NODE_TYPES = {
  [BLOCK_NODE_NAME]: BlockNode
}
const EDGE_TYPES = {
  [CUSTOM_EDGE_NAME]: CustomEdge
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  config,
  metadata,
  interaction,
  onClick,
  onNodeDragStop,
  onNodesDelete,
  onAddNode,
  onRelayout,
  onConnect,
  onCanSave,
  onEdgeChange: onEdgeChangeEvent
}) => {
  const { blocks, blockMap } = useBlockSchema()
  const { getNodes, getEdges, fitView } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<LinguEdge>([])

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
    onAddNode(node)
  })
  const onNodesDeleteFn = useCallback(
    (n: Node[]) => {
      n.forEach((node) => {
        unregister(node.id)
        setEdges((es) => es.filter((e) => e.target !== node.id || e.source !== node.id))
      })
      onNodesDelete(n)
    },
    [setEdges, unregister, onNodesDelete]
  )
  const onConnectFn = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const isBoolean = getNodeType(params.source!)?.data?.schema?.outport === BOOLEAN_CLASS_NAME
        return addEdge(toCustomEdge({ ...params, data: { case: isBoolean ? true : null } }), eds)
      })
      onConnect(params)
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

  const [editEdge, setEditEdge] = useState<Edge>()
  const confirmEdgeChange = ({ label, value }: { label: string; value?: string }) => {
    const editEdgeId = editEdge!.id

    setEdges((eds) => {
      const edge = eds.find((e) => e.id === editEdgeId)
      if (!edge || !edge.data) {
        return eds
      }
      edge.data.alias = label

      const isBoolean = getNodeType(edge.source)?.data?.schema?.outport === BOOLEAN_CLASS_NAME
      if (isBoolean) {
        edge.data.case = JSON.parse(value!)
      }

      return eds
    })

    setEditEdge(undefined)
    onCanSave()
  }

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
        edgeTypes={EDGE_TYPES}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={(e) => {
          onEdgesChange(e)
          onEdgeChangeEvent(e)
        }}
        onConnect={onConnectFn}
        onClick={(e) => {
          setHotKeyMenuOpened(false)
          onClick?.(e)
        }}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDeleteFn}
        // onEdgeDoubleClick={(_, edge) => {
        //   setEditEdge(edge)
        // }}
        {...paneEvents}
      >
        <Background />
        <Controls showInteractive={false}>
          <ControlButton
            onClick={() => {
              const nodes = layoutedNodes({ nodes: getNodes(), edges: getEdges() })
              setNodes(nodes)
              window.requestAnimationFrame(() => {
                fitView()
                onRelayout()
              })
            }}
            title="reorder"
          >
            <IconSitemap />
          </ControlButton>
        </Controls>
      </ReactFlow>

      <EdgeModal
        modalProps={{ opened: !!editEdge, onClose: () => setEditEdge(undefined) }}
        edge={editEdge}
        onConfirm={confirmEdgeChange}
      />
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
        targetHandle: !e.dst_port ? BLOCK_PORT_ID_NULL : e.dst_port,
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
  const edgeData = (edge as Edge<LinguEdge>).data
  const isBooleanCaseEdge = typeof edgeData?.case === 'boolean'

  return {
    ...edge,
    id: nanoid(),
    type: CUSTOM_EDGE_NAME,
    animated: isBooleanCaseEdge,
    label: edgeData?.alias,
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

const layoutedNodes = ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }): Node[] => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 300, ranksep: 300 })

  nodes.forEach((node) => {
    const { width, height } = document.querySelector(`[data-id="${node.id}"]`)!.getBoundingClientRect()
    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = Position.Left
    node.sourcePosition = Position.Right
    const { width, height } = document.querySelector(`[data-id="${node.id}"]`)!.getBoundingClientRect()
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2
    }

    return node
  })
}
