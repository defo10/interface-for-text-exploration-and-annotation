import React, { useState } from "react"
import { CircularProgress, makeStyles, Theme, Typography } from '@material-ui/core'
import SlidersParamter from "./Sliders"
import { PropsFromData } from "../Data"
import { truncate } from "lodash"
import { PropsForProjection } from "./Projection"


const useStyles = makeStyles<Theme, { width: number, isMouseOver: boolean }>(theme => ({
    absoluteContainer: {
        position: 'absolute',
        left: theme.spacing(3),
        bottom: theme.spacing(2),
        padding: theme.spacing(2),
        width: props => (props.width < 1300) ? '19vw' : '14vw',
        opacity: props => props.isMouseOver ? 1.0 : 0.2, // transparent until on mouse over
        transition: 'opacity 0.1s'
    },
    oneLineFlex: {
        display: 'flex',
        alignItems: 'center'
    }
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
            <div className={classes.oneLineFlex}>
                <Typography style={{ flex: '5' }}>
                    Data Points to show:
                </Typography>
                <input name="numDataPoints" type="text" pattern="[0-9]*"
                    style={{ flex: '2 min-content', width: '4em', display: 'inline' }}
                    value={coordinatesToLoad}
                    onChange={(e) => {
                        let size = parseInt(e.target.value) || 0
                        setCoordinatesToLoad(size)
                        setIsReloadingCoordinates(true)
                        props.reloadCoordinatesWithSize(e)
                            .then(() => {
                                setIsReloadingCoordinates(false)
                            })
                    }}
                ></input>
                <CircularProgress
                    style={{ flex: '1', visibility: isReloadingCoordinates ? 'visible' : 'hidden', marginLeft: '8px' }}
                    size='1em' color='secondary' />
            </div>
        </div>
    )
}