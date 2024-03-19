import {
  useCreateAppVersionApplicationsApplicationIdVersionsPost,
  useUpdateAppVersionMetaApplicationsApplicationIdVersionsVersionIdPut
} from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import { useReactFlow } from 'reactflow'
import { useFormContext } from 'react-hook-form'
import dayjs from 'dayjs'
import { ApplicationVersionInfo, GraphEdge } from '@api/linguflow.schemas'
import { useEffect, useState } from 'react'
import { BLOCK_PORT_ID_NULL } from './Block/useValidConnection'

const getCurrentDateTimeName = () => `v${dayjs().format('YYYY-MM-DD')}.${dayjs().unix()}`

export const useCreateVersion = (version?: ApplicationVersionInfo) => {
  const { appId, verId } = useParams()
  const navigate = useNavigate()
  const { getNodes, getEdges } = useReactFlow()
  const { getValues, resetField } = useFormContext()
  const { mutateAsync: _createVersion, isLoading } = useCreateAppVersionApplicationsApplicationIdVersionsPost()

  const [canSave, setCanSave] = useState(false)
  const createVersion = async () => {
    if (!canSave) {
      return
    }

    const { id } = await _createVersion({
      applicationId: appId!,
      data: {
        parentId: verId,
        name: getCurrentDateTimeName(),
        configuration: {
          nodes: Object.values(getValues()),
          edges: getEdges().map(
            (e) =>
              ({
                src_block: e.source,
                dst_block: e.target,
                dst_port: e.targetHandle === BLOCK_PORT_ID_NULL ? null : e.targetHandle!,
                alias: e.data?.alias,
                case: e.data?.case
              } as GraphEdge)
          )
        },
        metadata: {
          ...version?.metadata,
          ui: {
            // viewport: getViewport(),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            nodes: getNodes().map(({ data, ...n }) => n)
          }
        }
      }
    })

    Object.keys(getValues()).forEach((k) => resetField(k))
    setCanSave(false)
    if (verId) {
      navigate(`../${id}`, { replace: true, relative: 'path' })
    } else {
      navigate(`./${id}`, { replace: true, relative: 'path' })
    }
  }

  return { createVersion, isCreatingVersion: isLoading, canSave, setCanSave }
}

export const useUpdateVersion = (version?: ApplicationVersionInfo) => {
  const { appId, verId } = useParams()
  const { getNodes } = useReactFlow()
  const { mutateAsync: _updateVersion, isLoading } =
    useUpdateAppVersionMetaApplicationsApplicationIdVersionsVersionIdPut()
  const [canUpdate, setCanUpdate] = useState(false)
  const updateVersion = async (name?: string, force?: boolean) => {
    if (!canUpdate && !force) {
      return
    }

    await _updateVersion({
      applicationId: appId!,
      versionId: verId!,
      data: {
        name: name || version?.name || getCurrentDateTimeName(),
        metadata: {
          ...version?.metadata,
          ui: {
            // viewport: getViewport(),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            nodes: getNodes().map(({ data, ...n }) => n)
          }
        }
      }
    })
    setCanUpdate(false)
  }

  useEffect(() => {
    setCanUpdate(false)
  }, [version])

  return { updateVersion, isUpdatingVersion: isLoading, canUpdate, setCanUpdate }
}
