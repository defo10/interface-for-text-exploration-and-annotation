import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { ArrowBack } from '@material-ui/icons';
import { createStyles, makeStyles, TextField, Theme } from '@material-ui/core';
import { PropsForSidebar } from '../../Sidebar'
import React from 'react';


const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    }
})
);

type PropsClusterMenu = {
    labelLocal: string,
    setLabelLocal: (newLabel: string) => void
} & PropsForSidebar

export default function ClusterMenu(props: PropsClusterMenu) {
    const classes = useStyles()

    const handleArrowBack = () => {
        if (props.selectedCluster! != props.labelLocal) props.renameLabels([props.selectedCluster!], (props.labelLocal || "N/A"))
        props.selectCluster(null)
        props.setLabelLocal("")
        props.setSelectedDatum(null)
    }

    return (
        <AppBar position='relative' color='transparent'>
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton}
                    color="inherit" aria-label="menu" onClick={handleArrowBack}>
                    <ArrowBack />
                </IconButton>
                <TextField
                    inputProps={{ style: { fontSize: '1.5em', fontWeight: 600, padding: '8px'}}}
                    variant="filled"
                    value={props.labelLocal}
                    onChange={(e: any) => props.setLabelLocal(e.target.value)}
                />
            </Toolbar>
        </AppBar>
    )
}