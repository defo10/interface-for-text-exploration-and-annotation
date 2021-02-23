import React, { useState } from "react"
import { CircularProgress, makeStyles, Theme, Typography } from '@material-ui/core'
import SlidersParamter from "./Sliders"
import { PropsFromData } from "../Data"
import { truncate } from "lodash"
import { PropsForProjection } from "./Projection"


const useStyles = makeStyles<Theme, { width: number, isMouseOver: boolean }>(theme => ({
    absoluteContainer: {
        position: 'absolute',
        margin: `0 ${theme.spacing(1)}`,
        bottom: theme.spacing(2),
        opacity: props => props.isMouseOver ? 1.0 : 0.2, // transparent until on mouse over
        transition: 'opacity 0.1s',
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%'
    },
}))

export default function ProjectionParameters(props: PropsForProjection) {
    const [isMouseOver, setIsMouseOver] = useState(false)
    const [isReloadingCoordinates, setIsReloadingCoordinates] = useState(false)
    const [coordinatesToLoad, setCoordinatesToLoad] = useState(props.coordinates_to_show)
    const classes = useStyles({ width: props.width, isMouseOver: isMouseOver })

    return (
        <div className={classes.absoluteContainer}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}>
            <SlidersParamter {...props} />
            <div style={{padding: '0 16px'}}>
                <Typography variant="subtitle2" style={{ display: 'inline', paddingRight: '16px' }}>
                    Sample Size of Comments to Visualize
                </Typography>
                <input name="numDataPoints" type="text" pattern="[0-9]*"
                    style={{ width: '4em', display: 'inline' }}
                    value={coordinatesToLoad}
                    onChange={(e) => {
                        let size = parseInt(e.target.value) || 0
                        setCoordinatesToLoad(size)
                        setIsReloadingCoordinates(true)
                        props.reloadCoordinatesWithSize(e, () => {
                            setIsReloadingCoordinates(false)
                        })
                    }}
                ></input>
                <CircularProgress style={{
                    visibility: isReloadingCoordinates ? 'visible' : 'hidden',
                    display: 'inline-block', marginLeft: '8px'}} size="1em"></CircularProgress>
            </div>
        </div>
    )
}