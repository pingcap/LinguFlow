import { Controller } from 'react-hook-form'
import ReactJson from 'react-json-view'
import { ApplicationRunInputAnyOf } from '@api/linguflow.schemas'
import { Text } from '@mantine/core'
import type { SlotTypeComponentProps } from './Slot'

export const Dict: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled }) => {
  return (
    <Controller
      name={formPath}
      render={({ field: { onChange, value } }) => (
        <>
          <Text fz="xs" fw={500}>
            {slot.name}
          </Text>
          <ReactJson
            name={null}
            iconStyle="square"
            enableClipboard={false}
            src={value}
            onAdd={!disabled && ((v) => onChange(v.updated_src as ApplicationRunInputAnyOf))}
            onEdit={!disabled && ((v) => onChange(v.updated_src as ApplicationRunInputAnyOf))}
            onDelete={!disabled && ((v) => onChange(v.updated_src as ApplicationRunInputAnyOf))}
          />
        </>
      )}
    />
  )
}
