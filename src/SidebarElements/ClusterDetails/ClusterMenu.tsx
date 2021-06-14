import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import { Save } from '@material-ui/icons'
import { createStyles, makeStyles, TextField, Theme, Tooltip } from '@material-ui/core'
import { PropsForSidebar } from '../../Sidebar'
import React, { useEffect, useState } from 'react'

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
