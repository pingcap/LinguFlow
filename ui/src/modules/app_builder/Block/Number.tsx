import { Controller } from 'react-hook-form'
import { NumberInput } from '@mantine/core'
import type { SlotTypeComponentProps } from './Slot'

export const NumberComponent: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled }) => {
  return (
    <Controller
      name={formPath}
      render={({ field: { onChange, value, ref } }) => (
        <NumberInput
          variant={disabled ? 'filled' : 'default'}
          hideControls={disabled}
          ref={ref}
          label={slot.name}
          size="xs"
          value={parseInt((value || slot.default || '0') as string)}
          onChange={disabled ? undefined : onChange}
        />
      )}
    />
  )
}
