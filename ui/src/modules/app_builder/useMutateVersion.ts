import {
  useCreateAppVersionApplicationsApplicationIdVersionsPost,
  useUpdateAppVersionMetaApplicationsApplicationIdVersionsVersionIdPut
} from '@api/linguflow'
import { useNavigate, useParams } from 'react-router-dom'
import { useReactFlow } from 'reactflow'
import { useFormContext } from 'react-hook-form'
import dayjs from 'dayjs'
import { ApplicationVersionInfo } from '@api/linguflow.schemas'
import { useState } from 'react'

const INIT_V = 1
const getDigitsNum = (num: number) => (num / 10000).toFixed(4).split('.')[1]
const getCurrentDateTimeName = () => `v${dayjs().format('YYYY-MM-DD')}.${getDigitsNum(INIT_V)}`
const autoName = (prevName: string) => {
  const nameArr = prevName.split('.')
  const lastSegmentOfName = nameArr[nameArr.length - 1]
  if (!lastSegmentOfName || Number.isNaN(Number(lastSegmentOfName))) {
    return `${nameArr.join('.')}.${getDigitsNum(INIT_V)}`
  }
  return `${nameArr.slice(0, nameArr.length - 1).join('.')}.${getDigitsNum(Number(lastSegmentOfName) + 1)}`
}

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
        name: version?.name ? autoName(version.name) : getCurrentDateTimeName(),
        configuration: {
          nodes: Object.values(getValues()),
          edges: getEdges().map((e) => ({
            src_block: e.source,
            dst_block: e.target,
            dst_port: e.targetHandle!,
            alias: e.data?.alias,
            case: e.data?.case
          }))
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

  return { updateVersion, isUpdatingVersion: isLoading, canUpdate, setCanUpdate }
}
