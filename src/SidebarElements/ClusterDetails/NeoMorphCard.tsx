import { PropsForSidebar } from '../../Sidebar'
import { createUseStyles } from 'react-jss'
import { DataPoint } from '../../Data'
import React from 'react'
import TextField from '@material-ui/core/TextField'

const useStyles = createUseStyles(
    {
        card: {
            display: 'block',
            margin: '32px 24px',
            padding: '4px 16px',
            position: 'relative',
        },
        neomorphism: {
            borderRadius: '15px',
            background: 'linear-gradient(145deg, #373737, #2e2e2e)',
            boxShadow: '5px 5px 12px #181818, -5px -5px 12px #4e4e4e'
        },
    })

type NeoMorphProps = {
    children: React.ReactNode
}

export default function NeoMorphCard(props: NeoMorphProps) {
    const classes = useStyles()

    return (
        <div className={`${classes.neomorphism} ${classes.card}`}>
            {props.children}
        </div>
    )
}