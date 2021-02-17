import { Button, Card, CardActions, CardContent, makeStyles } from '@material-ui/core'
import Tooltip from '@material-ui/core/Tooltip'
import _ from 'lodash'
import React, { useState } from 'react'
import { DataPoint } from '../../Data'
import { PropsForSidebar } from '../../Sidebar'
import ClusterChangeCommentDialog from './ClusterChangeCommentDialog'


/**
 * used inside sidebar to display one comment
 * elem is one data point
 */

export type CommentProps = {
    dense?: boolean,
    /** i the the index of the comment in prop data */
    i: number,
    /** callback of cluster change for this comment, or null if not changed */
    onMoveCluster: (newLabel: string | null, i: number) => void,
    /** is the comment the one of the representative */
    isRepresentative?: boolean
} & PropsForSidebar

const useStyles = makeStyles<any, { backgroundColor: string }>((theme) => ({
    styleContainer: props => ({
        display: 'block',
        marginLeft: 0,
        marginRight: 0,
        marginBottom: theme.spacing(1),
        backgroundColor: props.backgroundColor,
        borderRadius: 0,
    }),
    styleMetaInfos: {
        display: 'block',
        width: '100%',
        height: 'auto',
    },
    styleUsername: {
        display: 'inline',
        fontWeight: 'bold'
    },
    styleComment: {
        marginBottom: '0',
        marginTop: '8px'
    },
    styleDate: {
        marginLeft: '8px',
        display: 'inline',
        color: 'LightGray',
        fontStyle: 'italic',
        fontSize: '0.9em'
    },
    btnsContainer: {
        maxHeight: 0,
        overflow: 'hidden',
        transitionDelay: '0.2s',
        transition: 'max-height 0.3s',
        paddingRight: theme.spacing(3),
        paddingLeft: theme.spacing(3),
        width: '100%',
    },
    rightAlign: {
        display: 'block',
        marginLeft: 'auto',
        marginRight: '0'
    },
}))

// styles for card content --> make denser
const useCardContentStyles = makeStyles(theme => ({
    root: {
        paddingTop: 8,
        paddingBottom: 0,
        paddingLeft: 16,
        paddingRight: 16,
    }
}))

export default function Comment({ dense = false, data, i, onMoveCluster, added = false, removed = false, isRepresentative = false, ...other }: CommentProps) {
    const backgroundColor: string = added ? '#1d3d17' : removed ? '#3d171b' : "auto"
    const classes = useStyles({ backgroundColor: backgroundColor })
    const cardContentStyles = useCardContentStyles()
    const { publishedAt, authorName, cleaned } = data![i]
    const [showClusterChangeDialog, setShowClusterChangeDialog] = useState(false)

    const showPoint = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        other.setHoveredCommentCoordinate(i)
    }

    const hidePoint = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        other.setHoveredCommentCoordinate(null)
    }

    const dataPoint = _.find(other.dataChanged, ['i', i])

    return (
        <Card onMouseEnter={showPoint} onMouseLeave={hidePoint} className={classes.styleContainer}>
            <CardContent classes={cardContentStyles}>
                {dataPoint && <p style={{ marginLeft: 0 }} className={classes.styleDate}>{`from cluster ${dataPoint?.oldLabel.label_kmedoids} to ${dataPoint?.newLabel.label_kmedoids}`}</p>}
                <div className={classes.styleMetaInfos}>
                    <p className={classes.styleUsername}>{authorName}</p>
                    <p className={classes.styleDate}>{publishedAt}</p>
                </div>
                <p className={classes.styleComment}>{cleaned}</p>
            </CardContent>
            <CardActions>
                {isRepresentative
                    ? (<Tooltip title="As this comment represents the whole cluster, it may not be moved. Use the Merge Clusters Field to merge the whole cluster with another.">
                        <span><Button onClick={() => null} disabled>Move to other Cluster</Button></span>
                    </Tooltip>)
                    : <Button onClick={() => setShowClusterChangeDialog(true)}>Move to other Cluster</Button>
                }
            </CardActions>
            <ClusterChangeCommentDialog
                open={showClusterChangeDialog}
                onMoveCluster={(clusterSelected) => {
                    setShowClusterChangeDialog(false)
                    onMoveCluster(clusterSelected, i)
                }}
                i={i}
                data={data}
                {...other}
            />
        </Card>
    )
}