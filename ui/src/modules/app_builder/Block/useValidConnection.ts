import { Connection, Node, useNodes } from 'reactflow'
import { useCallback } from 'react'
import { usePatternSchema } from '../useSchema'
import { BlockNodeProps } from '.'

export const useValidConnection = () => {
  const getNodeType = useNodeType()
  const { patternMap } = usePatternSchema()
  return (connection: Connection) => {
    const outportClassName = getNodeType(connection.source!)?.data?.schema?.outport
    const inportClassName = getNodeType(connection.target!)?.data?.schema.inports.find(
      (inp) => inp.name === connection.targetHandle
    )?.class_name

    const notSelfNode = connection.source !== connection.target
    const isConditionalTarget = connection.targetHandle === 'null'
    const isOutportBoolean = outportClassName === 'boolean'
    const isConditionalConnection = isConditionalTarget && isOutportBoolean
    const isAnyTarget = !isConditionalTarget && !inportClassName
    const isSameClass = outportClassName === inportClassName
    const isOutportClassASubclassOfInportClass = patternMap[inportClassName!].candidates.includes(outportClassName)

    return (
      notSelfNode && (isConditionalConnection || isAnyTarget || isSameClass || isOutportClassASubclassOfInportClass)
    )
  }
}

export const useNodeType = () => {
  const nodes = useNodes()
  const useNodeTypeFn = useCallback((id: string) => nodes.find((n) => n.id === id) as Node<BlockNodeProps>, [nodes])
  return useNodeTypeFn
}
