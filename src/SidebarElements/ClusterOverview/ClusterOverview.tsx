import React, { SetStateAction, useState } from 'react';
import ClusterSnippet from './ClusterSnippet'
import ClusterTable from './ClusterTable';
import { PropsForSidebar } from '../../Sidebar';
import ClusterMerger from '../ClusterMerger';
import { DataPoint } from '../../Data';
import { Accordion, AccordionDetails, AccordionSummary, makeStyles, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';


export type PropsForClusterOverview = PropsForSidebar

const useStyles = makeStyles(theme => ({
    padding: {
        padding: theme.spacing(2),
    },
    root: { // accordion
        margin: theme.spacing(2)
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
}))

/**
 * 
 * @param comments is the subset of the data which has label @param label
 * @param label is the label of said comments
 */
export default function ClusterOverview(props: PropsForClusterOverview) {
    const classes = useStyles()
    const expandSentence = "Click to expand"
    const minimizeSentence = "Click to minimize"
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
            <Typography variant='body2' style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '8px'}}>Checked cluster comments are white in the visualization</Typography>
            <Typography variant='body2' style={{ backgroundColor: 'rgba(245, 124, 0, 0.7)', padding: '8px' }}>The selected cluster's comments are orange in the visualization</Typography>
        </div>)

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
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                >
                    <Typography className={classes.heading}>Merge Clusters</Typography>
                    <Typography className={classes.secondaryHeading}>{mergeExplainer}</Typography>
                </AccordionSummary>
                <AccordionDetails style={{ display: 'block' }}>
                    <ClusterMerger {...props} />
                </AccordionDetails>
            </Accordion>
            {buildHeadlineAndInfo('Clusters Overview', "Browse through all clusters. Check the one's you'd like to see in the visualization. Click on a row to see its details.")}
            {legend}
            <ClusterTable {...props} />
        </>
    )
}