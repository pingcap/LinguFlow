import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { AppList } from './modules/app_list'
import { VersionList } from './modules/version_list'
import { AppBuilder } from './modules/app_builder'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AppList />} />
      </Route>

      <Route path="/app/:appId" element={<VersionList />} />
      <Route path="/app/:appId/ver/:verId?" element={<AppBuilder />} />

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
