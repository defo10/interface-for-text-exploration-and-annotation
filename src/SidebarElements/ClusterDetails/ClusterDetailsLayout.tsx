import React, { useState, useEffect } from 'react'
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


type ClusterDetailsLayoutProps = PropsForSidebar

export default function ClusterDetailsLayout(props: ClusterDetailsLayoutProps) {
    const { data, dataChanged, pushToDataChanged, labels, selected_datum, selectedCluster } = props
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

    const buildHeadline = (headline: string) => (
        <Typography style={{ padding: '5%' }} variant='h5'>{headline}</Typography>
    )

    const hasRepresentative = props.selectedCluster && props.clusters[props.selectedCluster].medoid
    const otherRepresentatives = props.selectedCluster && props.clusters[props.selectedCluster].representatives.length > 0

    return (
        (selectedCluster) ?
            (<>
                <ClusterMenu labelLocal={labelLocal!} setLabelLocal={setLabelLocal} {...props} />
                {dataAddedToThisCluster.length != 0 && buildHeadline('Added to this Cluster')}
                {dataAddedToThisCluster.length != 0 && buildComments(dataAddedToThisCluster as DataPoint[], 'added')}
                {dataRemovedFromThisCluster.length != 0 && buildHeadline('Removed from this Cluster')}
                {dataRemovedFromThisCluster.length != 0 && buildComments(dataRemovedFromThisCluster as DataPoint[], 'removed')}
                {buildHeadline('Cluster-infos')}
                <MetaInfo selectedClusterInfo={props.clusters[selectedCluster]} {...props} />
                {hasRepresentative && buildHeadline('Cluster-Representative')}
                {hasRepresentative && <Comment onMoveCluster={onMoveCluster} i={props.clusters[props.selectedCluster!].medoid || 0} {...props} />}
                {otherRepresentatives && buildHeadline('Overview-Comments')}
                {otherRepresentatives && props.clusters[props.selectedCluster!].representatives.map(
                    reprs_index => (
                        <Comment key={`representative-${reprs_index}`} onMoveCluster={onMoveCluster} i={reprs_index} {...props} />
                    )
                )}
                <div style={{
                    display: 'flex',
                    flexDirection: (props.sidebar_orientation === 'horizontal') ? 'row' : 'column',
                }}
                >
                    {selected_datum && (
                        <>
                            {buildHeadline('Selected Comment')}
                            <Comment onMoveCluster={onMoveCluster} i={selected_datum} {...props} />
                        </>
                    )}
                    {buildHeadline('Other comments')}
                    {buildComments(dataOfCluster, 'normal')}
                </div>
            </>)
            : <p>No Cluster selected</p>
    )
}