import { notifications } from '@mantine/notifications'
import axios, { AxiosRequestConfig } from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_ENDPOINT_BASE_URL || '/linguflow-api'
})

const ERROR_CANCEL = 'ERR_CANCELED'

httpClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.code === ERROR_CANCEL) {
      return
    }
    notifications.show({
      color: 'red',
      title: 'Error',
      message: error.response?.data?.message || error.message,
      autoClose: false
    })
    throw error
  }
)

httpClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response.status === 401) {
      location.href = error.response.data.auth_url
    }
    throw error
  }
)

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source()
  const promise = httpClient({
    ...config,
    ...options,
    cancelToken: source.token
  }).then(({ data }) => data as T)

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

export default httpClient
