import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Text } from '@mantine/core'
import { SlotTypeComponentProps } from './Slot'

export const SlotReadonly: React.FC<SlotTypeComponentProps> = ({ formPath, slot }) => {
  const subFormPath = `${formPath}.slots.${slot.name}`
  const SlotComponent = SlotTypeReadonlyComponents[slot.class_name] || SelectReadonly
  return <SlotComponent formPath={subFormPath} slot={slot} />
}

const TextReadonly: React.FC<SlotTypeComponentProps> = ({ formPath }) => {
  const { watch } = useFormContext()
  const value = watch(formPath)
  return <Text span>{value}</Text>
}

const SelectReadonly: React.FC<SlotTypeComponentProps> = ({ formPath }) => {
  const { watch } = useFormContext()
  const value = watch(`${formPath}.name`)
  return <Text span>{value}</Text>
}

const SlotTypeReadonlyComponents: { [k: string]: React.FC<SlotTypeComponentProps> } = {
  text: TextReadonly,
  list: TextReadonly,
  float: TextReadonly,
  integer: TextReadonly,
  boolean: TextReadonly,
  any: TextReadonly
}
