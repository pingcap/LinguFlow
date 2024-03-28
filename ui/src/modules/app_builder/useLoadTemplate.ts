import { useEffect } from 'react'
import { ConfigAndMetadataUI } from './linguflow.type'

const templateMap: { [k: string]: string } = {
  chatbot: 'ChatGPT3.5_Wrapper'
}

export const useLoadTemplate = () => {
  return async (templateName: string | null): Promise<ConfigAndMetadataUI | undefined> => {
    const exampleName = templateMap[templateName || '']
    if (!exampleName) {
      return
    }

    const file = await import(`../../../examples/${exampleName}.linguflow.yaml`)
    return file.default as ConfigAndMetadataUI
  }
}
