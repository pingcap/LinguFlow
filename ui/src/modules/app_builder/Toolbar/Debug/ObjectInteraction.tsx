import ReactJson from 'react-json-view'
import { ApplicationRunInputAnyOf } from '@api/linguflow.schemas'
import { ActionIcon, Group, Textarea, Tooltip } from '@mantine/core'
import { IconSwitchHorizontal } from '@tabler/icons-react'
import { useState } from 'react'
import type { InteractionProps } from '.'

export const ObjectIntercation: React.FC<InteractionProps<ApplicationRunInputAnyOf>> = (props) => {
  const { value, onChange } = props
  const [showInput, setShowInput] = useState(false)

  return (
    <Group align="flex-start">
      <Tooltip label={showInput ? 'Switch to JSON tree' : 'Switch to raw'}>
        <ActionIcon variant="subtle" color="gray" aria-label="Switch" onClick={() => setShowInput((v) => !v)}>
          <IconSwitchHorizontal style={{ width: '70%', height: '70%' }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
      {showInput ? (
        <ObjectInput {...props} />
      ) : (
        <ReactJson
          name={null}
          iconStyle="square"
          enableClipboard={false}
          src={value}
          onAdd={(v) => onChange(v.updated_src as ApplicationRunInputAnyOf)}
          onEdit={(v) => onChange(v.updated_src as ApplicationRunInputAnyOf)}
          onDelete={(v) => onChange(v.updated_src as ApplicationRunInputAnyOf)}
        />
      )}
    </Group>
  )
}

const ObjectInput: React.FC<InteractionProps<ApplicationRunInputAnyOf>> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(JSON.stringify(value))
  const [error, setError] = useState<React.ReactNode>(false)

  return (
    <Textarea
      w="90%"
      autosize
      error={error}
      minRows={8}
      maxRows={8}
      value={inputValue}
      onBlur={(e) => {
        setError(false)
        try {
          onChange(JSON.parse(e.target.value) as ApplicationRunInputAnyOf)
        } catch (e) {
          setError((e as Error).toString())
        }
      }}
      onChange={(e) => setInputValue(e.currentTarget.value)}
    />
  )
}
