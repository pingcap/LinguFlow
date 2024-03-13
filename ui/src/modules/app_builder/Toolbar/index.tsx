import { Box, DefaultMantineColor, Group, HoverCard, StyleProp, Text, useMantineTheme } from '@mantine/core'
import { IconBug, IconInfoCircle } from '@tabler/icons-react'
import React, { PropsWithChildren, useState } from 'react'

import 'reactflow/dist/style.css'
import { ApplicationInfo, ApplicationVersionInfo, InteractionInfo } from '@api/linguflow.schemas'
import classes from './index.module.css'
import { Pane, TabValue } from './Pane'

export const TOOLBAR_HEIGHT = 30
export const TOOLBAR_PANE_HEIGHT = 260

export const Toolbar: React.FC<{
  app?: ApplicationInfo
  ver?: ApplicationVersionInfo
  toolbarPaneOpened: boolean
  setToolbarPaneOpened: React.Dispatch<React.SetStateAction<boolean>>
  isCreatingVersion: boolean
  onUpdateCurrentInteraction: (interaction?: InteractionInfo) => void
}> = ({ app, ver, toolbarPaneOpened, setToolbarPaneOpened, isCreatingVersion, onUpdateCurrentInteraction }) => {
  const { colors } = useMantineTheme()
  const [tab, setTab] = useState<TabValue>(TabValue.DEBUG)

  return (
    <Box h={TOOLBAR_HEIGHT + (toolbarPaneOpened ? TOOLBAR_PANE_HEIGHT : 0)}>
      {toolbarPaneOpened && (
        <Pane
          tab={tab}
          setTab={setTab}
          setToolbarPaneOpened={setToolbarPaneOpened}
          app={app}
          ver={ver}
          isCreatingVersion={isCreatingVersion}
          onUpdateCurrentInteraction={onUpdateCurrentInteraction}
        />
      )}

      <Group justify="space-between" style={(theme) => ({ borderTop: `1px solid ${theme.colors.gray[1]}` })}>
        <ToolbarButton
          tooltip="Debug"
          bg="gray.2"
          onClick={() => {
            setTab(TabValue.DEBUG)
            if (tab === TabValue.DEBUG || !toolbarPaneOpened) {
              setToolbarPaneOpened((v) => !v)
            }
          }}
        >
          <IconBug style={{ width: '80%', height: '80%', color: colors.gray[9] }} stroke={1} />
        </ToolbarButton>
        <Group gap="xs" pr="sm">
          {app && ver && (
            <>
              <Box>
                <Text span fw="bold" c="gray.9" size="xs">
                  {app.name}
                </Text>
                /
                <Text span c="gray.9" size="xs">
                  {ver.id}
                </Text>
              </Box>
              <ToolbarButton
                tooltip="Information"
                onClick={() => {
                  setTab(TabValue.APP_INFO)
                  if (tab === TabValue.APP_INFO || !toolbarPaneOpened) {
                    setToolbarPaneOpened((v) => !v)
                  }
                }}
              >
                <IconInfoCircle style={{ width: '80%', height: '80%', color: colors.gray[9] }} stroke={1} />
              </ToolbarButton>
            </>
          )}
        </Group>
      </Group>
    </Box>
  )
}

const ToolbarButton: React.FC<
  PropsWithChildren<{
    tooltip?: string
    bg?: StyleProp<DefaultMantineColor>
    w?: StyleProp<React.CSSProperties['width']>
    onClick?: () => void
  }>
> = ({ children, tooltip, bg, w, onClick }) => {
  return (
    <HoverCard disabled={!tooltip} withArrow position="top" openDelay={500} shadow="xs" offset={2}>
      <HoverCard.Target>
        <Group
          justify="center"
          align="center"
          p={4}
          w={w || TOOLBAR_HEIGHT * 1.3}
          h={TOOLBAR_HEIGHT}
          c="gray.9"
          bg={bg || '#fff'}
          className={classes.toolbar_button}
          onClick={onClick}
        >
          {children}
        </Group>
      </HoverCard.Target>
      <HoverCard.Dropdown px={8} py={4}>
        <Text size="xs">{tooltip}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}