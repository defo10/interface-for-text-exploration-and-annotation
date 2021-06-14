import React from 'react'
import { createUseStyles } from 'react-jss'
import { PropsFromData } from './Data'
import { LayoutState } from './Layout'
import ClusterOverview from './SidebarElements/ClusterOverview/ClusterOverview'

const buildStyles = createUseStyles({
  sidebarContainerLeft: {
    width: '100%',
    height: '100vh',
    overflow: 'scroll'
  }
})

export type PropsForSidebar = {
  sidebar_orientation: string,
  selected_datum: number | null,
  selectedCluster: string | null,
  selectCluster: (newSelectedCluster: string) => void,
  setSelectedDatum: (newDatumIndex: number | null) => void,
} & LayoutState & PropsFromData

export default function Sidebar (props: PropsForSidebar) {
  const classes = buildStyles()

  return (
    <div className={classes.sidebarContainerLeft}>
      <div style={{ overflow: 'scroll' }}>
        <ClusterOverview {...props} />
      </div>
    </div>
  )
}
