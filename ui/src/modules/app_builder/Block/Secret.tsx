import { Controller, useFormContext } from 'react-hook-form'
import { PasswordInput } from '@mantine/core'
import { useEffect } from 'react'
import type { SlotTypeComponentProps } from './Slot'

export const SECRET_NAME = 'Secret'

export const Secret: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled, required }) => {
  const { register } = useFormContext()
  useEffect(() => {
    register(`${formPath}.name`, { value: SECRET_NAME })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Controller
      name={`${formPath}.slots.plaintext`}
      render={({ field: { onChange, value, ref } }) => (
        <PasswordInput
          withAsterisk={required}
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
