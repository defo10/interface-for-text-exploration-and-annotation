import { PropsForSidebar } from '../../SidebarOverview'
import { ClusterInfo } from '../../Data'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Card, CardContent } from '@material-ui/core'

type PropsMetaInfos = {
    selectedClusterInfo: ClusterInfo
} & PropsForSidebar

const useStyles = makeStyles((theme) => ({
  styleContainer: {
    display: 'block',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}))

export default function MetaInfo (props: PropsMetaInfos) {
  const classes = useStyles()
  const { selectedClusterInfo } = props

  const prct = ((selectedClusterInfo?.size || 0) * 100 / (props.data?.length || 1)).toFixed(2)
  return (
        <Card className={classes.styleContainer}>
            <CardContent>
                <p><b>Size:</b> {selectedClusterInfo?.size || 0} of {props.data?.length} comments in total</p>
                <p><b>Size (in %):</b> {prct} %</p>
                <p><b>Density</b> (lower is better): {selectedClusterInfo?.quality?.toFixed(3) || 0}</p>
            </CardContent>
        </Card>
  )
}
