import { Controller } from 'react-hook-form'
import { Box, Switch } from '@mantine/core'
import type { SlotTypeComponentProps } from './Slot'

export const Boolean: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled }) => {
  return (
    <Controller
      name={formPath}
      render={({ field: { ref, value, onChange } }) => (
        <Switch
          size="xs"
          ref={ref}
          disabled={disabled}
          labelPosition="left"
          label={
            <Box c="#212529" fw={500}>
              {slot.name}
            </Box>
          }
          value={value || slot.default}
          onChange={disabled ? undefined : onChange}
        />
      )}
    />
  )
}
