import { Button, ComboboxData, Group, Modal, ModalProps, Select, Stack, Text, TextInput } from '@mantine/core'
import { useState } from 'react'
import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getSimpleBezierPath, useReactFlow } from 'reactflow'
import { BOOLEAN_CLASS_NAME, useNodeType } from '../Block/useValidConnection'
import { Edge as LinguEdge } from '../linguflow.type'

const BOOLEAN_OPTIONS: ComboboxData = [
  { label: 'TRUE', value: 'true' },
  { label: 'FALSE', value: 'false' }
]

export const CUSTOM_EDGE_NAME = 'custom_edge'

export const CustomEdge: React.FC<EdgeProps<LinguEdge>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  label,
  sourcePosition,
  targetPosition,
  ...props
}) => {
  const { setEdges } = useReactFlow()
  const [edgePath, labelX, labelY] = getSimpleBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })
  const sourceNode = useNodeType()(props.source)
  const isBoolean = sourceNode?.data?.schema?.outport === BOOLEAN_CLASS_NAME
  const [value, setValue] = useState(data?.case?.toString())

  return (
    <>
      <BaseEdge id={id} path={edgePath} {...props} />
      <EdgeLabelRenderer>
        <Group
          gap="xs"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all'
          }}
        >
          <Text>{label}</Text>
          {isBoolean && (
            <Select
              size="xs"
              w={80}
              withCheckIcon={false}
              allowDeselect={false}
              className="nodrag nopan"
              data={BOOLEAN_OPTIONS}
              value={value}
              onChange={(v) => {
                setValue(v!)
                setEdges((eds) => {
                  const edge = eds.find((e) => e.id === id)
                  if (!edge) {
                    return eds
                  }
                  edge.data.case = JSON.parse(v!)
                  return eds
                })
              }}
              comboboxProps={{
                width: 'max-content'
              }}
            />
          )}
        </Group>
      </EdgeLabelRenderer>
    </>
  )
}

export const EdgeModal: React.FC<{
  modalProps: ModalProps
  edge?: Edge
  onConfirm: (v: { label: string; value?: string }) => void
}> = ({ modalProps, edge, onConfirm }) => {
  return (
    <Modal {...modalProps} title="Edit Edge" withinPortal keepMounted={false}>
      {!!edge && <ModalContent edge={edge} onConfirm={onConfirm} />}
    </Modal>
  )
}

const ModalContent: React.FC<{ edge: Edge<LinguEdge>; onConfirm: (v: { label: string; value?: string }) => void }> = ({
  edge,
  onConfirm
}) => {
  const [label, setLabel] = useState(edge.data?.alias || '')
  const [value, setValue] = useState(`${edge.data?.case?.toString() || ''}`)
  const sourceNode = useNodeType()(edge.source)
  const isBoolean = sourceNode?.data?.schema?.outport === BOOLEAN_CLASS_NAME

  return (
    <Stack>
      <TextInput label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
      {isBoolean && (
        <Select
          withCheckIcon={false}
          allowDeselect={false}
          data={BOOLEAN_OPTIONS}
          label="Value"
          value={value}
          onChange={(v) => setValue(v!)}
          required
        />
      )}
      <Group justify="right">
        <Button color="dark" onClick={() => onConfirm({ label, value })}>
          Confirm
        </Button>
      </Group>
    </Stack>
  )
}
