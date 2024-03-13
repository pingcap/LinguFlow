import { createContext, useContext } from 'react'

const ContainerElemContext = createContext<HTMLDivElement | null>(null)

export const ContainerElemProvider = ContainerElemContext.Provider

export const useContainerElem = () => useContext(ContainerElemContext)!
