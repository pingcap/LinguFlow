import { Controller, useFormContext } from 'react-hook-form'
import { PasswordInput } from '@mantine/core'
import { useEffect } from 'react'
import type { SlotTypeComponentProps } from './Slot'

export const Secret: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled }) => {
  const { register } = useFormContext()
  useEffect(() => {
    register(`${formPath}.name`, { value: 'Secret' })
  }, [])
  return (
    <Controller
      name={`${formPath}.slots.plaintext`}
      render={({ field: { onChange, value, ref } }) => (
        <PasswordInput
          withAsterisk
          variant={disabled ? 'filled' : 'default'}
          ref={ref}
          label={slot.name}
          size="xs"
          value={value}
          onChange={disabled ? undefined : onChange}
        />
      )}
    />
  )
}
