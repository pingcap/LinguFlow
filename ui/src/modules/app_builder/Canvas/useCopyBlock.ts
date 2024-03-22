import { useHotkeys } from '@mantine/hooks'
import { nanoid } from 'nanoid'
import { useRef } from 'react'
import { Edge, Node, useReactFlow, useStoreApi } from 'reactflow'

import { Edge as LinguEdge } from '../linguflow.type'
import { BlockNodeProps } from '../Block'
import { useContainerElem } from './useContainerElem'

interface PasteValue {
  leftTopPosition: { x: number; y: number }
  nodes: Node<BlockNodeProps>[]
  edges: Edge<LinguEdge>[]
}

export const useCopyBlock = (
  menuStatus: React.RefObject<{
    inPane: boolean
    mouseX: number
    mouseY: number
  }>,
  onPaste: (value: PasteValue) => void
) => {
  const { screenToFlowPosition } = useReactFlow()
  const store = useStoreApi()
  const clipboard = useRef<PasteValue>({
    leftTopPosition: { x: 0, y: 0 },
    nodes: [],
    edges: []
  })
  const containerElem = useContainerElem()

  useHotkeys([
    [
      'mod+C',
      () => {
        const selectedNodes: Node<BlockNodeProps>[] = Array.from(store.getState().nodeInternals.values()).filter(
          (n) => n.selected
        )
        const selectedEdges: Edge<LinguEdge>[] = store.getState().edges.filter((e) => e.selected)

        const currentLeftTopPosition = { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER }
        selectedNodes.forEach((n) => {
          if (n.position.x < currentLeftTopPosition.x) {
            currentLeftTopPosition.x = n.position.x
          }
          if (n.position.y < currentLeftTopPosition.y) {
            currentLeftTopPosition.y = n.position.y
          }
        })

        clipboard.current = {
          leftTopPosition: currentLeftTopPosition,
          nodes: selectedNodes,
          edges: selectedEdges
        }
      }
    ],
    [
      'mod+V',
      () => {
        const { nodes, edges, leftTopPosition } = clipboard.current
        const reactflowBounds = containerElem.getBoundingClientRect()
        const mouseToFlowPosition = screenToFlowPosition({
          x: (menuStatus.current?.mouseX || 0) - reactflowBounds.left,
          y: (menuStatus.current?.mouseY || 0) - reactflowBounds.top
        })
        const offsetX = mouseToFlowPosition.x - leftTopPosition.x
        const offsetY = mouseToFlowPosition.y - leftTopPosition.y

        const nodeIdMap: { [k: string]: string } = {}
        const newNodes = nodes.map((n) => {
          const newId = nanoid()
          nodeIdMap[n.id] = newId

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { positionAbsolute, ...node } = n

          return {
            ...node,
            id: newId,
            data: { ...node.data, node: { ...node.data.node, id: newId } },
            position: {
              x: n.position.x + offsetX,
              y: n.position.y + offsetY
            }
          }
        })
        const newEdges = edges.map((e) => {
          const newId = nanoid()
          const newSource = nodeIdMap[e.source]
          const newTarget = nodeIdMap[e.target]
          return {
            ...e,
            id: newId,
            source: newSource,
            target: newTarget,
            data: { ...e.data, src_block: newSource, dst_block: newTarget }
          }
        })

        onPaste({ ...clipboard.current, nodes: newNodes, edges: newEdges })
      }
    ]
  ])
}
