import React, { Component } from 'react'
import Comment from './SidebarElements/ClusterDetails/Comment'
import Separator from './SidebarElements/Separator'
import Select from './SidebarElements/Select'
import ClusterMerger from './SidebarElements/ClusterMerger'
import ClusterOverview, { PropsForClusterOverview } from './SidebarElements/ClusterOverview/ClusterOverview'
import ClusterDetails from './SidebarElements/ClusterDetails'
import { PropsFromData, DataPoint } from './Data'
import SlidersParamter from './ProjectionElements/Sliders'
import { LayoutState } from './Layout'
import { createUseStyles } from 'react-jss'

const buildStyles = createUseStyles({
  sidebarContainerLeft: {
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
})

export type PropsForSidebar = {
  sidebar_orientation: string,
  selected_datum: number | null,
  selectedCluster: string | null,
  selectCluster: (newSelectedCluster: string | null) => void,
  setSelectedDatum: (newDatumIndex: number | null) => void,
} & LayoutState & PropsFromData

export default function Sidebar(props: PropsForSidebar) {
  const classes = buildStyles()

  return (
    <div className={classes.sidebarContainerLeft}>
      <div style={{overflow: 'scroll'}}>
        <ClusterOverview {...props} />
      </div>
    </div>
  )
}