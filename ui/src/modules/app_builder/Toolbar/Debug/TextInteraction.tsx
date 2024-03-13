import { Textarea } from '@mantine/core'
import type { InteractionProps } from '.'

export const TextIntercation: React.FC<InteractionProps<string>> = ({ value, onChange }) => {
  return (
    <Textarea minRows={10} maxRows={10} autosize size="xs" value={value} onChange={(e) => onChange(e.target.value)} />
  )
}
