import { Viewport, Node as ReactFlowNode } from 'reactflow'

export type NodeSlots = { [key: string]: any }

export interface Config {
  nodes: Node[]
  edges: Edge[]
}

export interface Node {
  id: string
  name: string
  alias?: string
  slots?: NodeSlots
}

export type EdgeCase = boolean | string | number

export interface Edge {
  src_block?: string
  dst_block?: string
  dst_port?: string
  alias?: string
  case?: EdgeCase
}

export interface MetadataUI {
  viewport: Viewport
  nodes: ReactFlowNode<any>[]
}

export interface ConfigAndMetadataUI {
  config: Config
  ui: MetadataUI
}
