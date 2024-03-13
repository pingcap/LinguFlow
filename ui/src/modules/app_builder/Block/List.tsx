import { Controller, useFormContext } from 'react-hook-form'
import { useState } from 'react'
import { MultiSelect } from '@mantine/core'
import type { SlotTypeComponentProps } from './Slot'

export const ListComponent: React.FC<SlotTypeComponentProps> = ({ slot, formPath, disabled }) => {
  const { getValues } = useFormContext()
  const _data = (getValues(formPath) as string[]) || slot.default || []
  const [data, setData] = useState(_data)
  return (
    <Controller
      name={formPath}
      render={({ field: { onChange, value, ref } }) => (
        <MultiSelect
          ref={ref}
          disabled={disabled}
          label={slot.name}
          size="xs"
          value={value}
          data={data}
          onChange={onChange}
          // getCreateLabel={(query) => `+ ${query}`}
          // onCreate={(query) => {
          //   setData((current) => [...current, query])
          //   return query
          // }}
          // creatable
          searchable
          // withinPortal
          comboboxProps={{ withinPortal: false }}
        />
      )}
    />
  )
}
