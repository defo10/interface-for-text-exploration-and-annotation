import React from 'react'

/**
 * used inside sidebar to display one comment
 * elem is one data point
 */
export default function Comment({elem, dense=false, sidebar_orientation, ...props}) {
    const isOnMobile = (sidebar_orientation === 'horizontal')
    const style_container = {
        display: isOnMobile ? 'inline' : 'block',
        width: isOnMobile ? 'auto' : '100%',
        height: isOnMobile ? '100%' : 'auto',
        padding: dense ? '4px 16px' : '16px 16px'
    }
    const style_meta_infos = {
        display: 'block',
        width: isOnMobile ? 'auto' : '100%',
        height: isOnMobile ? '100%' : 'auto',
    }
    const style_date = {
        marginLeft: '8px',
        display: 'inline',
        fontWeight: 'light',
        fontStyle: 'italic',
        color: 'LightGray',
        fontSize: '0.9em',
    }
    const style_username = {
        display: 'inline',
        fontWeight: 'bold',
    }
    const style_comment = {
        padding: '0',
        margin: '0'
    }
    
    const {publishedAt, authorName, cleaned} = elem

    return (
    <div style={style_container}>
        <div style={style_meta_infos}>
            <p style={style_username}>{authorName}</p>
            <p style={style_date}>{publishedAt}</p>
        </div>
        <p style={style_comment}>{cleaned}</p>
    </div>)
}