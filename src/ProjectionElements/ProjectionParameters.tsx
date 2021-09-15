// this component shows all parameters
// at the bottom of the projection
import React, { useState } from 'react'
import { CircularProgress, makeStyles, Theme, Typography } from '@material-ui/core'
import Sliders from './Sliders'
import { PropsForProjection } from './Projection'
import NativeSelect from '@material-ui/core/NativeSelect'

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
  }
}))

type SelectOptions = 500 | 1000 | 2000

export default function ProjectionParameters(props: PropsForProjection) {
  const [isMouseOver, setIsMouseOver] = useState(false)
  const [optionSelected, selectOption] = useState(500 as SelectOptions)
  const classes = useStyles({ width: props.width, isMouseOver: isMouseOver })

  return (
    <div className={classes.absoluteContainer}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}>
      <Sliders {...props} />
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
          <option value={1000}>1000</option>
          <option value={2000}>2000 (slow)</option>
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
