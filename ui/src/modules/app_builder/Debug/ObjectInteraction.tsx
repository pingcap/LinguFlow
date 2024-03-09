import ReactJson from 'react-json-view'
import { ApplicationRunInputAnyOf } from '@api/linguflow.schemas'
import { Box } from '@mantine/core'
import type { InteractionProps } from '.'

export const ObjectIntercation: React.FC<InteractionProps<ApplicationRunInputAnyOf>> = ({ value, onChange }) => {
  return (
    <Box>
      <ReactJson
        name={null}
        iconStyle="square"
        enableClipboard={false}
        src={value}
        onAdd={(v) => onChange(v.updated_src as ApplicationRunInputAnyOf)}
        onEdit={(v) => onChange(v.updated_src as ApplicationRunInputAnyOf)}
        onDelete={(v) => onChange(v.updated_src as ApplicationRunInputAnyOf)}
      />
      {/* <Textarea
        size="xs"
        styles={{ input: { resize: 'vertical' } }}
        value={JSON.stringify(value)}
        onBlur={(e) => onChange(JSON.parse(e.target.value) as ApplicationRunInputAnyOf)}
      /> */}
    </Box>
  )
}
