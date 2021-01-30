import React, { useEffect, useState } from "react";
import { Button, makeStyles, TextField, Toolbar, Typography } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { PropsForSidebar } from "../Sidebar";

const useStyles = makeStyles((theme) => ({
    horizontalContainer: {
        paddingRight: theme.spacing(3),
        paddingLeft: theme.spacing(3),
        paddingTop: '1em',
        paddingBottom: '1em',
        width: '100%',
        height: 'auto'
    },
    flexAlignChildren: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    rightAlign: {
        display: 'block',
        marginLeft: 'auto',
        marginRight: '0'
    }
}));

export default function ClusterMerger(props: PropsForSidebar) {
    const classes = useStyles()
    const [newClusterName, setName] = useState('New Cluster Name')
    const [firstLabel, setFirstLabel] = useState<string | null>(null)
    const [secondLabel, setSecondLabel] = useState<string | null>(null)

    const allClusters = Array.from(new Set(props.labels?.map(label => label.label_kmedoids)))

    const merge = () => {
        if (!firstLabel || !secondLabel) return
        props.renameLabel(firstLabel, newClusterName)
        props.renameLabel(secondLabel, newClusterName)
        setFirstLabel(null)
        setSecondLabel(null)
    }

    const groupByVisibleClusters = (option: string) =>
        (props.clustersToShow?.includes(option))
            ? "Visible Clusters"
            : "Other Clusters"

    /** comparator to sort array by its visibility in the projection */
    const compareByVisibility = (a: string, b: string) => {
        const aGroup = groupByVisibleClusters(a)
        const bGroup = groupByVisibleClusters(b)
        if (aGroup < bGroup) return 1
        else if (aGroup === bGroup) return 0
        else return -1 //(aGroup > bGroup)
    }

    return (
        <>
            <Toolbar>
                <Typography variant="h6">Merge two Clusters</Typography>
            </Toolbar>
            <div className={`${classes.flexAlignChildren} ${classes.horizontalContainer}`}>
                <Autocomplete
                    style={{ flex: '3' }}
                    options={allClusters.filter(cluster => cluster != secondLabel).sort(compareByVisibility)}
                    groupBy={groupByVisibleClusters}
                    renderInput={(params: any) => <TextField {...params} label="First" variant="outlined" />}
                    onChange={(e, value) => setFirstLabel(value!)}
                    value={firstLabel}
                />
                <p style={{ display: 'inline', flex: '1', textAlign: 'center' }}>+</p>
                <Autocomplete
                    style={{ flex: '3' }}
                    options={allClusters.filter(cluster => cluster != firstLabel).sort(compareByVisibility)}
                    groupBy={groupByVisibleClusters}
                    renderInput={(params: any) => <TextField {...params} label="Second" variant="outlined" />}
                    onChange={(e, value) => setSecondLabel(value!)}
                    value={secondLabel}
                />
            </div>
            <div className={`${classes.flexAlignChildren} ${classes.horizontalContainer}`}>
                <p style={{ display: 'inline', flex: '1', textAlign: 'center' }}>=</p>
                <TextField
                    style={{ flex: '3' }}
                    variant='outlined'
                    value={newClusterName}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className={classes.horizontalContainer}>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.rightAlign}
                    onClick={merge}
                    disabled={!(firstLabel && secondLabel)}
                >Merge</Button>
            </div>
        </>
    )
}