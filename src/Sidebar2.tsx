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
import { Typography } from '@material-ui/core'

const useStyles = createUseStyles({
    sidebarContainer: {
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'block',
    },
    coverSidebar: {
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'scroll',
        transition: 'all 0.3s',
        backgroundColor: '#222'
    },
    slideUp: {
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

/** this is the rightern panel */
export default function Sidebar2(props: PropsForSidebar) {
    const classes = useStyles()

    return (
        <div className={classes.sidebarContainer}>
            <div className={!props.selectedCluster ? `${classes.coverSidebar}` : `${classes.coverSidebar} ${classes.slideUp}`}>
                <ClusterDetails {...props} key={`${props.selectedCluster}`} />
            </div>
            <div className={classes.coverSidebar} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography style={{padding: 16}}>Click on a point or on a cluster in the left panel to see its details here!</Typography>
            </div>
        </div>
    )
}