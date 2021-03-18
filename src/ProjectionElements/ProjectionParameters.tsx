import React, { useState } from "react"
import { CircularProgress, makeStyles, Select, Theme, Typography } from '@material-ui/core'
import SlidersParamter from "./Sliders"
import { PropsFromData } from "../Data"
import { truncate } from "lodash"
import { PropsForProjection } from "./Projection"
import NativeSelect from "@material-ui/core/NativeSelect"


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

type SelectOptions = 500 | 4000 | 30000

export default function ProjectionParameters(props: PropsForProjection) {
    const [isMouseOver, setIsMouseOver] = useState(false)
    const [optionSelected, selectOption] = useState(4000 as SelectOptions)
    const classes = useStyles({ width: props.width, isMouseOver: isMouseOver })

    /*
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
    */
   
    console.log("dis happening")

    return (
        <div className={classes.absoluteContainer}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}>
            <SlidersParamter {...props} />
            <div style={{ padding: '0 16px' }}>
                <Typography variant="subtitle2" style={{ display: 'inline', paddingRight: '16px' }}>
                    Sample Size of Comments to Visualize
                </Typography>
                <NativeSelect
                    value={optionSelected}
                    onChange={(e) => {
                        const size = parseInt(e.target.value) || 0
                        selectOption(size as SelectOptions)
                        props.reloadCoordinatesWithSize(size)
                    }}
                >
                    <option value={500}>500</option>
                    <option value={4000}>4000</option>
                    <option value={30000}>30000 (slow)</option>
                </NativeSelect>
                {props.coordsAreReloading &&
                    <CircularProgress style={{
                        display: 'inline-block', marginLeft: '8px'
                    }} size="1em"></CircularProgress>
                }
            </div>
        </div>
    )
}
