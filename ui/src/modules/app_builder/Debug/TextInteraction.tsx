import { Textarea } from '@mantine/core'
import type { InteractionProps } from '.'

export const TextIntercation: React.FC<InteractionProps<string>> = ({ value, onChange }) => {
  return <Textarea h="100%" size="xs" value={value} onChange={(e) => onChange(e.target.value)} minRows={5} autosize />
}
