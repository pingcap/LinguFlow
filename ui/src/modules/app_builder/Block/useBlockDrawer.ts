import { createContext, useContext, useEffect, useRef } from 'react'

interface DrawerControllerProps {
  closeDrawerHub: (() => void)[]
}

const DrawerControllerContext = createContext<DrawerControllerProps>({ closeDrawerHub: [] })

export const useRegisterCloseDrawer = (closeDrawer: () => void) => {
  const controller = useContext(DrawerControllerContext)
  const register = useRef(() => controller.closeDrawerHub.push(closeDrawer))
  const unregister = useRef(
    () => (controller.closeDrawerHub = controller.closeDrawerHub.filter((c) => c !== closeDrawer))
  )
  useEffect(() => {
    const ur = unregister.current
    register.current()
    return () => {
      ur()
    }
  }, [])
}

export const useCloseAllDrawer = () => {
  const controller = useContext(DrawerControllerContext)
  return () => controller.closeDrawerHub.forEach((c) => c())
}
