import { Controller } from 'react-hook-form'
import { NumberInput } from '@mantine/core'
import type { SlotTypeComponentProps } from './Slot'

export const Float: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled }) => {
  return (
    <Controller
      name={formPath}
      render={({ field: { ref, value, onChange } }) => (
        <NumberInput
          decimalScale={2}
          variant={disabled ? 'filled' : 'default'}
          hideControls={disabled}
          ref={ref}
          label={slot.name}
          size="xs"
          value={parseFloat((value || slot.default || '0') as string)}
          onChange={disabled ? undefined : onChange}
        />
      )}
    />
  )
}
