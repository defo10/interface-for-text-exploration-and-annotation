import { CircularProgress, makeStyles } from '@material-ui/core'
import { LayoutState } from './Layout'

export const DRAGBAR_GUTTER = 8

type DragBarProps = {
    /** callback for when bar was dragged and position has changed */
    onDragChange: (obj: any) => void,
} & LayoutState

export default function DragBar(props: DragBarProps) {
    const { sidebar_width } = props
    const style_visible = {
        position: "absolute" as "absolute",
        left: sidebar_width || 0,
        height: '100vh',
        width: DRAGBAR_GUTTER,
        color: 'red',
        backgroundColor: 'red'
    }


    return (
        <div style={style_visible} draggable>
        </div>
    )
}