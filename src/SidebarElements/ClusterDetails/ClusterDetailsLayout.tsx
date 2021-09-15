import React, { useState, useEffect, useRef } from 'react'
import { ChangedClusterName, DataPoint } from '../../Data'
import { PropsForSidebar } from '../../SidebarOverview'
import ClusterMenu from './ClusterMenu'
import Comment from './Comment'
import { makeStyles, Typography } from '@material-ui/core'
import _ from 'lodash'
import List from '@material-ui/core/List'
import ListItemComment from './ListItemComment'

const useStyles = makeStyles(theme => ({
  padding: {
    padding: theme.spacing(2)
  },
  coverSidebar: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'scroll',
    transition: 'all 0.3s',
    backgroundColor: '#222'
  },
  root: {
    width: '100%'
  }
}))

type ClusterDetailsLayoutProps = PropsForSidebar

let prevSelectedCluster: string | null = ''
let prevLabelLocal: string = ''

export default function ClusterDetailsLayout (props: ClusterDetailsLayoutProps) {
  const { data, dataChanged, pushToDataChanged, labels, selected_datum, selectedCluster } = props
  const classes = useStyles()
  const clickedOnCommentRef = useRef<null | HTMLDivElement>(null)
  const [labelLocal, _setLabelLocal] = useState(selectedCluster || '')
  const setLabelLocal = (val: string) => {
    prevLabelLocal = val
    _setLabelLocal(val)

    props.setChangedClusterName({
      original: props.selectedCluster,
      changed: val
    } as ChangedClusterName)
  }
  // select only unchanged data of cluster, without selected point
  const dataOfCluster = data!.filter((d, i) => {
    if (labels === null) return false
    const hasMovedAlready = _.find(dataChanged, ['i', d.i]) // undefined if not found
    const isSelectedDatum = (i === selected_datum)
    const sameCluster = (labels[i].label_kmedoids == selectedCluster)
    return !hasMovedAlready && sameCluster && !isSelectedDatum
  })

  // select all data that was added to this cluster
  const dataAddedToThisCluster = dataChanged.filter(el => el.newLabel.label_kmedoids === selectedCluster)
  // select all data that was removed from this cluster
  const dataRemovedFromThisCluster = dataChanged.filter(el => el.oldLabel.label_kmedoids === selectedCluster)

  useEffect(() => { // if new point or cluster was clicked on, set to that
    if (selectedCluster && prevSelectedCluster && prevSelectedCluster != prevLabelLocal) {
      props.renameLabels([prevSelectedCluster], prevLabelLocal)
    }

    prevLabelLocal = labelLocal
    prevSelectedCluster = selectedCluster
  }, [selectedCluster])

  useEffect(() => { // scroll to selected comment section if point was clicked on projection
    if (clickedOnCommentRef.current) clickedOnCommentRef.current.scrollIntoView({ behavior: 'smooth' })
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
  const buildComments = (data: DataPoint[], type: 'normal' | 'added' | 'removed') => {
    return data.map((element, index) => {
      // eslint-disable-next-line array-callback-return
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

  const hasRepresentative = props.selectedCluster && props.clusters[props.selectedCluster]?.medoid
  const otherRepresentatives = props.selectedCluster && props.clusters[props.selectedCluster]?.representatives.length > 0

  return (
    (selectedCluster)
      ? (<>
                <div ref={clickedOnCommentRef}></div>
                <ClusterMenu labelLocal={labelLocal!} setLabelLocal={setLabelLocal} {...props} />
                {dataAddedToThisCluster.length != 0 && buildHeadlineAndInfo('Added to this Cluster', 'Here are all comments added to this cluster from another by you in this cycle.')}
                {dataAddedToThisCluster.length != 0 && buildComments(dataAddedToThisCluster as DataPoint[], 'added')}
                {dataRemovedFromThisCluster.length != 0 && buildHeadlineAndInfo('Removed from this Cluster', 'Here are all comments removed from this cluster by you in this cycle.')}
                {dataRemovedFromThisCluster.length != 0 && buildComments(dataRemovedFromThisCluster as DataPoint[], 'removed')}
                {selected_datum && (
                    <>
                        {buildHeadlineAndInfo('Selected Comment', 'The comment of the point clicked on.')}
                        <Comment onMoveCluster={onMoveCluster} i={selected_datum} {...props} />
                    </>
                )}
                {hasRepresentative && buildHeadlineAndInfo('Cluster Representative', 'The comment best representing all other comments of this cluster.')}
                {hasRepresentative && <Comment onMoveCluster={onMoveCluster} isRepresentative i={props.clusters[props.selectedCluster!].medoid || 0} {...props} />}
                {otherRepresentatives && buildHeadlineAndInfo('Overview Comments', 'Distinct comments of this cluster, representing different sub-topics of this cluster.')}
                {otherRepresentatives && props.clusters[props.selectedCluster!].representatives.map(
                  reprs_index => (
                        <Comment key={`representative-${reprs_index}`} onMoveCluster={onMoveCluster} i={reprs_index} {...props} />
                  )
                )}
                {buildHeadlineAndInfo('Other Comments', 'A sample of other comments of this cluster.')}
                <List className={classes.root}>
                    {dataOfCluster.slice(0, 20).map((d: DataPoint) =>
                      (<ListItemComment d={d} i={d.i} onMoveCluster={onMoveCluster} key={`list comment ${d.i}`} {...props}/>)
                    )}
                </List>
            </>)
      : <div className={classes.coverSidebar} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography style={{ padding: 16 }}>Click on a point or on a cluster in the left panel to see its details here!</Typography>
            </div>
  )
}
