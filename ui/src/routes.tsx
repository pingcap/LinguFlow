import { Navigate, Route, Routes } from 'react-router-dom'
import { PropsWithChildren, Suspense, lazy } from 'react'
import { Layout } from './components/Layout/Layout'
import { AppList } from './modules/app_list'
import { VersionList } from './modules/version_list'
import { Loading } from './components/Loading'

const AppBuilder = lazy(() => import('./modules/app_builder'))
const LazyWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AppList />} />
      </Route>

      <Route path="/app/:appId" element={<VersionList />} />
      <Route
        path="/app/:appId/ver/:verId?"
        element={
          <LazyWrapper>
            <AppBuilder />
          </LazyWrapper>
        }
      />

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
