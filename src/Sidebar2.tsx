import React from 'react'
import { createUseStyles } from 'react-jss'
import { PropsFromData } from './Data'
import { LayoutState } from './Layout'
import ClusterDetails from './SidebarElements/ClusterDetails'

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
            <div className={classes.coverSidebar}>
                <ClusterDetails {...props} key={`${props.selectedCluster}`} />
            </div>
        </div>
    )
}