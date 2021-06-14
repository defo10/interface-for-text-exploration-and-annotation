import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import PersonIcon from '@material-ui/icons/Person'
import AddIcon from '@material-ui/icons/Add'
import Typography from '@material-ui/core/Typography'
import { blue } from '@material-ui/core/colors'
import ListSubheader from '@material-ui/core/ListSubheader'
import Data, { Label } from '../../Data'
import { CommentProps } from './Comment'
import _ from 'lodash'

const emails = ['username@gmail.com', 'user02@gmail.com']
const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600]
  }
})

type ClusterChangeCommentDialogProps = {
    open: boolean,
} & CommentProps

export default function ClusterChangeCommentDialog ({
  open,
  data,
  labels,
  clustersToShow,
  clusters,
  onClose,
  i,
  selectedCluster,
  onMoveCluster,
  ...other
}: ClusterChangeCommentDialogProps) {
  const classes = useStyles()

  const remainingClusters = _.without(Object.keys(clusters), ...clustersToShow)

  return (
        <Dialog onClose={() => onMoveCluster(null, i)} aria-labelledby="dialog for changing the cluster of the selected comment" open={open}>
            <DialogTitle>Change Cluster</DialogTitle>
            <List>
                <ListSubheader component="div" id="nested-list-subheader" disableSticky>Selected Cluster</ListSubheader>
                <ListItem onClick={() => onMoveCluster(selectedCluster, i)} button key={`clusterpicker-${-1}`}>
                    <ListItemText primary={selectedCluster} secondary={`size: ${clusters[selectedCluster || '']?.size}    density: ${clusters[selectedCluster || '']?.quality.toFixed(3)}`} />
                </ListItem>
                <ListSubheader component="div" id="nested-list-subheader" disableSticky>Visible Clusters</ListSubheader>
                {
                    clustersToShow.map((cluster: string) => {
                      if (cluster === labels![i].label_kmedoids) return
                      return (
                            <ListItem onClick={() => onMoveCluster(cluster, i)} button key={`clusterpicker-${cluster}`}>
                                <ListItemText primary={cluster} secondary={`size: ${clusters[cluster]?.size || 'N/A'}    density: ${clusters[cluster]?.quality.toFixed(3) || 'N/A'}`} />
                            </ListItem>)
                    })
                }
                <ListSubheader component="div" id="nested-list-subheader" disableSticky>Other Clusters</ListSubheader>
                {
                    remainingClusters.map((cluster: string) => (
                        <ListItem onClick={() => onMoveCluster(cluster, i)} button key={`clusterpicker-${cluster}`}>
                            <ListItemText primary={cluster} secondary={`size: ${clusters[cluster].size}    density: ${clusters[cluster].quality.toFixed(3)}`} />
                        </ListItem>)
                    )
                }
                <ListItem onClick={() => onMoveCluster('new', i)} autoFocus button>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Add to new Cluster" secondary={'The name of the new cluster is "new" by default'}/>
                </ListItem>
            </List>
        </Dialog>
  )
}
