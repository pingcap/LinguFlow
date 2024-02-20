import { Node, Viewport } from 'reactflow'

export interface MetadataUI {
  viewport: Viewport
  nodes: Node<any>[]
  // edge: Edge[]
}

export interface LinguFlowBlockProps {
  id: string
  name: string
  slots: {
    [k: string]: LinguFlowBlockProps
  }
}
