import React, { useEffect, useState } from "react";
import { Button, makeStyles, TextField, Toolbar, Tooltip, Typography } from "@material-ui/core";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { PropsForSidebar } from "../Sidebar";

const useStyles = makeStyles((theme) => ({
    horizontalContainer: {
        paddingRight: theme.spacing(3),
        paddingLeft: theme.spacing(3),
        paddingTop: '1em',
        paddingBottom: '1em',
        width: 'auto',
        height: 'auto'
    },
    rightAlign: {
        display: 'block',
        marginLeft: 'auto',
        marginRight: '0'
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '9fr 1fr',
        gridRowGap: theme.spacing(1)
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
        props.renameLabels([firstLabel, secondLabel], newClusterName)
        props.setSelectedDatum(null)
        props.selectCluster(newClusterName)
        if (!props.clustersToShow.includes(newClusterName)) {
            props.setClustersToShow([...props.clustersToShow, newClusterName])
        }
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
            <div className={classes.gridContainer}>
                <Autocomplete
                    options={allClusters.filter(cluster => cluster != secondLabel).sort(compareByVisibility)}
                    groupBy={groupByVisibleClusters}
                    renderInput={(params: any) => <TextField {...params} label="First" variant="outlined" />}
                    onChange={(e, value) => setFirstLabel(value!)}
                    value={firstLabel}
                />
                <p style={{ textAlign: 'center' }}>+</p>
                <Autocomplete
                    options={allClusters.filter(cluster => cluster != firstLabel).sort(compareByVisibility)}
                    groupBy={groupByVisibleClusters}
                    renderInput={(params: any) => <TextField {...params} label="Second" variant="outlined" />}
                    onChange={(e, value) => setSecondLabel(value!)}
                    value={secondLabel}
                />
                <p style={{ textAlign: 'center' }}>=</p>
                <TextField
                    variant='outlined'
                    value={newClusterName}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className={classes.horizontalContainer}>
                <Button
                    className={classes.rightAlign}
                    variant="contained"
                    color="primary"
                    onClick={merge}
                    disabled={!(firstLabel && secondLabel)}
                >Merge</Button>
            </div>
        </>
    )
}