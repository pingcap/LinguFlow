import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { AppList } from './modules/app_list'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AppList />} />
      </Route>
    </Routes>
  )
}
