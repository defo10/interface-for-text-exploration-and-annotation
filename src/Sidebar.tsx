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
  sidebarContainer: {
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  coverSidebar: {
    width: '100%',
    height: '100%',
    overflow: 'scroll',
    position: 'relative',
    bottom: '0px',
    transition: 'all 0.3s',
    backgroundColor: '#222'
  },
  slideUp: {
    transform: 'translateY(-100%)',
    zIndex: 2,
  }
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
    <div className={classes.sidebarContainer}>
      <div className={classes.coverSidebar}>
        <ClusterMerger {...props} />
        <ClusterOverview {...props} />
      </div>
      <div className={props.selectedCluster == null ? `${classes.coverSidebar}` : `${classes.coverSidebar} ${classes.slideUp}`}>
        <ClusterDetails {...props} key={`${props.selectedCluster}`} />
      </div>
    </div>
  )
}