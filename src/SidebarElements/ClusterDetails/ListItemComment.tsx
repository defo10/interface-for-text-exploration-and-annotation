import { Button, Divider, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import { DataPoint } from '../../Data'
import { PropsForSidebar } from '../../SidebarOverview'
import ClusterChangeCommentDialog from './ClusterChangeCommentDialog'

export type CommentProps = {
    /** the datapoint to show */
    d: DataPoint
    /** i the the index of the comment in prop data */
    i: number,
    /** callback of cluster change for this comment, or null if not changed */
    onMoveCluster: (newLabel: string | null, i: number) => void,
    /** is the comment the one of the representative */
    isRepresentative?: boolean
} & PropsForSidebar

const useStyles = makeStyles(theme => ({
  inline: {
    display: 'inline'
  },
  // secondary list actions are positioned absolutely in material-ui
  // this style is applied to the other (!) elements if secondary
  // action is used
  secondaryAction: {
    paddingRight: '80px'
  }
}))

export default function ListItemComment (props: CommentProps) {
  const classes = useStyles()
  const [showClusterChangeDialog, setShowClusterChangeDialog] = useState(false)

  const showPoint = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    props.setHoveredCommentCoordinate(props.i)
  }

  const hidePoint = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    props.setHoveredCommentCoordinate(null)
  }

  return (
        <>
            <ListItem key={props.d.i} classes={{ secondaryAction: classes.secondaryAction }}>
                <ListItemText
                    onMouseEnter={showPoint}
                    onMouseLeave={hidePoint}
                    primary={props.d.authorName}
                    secondary={
                        <>
                            <Typography
                                component="span"
                                variant="body2"
                                className={classes.inline}
                                style={{ wordBreak: 'break-word' }}
                            >
                                {`${props.d.publishedAt} - `}
                            </Typography>
                            <Typography
                                component="span"
                                variant="body2"
                                color="textPrimary"
                                style={{ wordBreak: 'break-word' }}
                            >
                                {props.d.cleaned}
                            </Typography>
                        </>
                    }
                />
                <ListItemSecondaryAction>
                    <Button onClick={() => setShowClusterChangeDialog(true)}>Move</Button>
                </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ClusterChangeCommentDialog
                {...props}
                open={showClusterChangeDialog}
                onMoveCluster={(clusterSelected) => {
                  setShowClusterChangeDialog(false)
                  props.onMoveCluster(clusterSelected, props.i)
                }}
                i={props.i}
                data={props.data}
            />
        </>
  )
}
