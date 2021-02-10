import React, { Component, useState } from 'react'
import { NumNeighbors, PropsFromData, num_neighbors_arr, ParameterNumNeighbors, ParameterMinDist } from '../Data'
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Toolbar from '@material-ui/core/Toolbar';

const useStyles = makeStyles((theme) => ({
    root: {

    },
    margin: {
        height: theme.spacing(3),
    },
    slider: {
        color: theme.palette.text.primary
    }
}));

const marks_num_neighbors = [
    {
        value: 2,
        label: '2',
    },
    {
        value: 5,
        label: '5',
    },
    {
        value: 10,
        label: '10',
    },
    {
        value: 50,
        label: '50',
    },
]

const marks_min_dist = [
    {
        value: 1,
        label: '0.1',
    },
    {
        value: 2,
        label: '0.2',
    },
    {
        value: 5,
        label: '0.5',
    },
    {
        value: 9,
        label: '0.9',
    },
]

export default function SlidersParamter(props: PropsFromData) {
    const classes = useStyles()

    const numNeighbors = props.coordinatesParameters.numNeighborsParameter
    const minDist = props.coordinatesParameters.minDistParameter

    return (
        <>
            <div className={classes.root}>
                {/* num neighbors*/}
                <Typography variant="subtitle2" gutterBottom> 
                    Number of neighbors
                </Typography>
                <Slider
                    getAriaValueText={(val) => `${val}`}
                    aria-labelledby="number of neighbors for underyling umap algorithm"
                    step={null}
                    marks={marks_num_neighbors}
                    min={2}
                    max={50}
                    value={parseInt(numNeighbors)}
                    onChange={(event, val) => {
                        if (props.coordinatesParameters.numNeighborsParameter === (`${val}` as ParameterNumNeighbors)) return
                        props.setSelectedCoordinates(`${val}` as ParameterNumNeighbors, minDist)
                    }}
                    className={classes.slider}
                />
                {/* min dist*/}
                <Typography variant="subtitle2" gutterBottom>
                    Minimum distance between points
                </Typography>
                <Slider
                    getAriaValueText={(val) => `${val}`}
                    aria-labelledby="number of mininum distances for underyling umap algorithm"
                    step={null}
                    marks={marks_min_dist}
                    min={1}
                    max={9}
                    value={parseInt(minDist.split('.')[1])} // e.g. '0.1' to 1
                    onChange={(event, val: number | number[]) => {
                        if (props.coordinatesParameters.minDistParameter === (`0.${val}` as ParameterMinDist)) return
                        props.setSelectedCoordinates(numNeighbors, `0.${val}` as ParameterMinDist)
                    }}
                    className={classes.slider}
                />
            </div>
        </>
    );
}