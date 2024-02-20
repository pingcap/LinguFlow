import { Title } from '@mantine/core'
import { useNavigate } from 'react-router-dom'

const CustomTitle: React.FC = () => {
  const navigate = useNavigate()
  return (
    <Title order={3} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => navigate('/')}>
      LinguFlow
    </Title>
  )
}

export { CustomTitle as Title }
