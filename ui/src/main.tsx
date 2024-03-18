import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ErrorBoundary } from 'react-error-boundary'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from 'react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AppRoutes } from './routes.tsx'

dayjs.extend(relativeTime)

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { CustomError } from './components/ErrorBoundary.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <ColorSchemeScript defaultColorScheme="auto" />
        <MantineProvider defaultColorScheme="auto">
          <ModalsProvider>
            <Notifications position="top-center" zIndex={99999999} />
            <ErrorBoundary
              fallbackRender={(error) => {
                return <CustomError error={error} />
              }}
            >
              <AppRoutes />
            </ErrorBoundary>
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </HashRouter>
  </React.StrictMode>
)
