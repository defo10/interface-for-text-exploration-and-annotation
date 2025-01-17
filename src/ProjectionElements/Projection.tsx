// this is a component doing all the d3 stuff
// of the visualization
import React, { Component } from 'react'
import * as d3 from 'd3'
import { Coordinate, PropsFromData } from '../Data'
import { ZoomBehavior } from 'd3-zoom'
import _ from 'lodash'

export type PropsForProjection = {
  width: number,
  height: number,
  sidebar_ctx: number,
  selectedCluster: string | null,
  selectCluster: (newLabel: string) => void,
  setSelectedDatum: (newDatumIndex: number) => void,
  selected_datum: number | null,
  searchResultIndices: object & {
    [key: string]: any | null
  },
  /** this is the same as allCoordinates with only clusters selected to show, but
   * arranged as array of arrays of form [x, y, index].
   * This increases the performance substantially
   *
   * its actually a number[] but ts was giving errors when unpacking those
  */
  allCoordinatesAsArray: any[]
} & PropsFromData

class Projection extends Component<PropsForProjection, {}> {
  ref: SVGSVGElement | null = null
  svg: d3.Selection<SVGSVGElement, any, null, undefined> | null = null
  group: d3.Selection<SVGGElement, any, null, undefined> | null = null
  scaleTransform: any = null
  zoomBehavior: ZoomBehavior<SVGSVGElement, Coordinate> | null = null
  fillOpacity = 0.8
  hoverColor = 'rgba(245, 124, 0, 1)' // orange

  constructor (props: PropsForProjection) {
    super(props)
    this.state = {}
  }

  async drawScatterPlot () {
    if (!this.ref) return

    const {
      width, height, setSelectedDatum, allCoordinatesAsArray,
      selectCluster, labels
    } = this.props
    this.svg = !this.svg ? d3.select(this.ref) : this.svg
    this.group = !this.group
      ? this.svg.append('g')
      : this.group

    const coordsToShow = allCoordinatesAsArray

    const circles = await this.group.selectAll('circle')
      .data(coordsToShow, ([,, index]) => index)
      .join(
        enter => enter.append('circle')
          .attr('id', ([,, index]) => index)
          .attr('cx', ([x]) => x)
          .attr('cy', ([, y]) => y)
          .attr('fill-opacity', 0.0)
          .call(enter => enter
            .transition()
            .duration(500)
            .delay((d, i) => i / this.props.coordinates_to_show * 200) // Dynamic delay (i.e. each item delays a little longer)
            .attr('fill-opacity', this.fillOpacity)
          )
        ,
        update => update
          .call(update => update
            .transition()
            .duration(2000)
            .attr('cx', ([x]) => x)
            .attr('cy', ([, y]) => y)
          ),
        exit => exit
          .call(text => text.transition()
            .duration(500)
            .delay((d, i) => i / this.props.coordinates_to_show * 200) // Dynamic delay (i.e. each item delays a little longer)
            .remove()
            .attr('fill-opacity', 0)
          )
      )
      .attr('r', 0.5)
      .attr('fill', 'white')

    // this click event causes the react lifecycle method componentDidUpdate
    // to be called. There, we'll update the colors. (the props in this
    // function body aren't up to date at that point)
    circles.on('click', event => {
      const selected_datum_i = parseInt(event.target.id)
      setSelectedDatum(selected_datum_i)
      selectCluster(labels![selected_datum_i].label_kmedoids)
    })

    // zoom behavior
    this.zoomBehavior = this.getZoomBehavior(this.group)
    this.svg.call(this.zoomBehavior)

    // start with scaled up init view if first time, else take previours scale state
    this.svg.call(this.zoomBehavior.transform, this.scaleTransform || this.getInitScale(width, height))

    if (this.props.selectedCluster) this.updateColorPoints()
  }

  /**
   * returns function which applies a transformation after each zoom
   * event (that is, dragging around + zooming).
   *
   * @param selection is the selection of nodes which should be transformed
   * @returns a zoomBehavior function, to be called on the node on which this behavior
   * should be bound to.
   */
  getZoomBehavior (selection: d3.Selection<any | null, any, any | null, any | null>): ZoomBehavior<any, any> {
    return d3.zoom().on('zoom', ({ transform }) => {
      this.scaleTransform = transform
      selection.attr('transform', transform)
    })
  }

  /**
   * @param {int} width the width of the surrounding svg container
   * @param {int} height the height of the surrounding svg container
   * @returns a zoom behavior function with a scale factor that scales
   * the data to width and height
   *
   * NOTE: assumes that the scale defined in {Data.js} is [0,100]
   */
  getInitScale (width: number, height: number) {
    const scaleFactor = Math.min(width / 100, height / 100) // factor to either fill horizontally or vertically
    return d3.zoomIdentity.scale(scaleFactor)
  }

  componentDidMount () {
    this.drawScatterPlot()
  }

  /**
   * updates all points so that the clicked point and the points belonging
   * to its cluster have distinct colors
   */
  updateColorPoints () {
    const { selected_datum, labels, allCoordinatesAsArray } = this.props
    if (!this.svg || !labels || !this.group) return

    const coordsToShow = allCoordinatesAsArray
    if (coordsToShow.length === 0) return this.svg.selectAll('circle').remove()

    this.group.selectAll('circle')
      .data(coordsToShow, ([,, index]) => index)
      .attr('fill', ([,, index]) => {
        if (index == selected_datum) return 'cyan'
        if (this.props.selectedCluster == labels[index].label_kmedoids) return this.hoverColor // orange kinda
        return 'white'
      })
  }

  highlightSearchResults () {
    if (!this.svg || !this.group) return
    const { allCoordinatesAsArray, searchResultIndices } = this.props
    const coordsToShow = allCoordinatesAsArray
    if (coordsToShow.length === 0) return this.group.selectAll('circle').remove()

    this.group.selectAll('circle')
      .data(coordsToShow, ([,, index]) => index)
      .attr('fill', ([,, index]) => {
        if (searchResultIndices[index]) return this.hoverColor
        return 'white'
      })
  }

  /** highlights the comment the user hovers over in the detail pane */
  showHoveredComment () {
    const { labels, allCoordinatesAsArray, hoveredCommentCoordinate } = this.props
    if (!this.svg || !labels || !this.group) return

    const coordsToShow = allCoordinatesAsArray
    if (coordsToShow.length === 0) return this.group.selectAll('circle').remove()

    if (hoveredCommentCoordinate) coordsToShow.push([hoveredCommentCoordinate?.x, hoveredCommentCoordinate?.y, hoveredCommentCoordinate?.index])

    this.group.selectAll('circle')
      .data(coordsToShow, ([,, index]) => index)
      .join(
        enter => enter.append('circle')
          .attr('fill', 'cyan')
          .attr('fill-opacity', '1')
          .attr('r', 1)
          .attr('id', ([,, index]) => index)
          .attr('cx', ([x]) => x)
          .attr('cy', ([, y]) => y)
      )
  }

  /** zooms around so that cluster center is in the center of svg viewport and all clusters are visible */
  zoomAroundCluster () {
    if (!this.zoomBehavior) return
    if (!this.svg) return
    if (!this.props.selectedCluster) { // if unselected cluster, show overview
      const scaleFactor = this.getInitScale(this.props.width, this.props.height)

      this.svg?.transition()
        .duration(1000)
        .call(
          this.zoomBehavior.transform,
          d3.zoomIdentity.scale(scaleFactor.k)
        )
      return
    }

    const numNeighbors = this.props.coordinatesParameters.numNeighborsParameter
    const minDist = this.props.coordinatesParameters.minDistParameter
    if (!this.props.allCoordinatesFull?.[numNeighbors]?.[minDist]) return

    const allCoordsOfSelectedCluster = this.props.labels?.filter(
      (el) => (el.label_kmedoids === this.props.selectedCluster))
      .map((el, i) => this.props.allCoordinatesFull?.[numNeighbors]?.[minDist]?.[i]!)

    const mean_x = _.meanBy(allCoordsOfSelectedCluster, 'x') || 15
    const mean_y = _.meanBy(allCoordsOfSelectedCluster, 'y') || 15
    // TODO max x and max y, min x and min y, then scale factor just like below
    // position where mean point is in the center of viewport
    const delta_x = _.maxBy(allCoordsOfSelectedCluster, 'x')?.x || 0 - (_.minBy(allCoordsOfSelectedCluster, 'x')?.x || 0)
    const delta_y = _.maxBy(allCoordsOfSelectedCluster, 'y')?.y || 0 - (_.minBy(allCoordsOfSelectedCluster, 'y')?.y || 0)
    const scaleFactor = Math.min(this.props.width / delta_x, this.props.height / delta_y)

    this.svg?.transition()
      .duration(500)
      .call(
        this.zoomBehavior.translateTo,
        mean_x, mean_y
      )
      .transition()
      .duration(500)
      .call(
        this.zoomBehavior.scaleTo,
        scaleFactor * 1.3
      )
  }

  hasCommentClickedOnChanged (prevProps: PropsForProjection) {
    return prevProps.selected_datum !== this.props.selected_datum
  }

  haveCoordinatesChanged (prevProps: PropsForProjection) {
    return !_.isEqual(_.sortBy(prevProps.allCoordinates), _.sortBy(this.props.allCoordinates))
  }

  haveSearchResultsChanged (prevProps: PropsForProjection) {
    return prevProps.searchResultIndices !== this.props.searchResultIndices
  }

  haveClustersToShowChanged (prevProps: PropsForProjection) {
    return !_.isEqual(_.sortBy(prevProps.clustersToShow), _.sortBy(this.props.clustersToShow))
  }

  hasSelectedClusterChanged (prevProps: PropsForProjection) {
    return prevProps.selectedCluster !== this.props.selectedCluster
  }

  hasHoveredCommentCoordinateChanged (prevProps: PropsForProjection) {
    return prevProps.hoveredCommentCoordinate?.index !== this.props.hoveredCommentCoordinate?.index
  }

  componentDidUpdate (prevProps: PropsForProjection, prevState: {}) {
    if (this.hasCommentClickedOnChanged(prevProps)) {
      this.updateColorPoints()
      return
    }
    if (this.hasSelectedClusterChanged(prevProps)) {
      this.drawScatterPlot()
      this.zoomAroundCluster()
      return
    }
    if (this.haveClustersToShowChanged(prevProps) || this.haveCoordinatesChanged(prevProps)) {
      this.drawScatterPlot()
      return
    }
    if (this.haveSearchResultsChanged(prevProps)) return this.highlightSearchResults()
    if (this.hasHoveredCommentCoordinateChanged(prevProps)) return this.showHoveredComment()
  }

  render () {
    const { width, height } = this.props
    return (
      <svg ref={(ref) => {
        this.ref = ref
      }} width={width} height={height} overflow="hidden"></svg>
    )
  }
}

export default Projection
