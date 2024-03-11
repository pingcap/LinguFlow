import { Box, Select } from '@mantine/core'
import React from 'react'
import { Controller } from 'react-hook-form'
import { Parameter, PatternInfo } from '@api/linguflow.schemas'
import { usePatternSchema } from '../useSchema'
import { Input } from './Input'
import { NumberComponent } from './Number'
import { ListComponent } from './List'
import { Secret } from './Secret'
import { Dict } from './Dict'
import { Float } from './Float'
import { Boolean } from './Boolean'

export interface SlotTypeComponentProps {
  formPath: string
  slot: Parameter
  disabled?: boolean
  stackIndex?: number
}

const BuiltinTypeComponent: { [k: string]: React.FC<SlotTypeComponentProps> } = {
  text: Input,
  list: ListComponent,
  float: Float,
  integer: NumberComponent,
  boolean: Boolean,
  dict: Dict,
  any: Input
}

const ExternalTypeComponent: { [k: string]: React.FC<SlotTypeComponentProps> } = {
  Secret: Secret
}

export const Slot: React.FC<SlotTypeComponentProps> = React.memo(({ formPath, slot, disabled, stackIndex }) => {
  const subFormPath = `${formPath}.slots.${slot.name}`
  const SlotComponent =
    BuiltinTypeComponent[slot.class_name] || ExternalTypeComponent[slot.class_name] || ExternalTypeSelect
  return <SlotComponent formPath={subFormPath} slot={slot} disabled={disabled} stackIndex={stackIndex} />
})

const ExternalTypeSelect: React.FC<SlotTypeComponentProps> = ({ formPath, slot, disabled, stackIndex }) => {
  const { patterns, patternMap } = usePatternSchema()

  if (!patterns.length) {
    return <></>
  }

  const slotType = patternMap[slot.class_name]
  const { candidates } = slotType

  return (
    <Controller
      name={`${formPath}.name`}
      render={({ field: { value, onChange } }) => (
        <>
          <Select
            placeholder="Pick candidates"
            size="xs"
            label={slot.name}
            data={candidates}
            value={value}
            onChange={onChange}
            disabled={disabled}
            comboboxProps={{ withinPortal: false }}
          />
          {!!value && (
            <SlotTypeParams
              parentValue={value}
              formPath={formPath}
              slotType={slotType}
              slotTypeMap={patternMap}
              disabled={disabled}
              stackIndex={stackIndex}
            />
          )}
        </>
      )}
    />
  )
}

const SlotTypeParams: React.FC<{
  parentValue: string
  formPath: string
  slotType: PatternInfo
  slotTypeMap: { [k: string]: PatternInfo }
  disabled?: boolean
  stackIndex?: number
}> = ({ parentValue, formPath, slotTypeMap, disabled, stackIndex = 1 }) => {
  const subSlots = slotTypeMap[parentValue]?.slots || []

  return (
    <Box pl={stackIndex * 10}>
      {subSlots?.map((s) => (
        <Box py={4}>
          <Slot key={s.name} formPath={formPath} slot={s} disabled={disabled} stackIndex={stackIndex + 1} />
        </Box>
      ))}
    </Box>
  )
}
