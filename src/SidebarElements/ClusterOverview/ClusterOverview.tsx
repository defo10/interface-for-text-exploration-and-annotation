import React, { SetStateAction, useState } from 'react'
import ClusterSnippet from './ClusterSnippet'
import ClusterTable from './ClusterTable'
import { PropsForSidebar } from '../../Sidebar'
import ClusterMerger from '../ClusterMerger'
import { DataPoint } from '../../Data'
import { Accordion, AccordionDetails, AccordionSummary, Card, makeStyles, Tooltip, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import CardContent from '@material-ui/core/CardContent'

export type PropsForClusterOverview = PropsForSidebar

const useStyles = makeStyles(theme => ({
  padding: {
    padding: theme.spacing(2)
  },
  marginCard: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  rightMargin: {
    marginRight: theme.spacing(2)
  },
  root: { // accordion
    margin: theme.spacing(2)
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary
  },
  tootltip: {
    fontSize: '0.8em'
  }
}))

/**
 *
 * @param comments is the subset of the data which has label @param label
 * @param label is the label of said comments
 */
export default function ClusterOverview (props: PropsForClusterOverview) {
  const classes = useStyles()
  const expandSentence = 'Click to expand'
  const minimizeSentence = 'Click to minimize'
  const [mergeExplainer, setMergeExplainer] = useState<string>(expandSentence)

  const buildHeadlineAndInfo = (headline: string, caption: string | null) => (
        <div className={classes.padding}>
            <Typography variant='h5'>{headline}</Typography>
            {caption &&
                <Typography variant="body2">{caption}</Typography>
            }
        </div>
  )

  const legend = (
        <div className={classes.padding}>
            <Typography variant='body2' style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '8px' }}>Checked cluster comments are white in the visualization</Typography>
            <Typography variant='body2' style={{ backgroundColor: 'rgba(245, 124, 0, 0.7)', padding: '8px' }}>The selected cluster's comments are orange in the visualization</Typography>
        </div>)

  const metaInfo = (
        <Card
            variant="outlined"
            className={classes.marginCard}
        >
            <CardContent>
                <Typography variant="body1" gutterBottom>
                    {`Comments in total: ${props.labels?.length || 'undefined'}`}
                </Typography>
                <Typography variant="body1">
                    {`Number of clusters: ${Object.keys(props.clusters).length || 'undefined'}`}
                </Typography>
            </CardContent>
        </Card>
  )

  const whatAmISeeingTooltip = (
        <Tooltip
        title="This is a list of all clusters. Grey entries (checked checkbox) are currently visible in the visualization. The cluster seen in the details pane (right) is highlighted orange."
        placement="bottom-end"
        classes={{ tooltip: classes.tootltip }}
        >
            <Typography
                align="right"
                variant="subtitle2"
                className={classes.rightMargin}
            >
                What am I seeing here?
            </Typography>
        </Tooltip>
  )

  return (
        <>
            <Accordion className={classes.root} onChange={() => {
              if (mergeExplainer === expandSentence) {
                setMergeExplainer(minimizeSentence)
              } else {
                setMergeExplainer(expandSentence)
              }
            }}>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls="cluster merger"
                    id="cluster merger"
                >
                    <Typography className={classes.heading}>Merge Clusters</Typography>
                    <Typography className={classes.secondaryHeading}>{mergeExplainer}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: 'block' }}>
                    <ClusterMerger {...props} />
                </AccordionDetails>
            </Accordion>
            {buildHeadlineAndInfo('Clusters Overview', 'Browse all clusters.')}
            {metaInfo}
            {whatAmISeeingTooltip}
            <ClusterTable {...props} />
        </>
  )
}
