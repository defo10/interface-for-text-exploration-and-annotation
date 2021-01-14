import React from 'react'

/**
 * displays a small line
 * used inside sidebar to separate two elements visually.
 */
export default function Separator({sidebar_orientation, ...props}) {
    const isOnMobile = (sidebar_orientation === 'horizontal')

    const style = {
        width: isOnMobile ? '1px' : '95%',
        height: isOnMobile ? 'auto' : '1px', // '95%' doesnt work on mobile view
        backgroundColor: 'LightGray',
        textAlign: 'center',
        border: 0,
    }

    return <hr style={style}/>
}