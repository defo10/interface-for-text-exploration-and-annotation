// this component shows both sliders
// for the umap parameters
import Slider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { ParameterMinDist, ParameterNumNeighbors, PropsFromData } from '../Data'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

const useStyles = makeStyles((theme) => ({
  margin: {
    height: theme.spacing(3)
  },
  slider: {
    color: theme.palette.text.primary,
    minWidth: '14em'
  },
  tooltip: {
    fontSize: '0.8em'
  }
}))

const marks_num_neighbors = [
  {
    value: 2,
    label: '2'
  },
  {
    value: 5,
    label: '5'
  },
  {
    value: 10,
    label: '10'
  },
  {
    value: 50,
    label: '50'
  }
]

const marks_min_dist = [
  {
    value: 1,
    label: '0.1'
  },
  {
    value: 2,
    label: '0.2'
  },
  {
    value: 5,
    label: '0.5'
  },
  {
    value: 9,
    label: '0.9'
  }
]

export default function Sliders (props: PropsFromData) {
  const classes = useStyles()

  const numNeighbors = props.coordinatesParameters.numNeighborsParameter
  const minDist = props.coordinatesParameters.minDistParameter

  return (
        <>
            {/* num neighbors */}
            <div style={{ flex: '2 auto', padding: '0 16px', display: 'inline' }}>
                <div>
                    <Typography variant="subtitle2" gutterBottom style={{ display: 'inline' }}>
                        Number of neighbors
                </Typography>
                    <Tooltip
                        title={'The size of local neighborhood (in terms of number of neighboring sample points) used for manifold approximation. Larger values result in more global views of the manifold, while smaller values result in more local data being preserved.'}
                        placement="top"
                        classes={{ tooltip: classes.tooltip }}
                    >
                        <InfoOutlinedIcon style={{ marginLeft: '8px', fontSize: '1em' }} />
                    </Tooltip>
                </div>
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
            </div>
            {/* min dist */}
            <div style={{ flex: '2 auto', padding: '0 16px' }}>
                <div>
                    <Typography variant="subtitle2" gutterBottom style={{ display: 'inline' }}>
                        Minimum distance between points
                </Typography>
                    <Tooltip
                        title={'The effective minimum distance between embedded points. Smaller values will result in a more clustered/clumped embedding where nearby points on the manifold are drawn closer together, while larger values will result on a more even dispersal of points.'}
                        placement="top"
                        classes={{ tooltip: classes.tooltip }}
                    >
                        <InfoOutlinedIcon style={{ marginLeft: '8px', fontSize: '1em' }} />
                    </Tooltip>
                </div>
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
  )
}
