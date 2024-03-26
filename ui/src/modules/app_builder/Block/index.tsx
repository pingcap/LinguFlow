import { BlockInfo, Parameter } from '@api/linguflow.schemas'
import {
  ActionIcon,
  Box,
  CopyButton,
  Drawer,
  DrawerProps,
  FocusTrap,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  rem,
  useMantineTheme
} from '@mantine/core'
import { IconCheck, IconCopy, IconSettings, IconX } from '@tabler/icons-react'
import { Edge, Handle, NodeProps, Position, useEdges, useNodeId, useReactFlow, useUpdateNodeInternals } from 'reactflow'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useDisclosure } from '@mantine/hooks'
import { useFormContext } from 'react-hook-form'
import { Node } from '../linguflow.type'
import { useContainerElem } from '../Canvas/useContainerElem'
import { Slot } from './Slot'
import { useCloseAllDrawer, useRegisterCloseDrawer } from './useBlockDrawer'
import { BLOCK_PORT_ID_NULL, useValidConnection } from './useValidConnection'
import { SlotReadonly } from './SlotReadonly'
import { DebugInfo } from './DebugInfo'

export const BLOCK_NODE_NAME = 'custom_block_node'

const PORT_SIZE = 12
const PORT_BORDER = 2
const PORT_OFFSET = (PORT_SIZE + PORT_BORDER) / 2

const OUTPUT_BLOCK_NAME = 'Text_Output'
const IGNORE_PORT_NAME = 'ignore'

const usePortCustomStyle = () => {
  const { colors } = useMantineTheme()
  const portCustomStyle: React.CSSProperties = {
    background: colors.gray[6],
    border: `${PORT_BORDER}px solid ${colors.gray[4]}`,
    width: `${PORT_SIZE}px`,
    height: `${PORT_SIZE}px`
  }

  return portCustomStyle
}

export interface BlockNodeProps {
  schema: BlockInfo
  node: Node
  interaction?: DisplayedInteraction
}

export interface DisplayedInteraction {
  interaction: string
  isError: boolean
}

export const BlockNode: React.FC<NodeProps<BlockNodeProps>> = ({ data, selected }) => {
  const { colors } = useMantineTheme()
  const PORT_CUSTOM_STYLE = usePortCustomStyle()
  const { schema, node, interaction } = data
  const { alias, inports, outport, slots, name } = schema
  const { setEdges } = useReactFlow()
  const edges = useEdges()
  const targetEdges = edges.filter((e) => e.target === node.id && e.targetHandle !== BLOCK_PORT_ID_NULL)
  const restArgsEdges = targetEdges.filter((e) => e.targetHandle && !inports.some((inp) => inp.name === e.targetHandle))
  const isValidConnection = useValidConnection()

  const { getFieldState } = useFormContext()
  const { isDirty } = getFieldState(node.id)

  const [opened, { open, close }] = useDisclosure(false)
  const closeAllDrawer = useCloseAllDrawer()
  const openDrawer = () => {
    if (!slots?.length) {
      return
    }
    closeAllDrawer()
    open()
  }

  useRegisterCloseDrawer(close)

  return (
    <>
      <Stack
        bg="white"
        miw="220px"
        fz="md"
        gap={0}
        pb={6}
        style={(theme) => ({
          border: `2px solid ${
            selected
              ? isDirty
                ? theme.colors.orange[3]
                : theme.colors.gray[3]
              : isDirty
              ? theme.colors.orange[1]
              : theme.colors.gray[1]
          }`,
          borderRadius: '8px'
        })}
        onDoubleClick={openDrawer}
      >
        <Group justify="space-between" p="sm" style={{ position: 'relative' }}>
          <Box maw={400}>
            <Tooltip position="left" label="Conditional(BOOLEAN)">
              <Handle
                type="target"
                position={Position.Left}
                id={BLOCK_PORT_ID_NULL}
                isValidConnection={() => false}
                style={{
                  ...PORT_CUSTOM_STYLE,
                  background: colors.gray[4],
                  border: `${PORT_BORDER}px solid ${colors.gray[2]}`,
                  left: `-${PORT_OFFSET}px`
                }}
              />
            </Tooltip>
            {alias}({node.id})
          </Box>
          <Group gap={4}>
            <CopyButton value={node?.id || ''} timeout={2000}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy Block ID'} withArrow position="top">
                  <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                    {copied ? <IconCheck style={{ width: rem(16) }} /> : <IconCopy style={{ width: rem(16) }} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
            {!!slots?.length && (
              <ActionIcon variant="subtle" color="gray" onClick={openDrawer}>
                <IconSettings size="1rem" />
              </ActionIcon>
            )}
          </Group>
        </Group>
        <Stack gap={6}>
          {inports?.map(
            (p) =>
              p.name !== IGNORE_PORT_NAME &&
              (p.class_name === 'any' ? (
                <RestArgs
                  key={p.name}
                  inports={inports}
                  inport={p}
                  restEdges={restArgsEdges}
                  onPortDelete={(p) =>
                    setEdges((es) => es.filter((e) => e.target !== node.id || e.targetHandle !== p.name))
                  }
                />
              ) : (
                <Box key={p.name} p="sm" bg="gray.0" style={{ position: 'relative' }}>
                  <Tooltip position="left" label={p.class_name.toUpperCase()}>
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={p.name}
                      isValidConnection={() => false}
                      style={{
                        ...PORT_CUSTOM_STYLE,
                        left: `-${PORT_OFFSET}px`
                      }}
                    />
                  </Tooltip>
                  <Text fw="bold">{p.name === 'input' ? 'inport' : p.name}</Text>
                </Box>
              ))
          )}
          {slots?.map((s) => (
            <Box key={s.name} p="sm" bg="gray.0" style={{ position: 'relative' }}>
              <Text maw={300} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <Text span>{s.name}: </Text>
                <SlotReadonly formPath={node.id} slot={s} />
              </Text>
            </Box>
          ))}
          {name !== OUTPUT_BLOCK_NAME && (
            <Box key="outport" p="sm" bg="gray.0" style={{ position: 'relative', textAlign: 'right' }}>
              <Tooltip position="right" label={outport.toUpperCase()}>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="outport"
                  isConnectableEnd={false}
                  isValidConnection={isValidConnection}
                  style={{
                    ...PORT_CUSTOM_STYLE,
                    right: `-${PORT_OFFSET}px`
                  }}
                />
              </Tooltip>
              <Text fw="bold">outport</Text>
            </Box>
          )}
        </Stack>
        {!!interaction?.interaction && <DebugInfo data={interaction} />}
      </Stack>
      {!!slots?.length && (
        <ConfigDrawer
          drawerProps={{
            opened,
            onClose: close,
            title: `${alias} Parameters`
          }}
          slots={slots}
          props={node}
        />
      )}
    </>
  )
}

interface Port {
  id: string
  name: string
}

const RestArgs: React.FC<{
  inports: Parameter[]
  inport: Parameter
  restEdges: Edge[]
  onPortDelete: (port: Port) => void
}> = ({ inports, inport, restEdges, onPortDelete }) => {
  const [showInput, setShowInput] = useState(false)
  const [ports, setPorts] = useState<Port[]>(restEdges.map((e) => ({ id: e.id, name: e.targetHandle! })))
  const nodeId = useNodeId()!
  const updateNodeInternals = useUpdateNodeInternals()
  const PORT_CUSTOM_STYLE = usePortCustomStyle()

  return (
    <Box key={inport.name} style={{ position: 'relative' }}>
      <Stack gap={6}>
        {ports?.map((p, idx) => (
          <Box key={p.name} p="sm" bg="gray.0" style={{ position: 'relative' }}>
            <Tooltip label={inport.class_name}>
              <Handle
                key={idx}
                type="target"
                position={Position.Left}
                id={p.name}
                isValidConnection={() => false}
                style={{
                  ...PORT_CUSTOM_STYLE,
                  left: `-${PORT_OFFSET}px`
                }}
              />
            </Tooltip>
            <Group justify="space-between">
              <Text fw="bold">{p.name}</Text>
              <ActionIcon
                variant="subtle"
                color="gray"
                style={{ flexShrink: 1 }}
                onClick={() => {
                  onPortDelete(p)
                  setPorts((ps) => ps.filter((_p) => _p.name !== p.name))
                  updateNodeInternals([nodeId])
                }}
              >
                <IconX size="1.125rem" />
              </ActionIcon>
            </Group>
          </Box>
        ))}

        <Box px="xs">
          {showInput ? (
            <Group>
              <FocusTrap>
                <TextInput
                  style={{ flexGrow: 1 }}
                  placeholder="Input the name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as any).value
                      if (ports.some((p) => p.name === value) || inports.some((p) => p.name === value)) {
                        return
                      }

                      setPorts((ps) => {
                        ps.push({ id: nanoid(), name: value })
                        return ps
                      })
                      setShowInput(false)
                      updateNodeInternals([nodeId])
                    }
                  }}
                />
              </FocusTrap>
              <ActionIcon variant="subtle" color="gray" style={{ flexShrink: 1 }} onClick={() => setShowInput(false)}>
                <IconX size="1.125rem" />
              </ActionIcon>
            </Group>
          ) : (
            <UnstyledButton
              fz="xs"
              pb="xs"
              w="100%"
              onClick={() => {
                setShowInput(true)
              }}
            >
              + Add port
            </UnstyledButton>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

const ConfigDrawer: React.FC<{ drawerProps: DrawerProps; slots: Parameter[]; props: Node }> = ({
  drawerProps,
  slots,
  props
}) => {
  const container = useContainerElem()
  return (
    <Drawer
      {...drawerProps}
      keepMounted={false}
      position="right"
      size="sm"
      withOverlay={false}
      lockScroll={false}
      zIndex={9999}
      portalProps={{
        target: container
      }}
      withinPortal
      styles={{
        inner: {
          position: 'absolute',
          right: 0
        }
      }}
    >
      <Stack>
        {/* {!appId && <BlockID />} */}
        {slots?.map((s) => (
          <Slot key={s.name} formPath={props.id} slot={s} />
        ))}
      </Stack>
    </Drawer>
  )
}
