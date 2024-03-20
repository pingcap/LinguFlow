import { Connection, Node, useStoreApi } from 'reactflow'
import { useCallback } from 'react'
import { usePatternSchema } from '../useSchema'
import { BlockNodeProps } from '.'

export const BLOCK_PORT_ID_NULL = '__null__'
export const BOOLEAN_CLASS_NAME = 'boolean'

export const useValidConnection = () => {
  const getNodeType = useNodeType()
  const { patternMap } = usePatternSchema()
  return (connection: Connection) => {
    const outportClassName = getNodeType(connection.source!)?.data?.schema?.outport
    const inportClassName = getNodeType(connection.target!)?.data?.schema.inports.find(
      (inp) => inp.name === connection.targetHandle
    )?.class_name

    const notSelfNode = connection.source !== connection.target
    const isConditionalTarget = connection.targetHandle === BLOCK_PORT_ID_NULL
    const isOutportBoolean = outportClassName === BOOLEAN_CLASS_NAME
    const isConditionalConnection = isConditionalTarget && isOutportBoolean
    const isAnyTarget = !isConditionalTarget && !inportClassName
    const isSameClass = outportClassName === inportClassName
    const isOutportClassASubclassOfInportClass =
      !!inportClassName && patternMap[inportClassName]?.candidates?.includes(outportClassName)

    return (
      notSelfNode && (isConditionalConnection || isAnyTarget || isSameClass || isOutportClassASubclassOfInportClass)
    )
  }
}

export const useNodeType = () => {
  const store = useStoreApi()
  const useNodeTypeFn = useCallback(
    (id: string) =>
      Array.from(store.getState().nodeInternals.values()).find((n) => n.id === id) as Node<BlockNodeProps>,
    [store]
  )
  return useNodeTypeFn
}
