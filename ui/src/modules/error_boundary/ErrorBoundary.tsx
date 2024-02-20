import { Alert } from '@mantine/core'
import { CodeHighlight } from '@mantine/code-highlight'
import { IconAlertCircle } from '@tabler/icons-react'
import { FallbackProps } from 'react-error-boundary'

import '@mantine/code-highlight/styles.css'

export const CustomError: React.FC<{ error: FallbackProps }> = ({ error }) => {
  return (
    <>
      <Alert icon={<IconAlertCircle size="1rem" />} color="red">
        Error!
      </Alert>
      <CodeHighlight language="javascript" code={error.error.message} />
      <CodeHighlight language="javascript" code={error.error.stack} />
    </>
  )
}
