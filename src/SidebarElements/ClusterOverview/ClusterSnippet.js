import React from 'react';
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles(
    {
        card: {
            display: 'block',
            margin: '32px 24px',
            padding: '4px 16px',
            position: 'relative',
            transition: 'all .2s ease-in-out',
            '&:hover': {
                boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
                marginBottom: '54px'
            }
        },
        neomorphism: {
            borderRadius: '15px',
            background: 'linear-gradient(145deg, #373737, #2e2e2e)',
            boxShadow: '5px 5px 12px #181818, -5px -5px 12px #4e4e4e'
        },
        p: {
            display: 'inline-block',
            marginBlockStart: '1em',
            marginBlockEnd: '1em',
            marginInlineStart: '0px',
            marginInlineEnd: '1em',
        },
    })

/**
 * 
 * @param comments is the subset of the data which has label @param label
 * @param label is the label of said comments
 */
export default function ClusterSnippet({ label, labels, data, ...otherProps }) {
    const classes = useStyles()

    const correctLabels = labels.filter(({ label_kmedoids, label_kmeans }) => label_kmedoids === label)
    const size = correctLabels.length

    const onClick = (e) => null

    return (

        <div className={`${classes.neomorphism} ${classes.card}`}>
            <h3>{label}</h3>
            <p className={classes.p}>Size: {size}</p>
            <p className={classes.p}>Density: 41</p>
        </div>
    )
}