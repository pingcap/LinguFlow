import { Controller } from 'react-hook-form'
import { Textarea } from '@mantine/core'
import type { SlotTypeComponentProps } from './Slot'

export const Input: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled, required }) => {
  return (
    <Controller
      name={formPath}
      render={({ field: { ref, value, onChange } }) => (
        <Textarea
          required={required}
          variant={disabled ? 'filled' : 'default'}
          ref={ref}
          label={slot.name}
          size="xs"
          value={value || slot.default || ''}
          onChange={disabled ? undefined : onChange}
          styles={{ input: { resize: 'vertical' } }}
          autosize
          maxRows={20}
        />
      )}
    />
  )
}
