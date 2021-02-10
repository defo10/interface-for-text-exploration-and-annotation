import React, { useState, useEffect, useRef } from 'react'
import { DataPoint, Label } from '../../Data'
import { PropsForSidebar } from '../../Sidebar'
import Separator from '../Separator'
import ClusterMenu from './ClusterMenu'
import MetaInfo from './MetaInfo'
import Comment from './Comment'
import NeoMorphCard from './NeoMorphCard'
import { Box, Card, CardContent, makeStyles, Typography } from '@material-ui/core'
import ClusterChangeCommentDialog from './ClusterChangeCommentDialog'
import _ from 'lodash'
import { index } from 'd3'

const useStyles = makeStyles(theme => ({
    padding: {
        padding: theme.spacing(2),
    }
}))

type ClusterDetailsLayoutProps = PropsForSidebar

export default function ClusterDetailsLayout(props: ClusterDetailsLayoutProps) {
    const { data, dataChanged, pushToDataChanged, labels, selected_datum, selectedCluster } = props
    const classes = useStyles()
    const clickedOnCommentRef = useRef<null | HTMLDivElement>(null)
    const [labelLocal, setLabelLocal] = useState(selectedCluster || "")
    // select only unchanged data of cluster, without selected point
    const dataOfCluster = data!.filter((d, i) => {
        if (labels === null) return false
        const hasChangedAlready = _.find(dataChanged, ['i', d.i]) // undefined if not found
        const isSelectedDatum = (i === selected_datum)
        const sameCluster = (labels[i].label_kmedoids == selectedCluster)
        return !hasChangedAlready && sameCluster && !isSelectedDatum
    })
    // select all data that was added to this cluster
    const dataAddedToThisCluster = dataChanged.filter(el => el.newLabel.label_kmedoids === selectedCluster)
    // select all data that was removed from this cluster
    const dataRemovedFromThisCluster = dataChanged.filter(el => el.oldLabel.label_kmedoids === selectedCluster)

    useEffect(() => {
        if (selectedCluster) {
            setLabelLocal(selectedCluster)
        }
    }, [selectedCluster])

    useEffect(() => { // scroll to selected comment section if point was clicked on projection 
        if (clickedOnCommentRef.current) clickedOnCommentRef.current.scrollIntoView({behavior: 'smooth'})
    }, [selected_datum])

    const onMoveCluster = (newLabel: string | null, i: number) => {
        if (!newLabel || !labels) return
        pushToDataChanged({
            ...data![i],
            oldLabel: labels[i],
            newLabel: { label_kmedoids: newLabel }
        })
    }

    /**
     * 
     * @param data 
     * @param type "normal" | "added" | "removed"
     */
    const buildComments = (data: DataPoint[], type: 'normal' | "added" | "removed") => {
        return data.map((element, index) => {
            if (index > 20) return
            return (
                <Comment onMoveCluster={onMoveCluster} i={element.i} key={`cluster-peer-${index}`}
                    {...type === 'added' ? { added: true } : type === 'removed' ? { removed: true } : {}}
                    {...props} dense />
            )
        })
    }

    const buildHeadlineAndInfo = (headline: string, caption: string | null) => (
        <div className={classes.padding}>
            <Typography variant='h5'>{headline}</Typography>
            {caption &&
                <Typography variant="body2">{caption}</Typography>
            }
        </div>
    )

    const hasRepresentative = props.selectedCluster && props.clusters[props.selectedCluster].medoid
    const otherRepresentatives = props.selectedCluster && props.clusters[props.selectedCluster].representatives.length > 0

    return (
        (selectedCluster) ?
            (<>
                <div ref={clickedOnCommentRef}></div>
                <ClusterMenu  labelLocal={labelLocal!} setLabelLocal={setLabelLocal} {...props} />
                {dataAddedToThisCluster.length != 0 && buildHeadlineAndInfo('Added to this Cluster', 'Here are all comments added to this cluster from another by you in this cycle.')}
                {dataAddedToThisCluster.length != 0 && buildComments(dataAddedToThisCluster as DataPoint[], 'added')}
                {dataRemovedFromThisCluster.length != 0 && buildHeadlineAndInfo('Removed from this Cluster', 'Here are all comments removed from this cluster by you in this cycle.')}
                {dataRemovedFromThisCluster.length != 0 && buildComments(dataRemovedFromThisCluster as DataPoint[], 'removed')}
                {buildHeadlineAndInfo('Cluster-infos', 'Meta-information about the cluster you selected.')}
                <MetaInfo selectedClusterInfo={props.clusters[selectedCluster]} {...props} />
                {selected_datum && (
                    <>
                    {buildHeadlineAndInfo('Selected Comment', 'The comment of the point clicked on.')}
                    <Comment onMoveCluster={onMoveCluster} i={selected_datum} {...props} />
                    </>
                )}
                {hasRepresentative && buildHeadlineAndInfo('Cluster-Representative', 'The most centrally located point in the cluster.')}
                {hasRepresentative && <Comment onMoveCluster={onMoveCluster} i={props.clusters[props.selectedCluster!].medoid || 0} {...props} />}
                {otherRepresentatives && buildHeadlineAndInfo('Overview-Comments', 'Four distinct comments of this cluster, giving an overview of all comments of this cluster.')}
                {otherRepresentatives && props.clusters[props.selectedCluster!].representatives.map(
                    reprs_index => (
                        <Comment key={`representative-${reprs_index}`} onMoveCluster={onMoveCluster} i={reprs_index} {...props} />
                    )
                )}
                {buildHeadlineAndInfo('Other comments', 'A sample of other comments of this cluster.')}
                {buildComments(dataOfCluster, 'normal')}
            </>)
            : <p>No Cluster selected</p>
    )
}