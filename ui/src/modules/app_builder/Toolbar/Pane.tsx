import React from 'react'
import { ActionIcon, Tabs } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { ApplicationInfo, ApplicationVersionInfo } from '@api/linguflow.schemas'
import { Debug } from '../Debug'
import { AppInfo } from './AppInfo'
import { TOOLBAR_HEIGHT } from '.'

const TAB_HEIGHT = 36

export enum TabValue {
  DEBUG = 'debug',
  APP_INFO = 'app_info'
}

export const Pane: React.FC<{
  tab: TabValue
  setTab: React.Dispatch<React.SetStateAction<TabValue>>
  setToolbarPaneOpened: React.Dispatch<React.SetStateAction<boolean>>
  app?: ApplicationInfo
  ver?: ApplicationVersionInfo
}> = ({ tab, setTab, setToolbarPaneOpened, app, ver }) => {
  return (
    <Tabs
      value={tab}
      onChange={(t) => setTab(t as TabValue)}
      variant="outline"
      color="gray"
      h={`calc(100% - ${TOOLBAR_HEIGHT}px)`}
      radius={0}
      style={(theme) => ({ borderTop: `1px solid ${theme.colors.gray[2]}` })}
    >
      <Tabs.List>
        <Tabs.Tab value={TabValue.DEBUG} style={{ borderTop: 'none' }}>
          Debug
        </Tabs.Tab>
        <Tabs.Tab value={TabValue.APP_INFO} style={{ borderTop: 'none' }}>
          App Info
        </Tabs.Tab>

        <ActionIcon
          size="sm"
          variant="subtle"
          c="gray"
          style={{ position: 'absolute', right: 7, top: 7 }}
          onClick={() => setToolbarPaneOpened(false)}
        >
          <IconX size="1rem" />
        </ActionIcon>
      </Tabs.List>

      <Tabs.Panel value={TabValue.DEBUG} h={`calc(100% - ${TAB_HEIGHT}px)`} p="xs" style={{ overflowY: 'auto' }}>
        <Debug />
      </Tabs.Panel>

      <Tabs.Panel value={TabValue.APP_INFO} h={`calc(100% - ${TAB_HEIGHT}px)`} p="xs" style={{ overflowY: 'auto' }}>
        <AppInfo app={app} ver={ver} />
      </Tabs.Panel>
    </Tabs>
  )
}
