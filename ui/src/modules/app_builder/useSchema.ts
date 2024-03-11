import { createContext, useContext, useMemo } from 'react'
import { BlockInfo, PatternInfo } from '@api/linguflow.schemas'

interface SchemaContext {
  blocks?: BlockInfo[]
  patterns?: PatternInfo[]
}

export const SchemaContext = createContext<SchemaContext>({
  blocks: [],
  patterns: []
})

export const SchemaProvider = SchemaContext.Provider

export const DIR_SORTS: string[] = ['input & output', 'data process', 'condition', 'llm', 'invoke', 'tools']

export const useBlockSchema = () => {
  const { blocks = [] } = useContext(SchemaContext)
  const blockMap = useMemo(
    () =>
      blocks.reduce((prev, block) => {
        prev[block.name] = block
        return prev
      }, {} as { [k: string]: BlockInfo }),
    [blocks]
  )
  const blocksByDir = useMemo(
    () =>
      blocks.reduce((prev, block) => {
        if (!prev[block.dir]) {
          prev[block.dir] = []
        }
        prev[block.dir].push(block)
        return prev
      }, {} as { [k: string]: BlockInfo[] }),
    [blocks]
  )

  return { blocks, blockMap, blocksByDir }
}

export const usePatternSchema = () => {
  const { patterns = [] } = useContext(SchemaContext)
  const patternMap = useMemo(
    () =>
      patterns.reduce((prev, cur) => {
        prev[cur.name] = cur
        return prev
      }, {} as { [k: string]: PatternInfo }),
    [patterns]
  )
  return { patterns, patternMap }
}
