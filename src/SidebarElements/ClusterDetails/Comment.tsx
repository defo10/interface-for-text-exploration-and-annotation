import { Button, Card, CardActions, CardContent, makeStyles } from '@material-ui/core'
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
    onMoveCluster: (newLabel: string | null, i: number) => void
} & PropsForSidebar

const useStyles = makeStyles<any, {backgroundColor: string}>((theme) => ({
    styleContainer: props => ({
        display: 'block',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
        backgroundColor: props.backgroundColor,
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

export default function Comment({ dense = false, data, i, onMoveCluster, added=false, removed=false, ...other }: CommentProps) {
    const backgroundColor: string = added ? '#1d3d17' : removed ? '#3d171b' : "auto" 
    const classes = useStyles({backgroundColor: backgroundColor})
    const { publishedAt, authorName, cleaned } = data![i]
    const [showClusterChangeDialog, setShowClusterChangeDialog] = useState(false)

    const [isBtnVisible, setIsBtnVisible] = useState(false)

    const showBtns = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsBtnVisible(true)
    }

    const hideBtns = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsBtnVisible(false)
    }

    const dataPoint = _.find(other.dataChanged, ['i', i])

    return (
        <Card onMouseEnter={showBtns} onMouseLeave={hideBtns} className={classes.styleContainer}>
            <CardContent>
                {dataPoint && <p style={{marginLeft: 0}} className={classes.styleDate}>{`from cluster ${dataPoint?.oldLabel.label_kmedoids} to ${dataPoint?.newLabel.label_kmedoids}`}</p>}
                <div className={classes.styleMetaInfos}>
                    <p className={classes.styleUsername}>{authorName}</p>
                    <p className={classes.styleDate}>{publishedAt}</p>
                </div>
                <p className={classes.styleComment}>{cleaned}</p>
            </CardContent>
            <CardActions>
                <Button onClick={() => setShowClusterChangeDialog(true)}>Move to other Cluster</Button>
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