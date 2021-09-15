import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { makeStyles, TextField, Theme } from '@material-ui/core'
import { PropsForSidebar } from '../../SidebarOverview'
import React from 'react'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    color: 'white',
    marginLeft: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  },
  colorPrimary: {
    backgroundColor: 'rgba(245, 124, 0, 0.7)' // orange kinda
  }
})
)

type PropsClusterMenu = {
    labelLocal: string,
    setLabelLocal: (newLabel: string) => void
} & PropsForSidebar

export default function ClusterMenu (props: PropsClusterMenu) {
  const classes = useStyles()

  // onChange={(e: any) => props.setLabelLocal(e.target.value)}
  return (
        <AppBar position='relative' color='primary' classes={{ colorPrimary: classes.colorPrimary }} >
            <Toolbar style={{ marginTop: '8px' }}>
                <TextField
                    inputProps={{ style: { fontSize: '1.5em', fontWeight: 600, padding: '8px' } }}
                    variant="outlined"
                    label="Change Cluster Name"
                    value={props.labelLocal}
                    onChange={(e: any) => props.setLabelLocal(e.target.value)}
                />
            </Toolbar>
        </AppBar>
  )
}
