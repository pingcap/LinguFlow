import { getHotkeyHandler } from '@mantine/hooks'
import { useEffect, useRef, useState } from 'react'

export const useHotKeyMenu = () => {
  const [menuPosition, setMenuPosition] = useState([0, 0])
  const [hotKeyMenuOpened, setHotKeyMenuOpened] = useState(false)
  const menuStatus = useRef({
    inPane: true,
    // init position without mouse event
    mouseX: window.innerWidth / 3,
    mouseY: window.innerHeight / 4
  })

  const onPaneMouseEnter: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    menuStatus.current.inPane = true
  }
  const onPaneMouseLeave: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    menuStatus.current.inPane = false
  }
  const onPaneMouseMove: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    menuStatus.current.mouseX = e.clientX
    menuStatus.current.mouseY = e.clientY
  }
  const onNodeMouseEnter: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    menuStatus.current.inPane = false
  }
  const onNodeMouseLeave: (event: React.MouseEvent<Element, MouseEvent>) => void = () => {
    menuStatus.current.inPane = true
  }

  const showHotKeyMenu = () => {
    if (!menuStatus.current.inPane) {
      return
    }
    setMenuPosition([menuStatus.current.mouseX, menuStatus.current.mouseY])
    setHotKeyMenuOpened(true)
  }
  const onPaneContextMenu: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    e.preventDefault()
    showHotKeyMenu()
  }
  const onNodeContextMenu: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    e.preventDefault()
  }
  const onEdgeContextMenu: (event: React.MouseEvent<Element, MouseEvent>) => void = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    const showHotKeyMenuHandler = getHotkeyHandler([['Space', showHotKeyMenu]])
    document.body.addEventListener('keyup', showHotKeyMenuHandler)
    return () => document.body.removeEventListener('keyup', showHotKeyMenuHandler)
  }, [])

  return {
    hotKeyMenuOpened,
    setHotKeyMenuOpened,
    menuPosition,
    menuStatus,
    events: {
      onPaneMouseEnter,
      onPaneMouseLeave,
      onPaneMouseMove,
      onPaneContextMenu,
      onNodeMouseEnter,
      onNodeMouseLeave,
      onNodeContextMenu,
      onEdgeContextMenu
    }
  }
}
