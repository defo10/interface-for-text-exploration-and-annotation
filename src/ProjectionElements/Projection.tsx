import React, { Component } from 'react'
import * as d3 from 'd3'
import { Coordinate, PropsFromData } from '../Data'
import { ZoomBehavior } from 'd3-zoom'
import _, { join, stubFalse } from 'lodash'

export type PropsForProjection = {
  width: number,
  height: number,
  sidebar_ctx: number,
  selectedCluster: string | null,
  selectCluster: (newLabel: string | null) => void,
  setSelectedDatum: (newDatumIndex: number) => void,
  selected_datum: number | null,
  searchResultIndices: object & {
    [key: string]: any | null
  },
} & PropsFromData


class Projection extends Component<PropsForProjection, {}> {
  ref: SVGSVGElement | null = null
  svg: d3.Selection<SVGSVGElement, any, null, undefined> | null = null
  scaleTransform: any = null
  zoomBehavior: ZoomBehavior<SVGSVGElement, Coordinate> | null = null

  constructor(props: PropsForProjection) {
    super(props)
    this.state = {}
  }

  /**
   * only show given coordinates that are in clustersToShow
   * @param coords 
   * @param clustersToShow 
   */
  getIntersectionCoordinatesClustersToShow(coords: Coordinate[], clustersToShow: string[]) {
    return coords.filter(
      (coord: Coordinate) => {
        let labelOfCoord = this.props.labels![coord.index].label_kmedoids
        if (clustersToShow.includes(`${labelOfCoord}`)) return true
        return false
      }
    ) as Coordinate[]
  }

  /** 
   * draws scatter plot
   */
  drawScatterPlot() {
    if (!this.ref) return

    const { width, height, setSelectedDatum, allCoordinates,
      clustersToShow, selectCluster, labels } = this.props
    this.svg = d3.select(this.ref)


    const coordsToShow = this.getIntersectionCoordinatesClustersToShow(allCoordinates!, clustersToShow)
    if (coordsToShow.length === 0) return this.svg.selectAll('circle').remove()

    const circles = this.svg.selectAll("circle")
      .data(coordsToShow)
      .join("circle")
      .attr('id', d => d.index)
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .attr("fill", 'white')
      .attr("r", 3)

    // this click event causes the react lifecycle method componentDidUpdate
    // to be called. There, we'll update the colors. (the props in this
    // function body aren't up to date at that point)
    circles.on("click", event => {
      let selected_datum_i = parseInt(event.target.id)
      setSelectedDatum(selected_datum_i)
      selectCluster(labels![selected_datum_i].label_kmedoids)
    })

    // zoom behavior
    this.zoomBehavior = this.getZoomBehavior(circles)
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
  getZoomBehavior(selection: d3.Selection<any | null, Coordinate, any | null, any | null>): ZoomBehavior<any, any> {
    return d3.zoom().on("zoom", (event) => {
      this.scaleTransform = event.transform
      selection.attr("transform", (d: Coordinate) => {
        let coordinateAsArray = [d.x, d.y]
        return `translate(${event.transform.apply(coordinateAsArray)})`
      })
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
  getInitScale(width: number, height: number) {
    const scaleFactor = Math.min(width / 100, height / 100) // factor to either fill horizontally or vertically
    return d3.zoomIdentity.scale(scaleFactor)
  }

  componentDidMount() {
    this.drawScatterPlot()
  }

  /**
   * updates all points so that the clicked point and the points belonging
   * to its cluster have distinct colors
   */
  updateColorPoints() {
    const { selected_datum, labels, allCoordinates, clustersToShow } = this.props
    if (!this.svg || !labels) return

    const coordsToShow = this.getIntersectionCoordinatesClustersToShow(allCoordinates!, clustersToShow)
    if (coordsToShow.length === 0) return this.svg.selectAll('circle').remove()


    this.svg.selectAll('circle')
      .data(coordsToShow)
      .attr('fill', d => {
        if (d.index == selected_datum) return 'cyan'
        if (this.props.selectedCluster == labels[d.index].label_kmedoids) return 'green'
        return 'white'
      })
  }

  highlightSearchResults() {
    if (!this.svg) return
    const { selected_datum, labels, labelChoice, allCoordinates, searchResultIndices, clustersToShow } = this.props
    const coordsToShow = this.getIntersectionCoordinatesClustersToShow(allCoordinates!, clustersToShow)
    if (coordsToShow.length === 0) return this.svg.selectAll('circle').remove()

    this.svg.selectAll('circle')
      .data(coordsToShow)
      .attr('fill', d => {
        if (searchResultIndices[d.index]) return 'green'
        return 'white'
      })
  }

  /** highlights the comment the user hovers over in the detail pane */
  showHoveredComment() {
    const { selected_datum, labels, allCoordinates, clustersToShow, hoveredCommentCoordinate } = this.props
    if (!this.svg || !labels) return

    var coordsToShow = this.getIntersectionCoordinatesClustersToShow(allCoordinates!, clustersToShow)
    if (coordsToShow.length === 0) return this.svg.selectAll('circle').remove()

    this.svg.selectAll('circle')
      .data(hoveredCommentCoordinate ? [...coordsToShow, hoveredCommentCoordinate] : coordsToShow, (d: any) => d.index)
      .join(
        enter => enter.append('circle')
          .attr('fill', 'cyan')
          .attr('r', '5')
          .attr("transform", d => `translate(${this.scaleTransform.k * d.x + this.scaleTransform.x}, ${this.scaleTransform.k * d.y + this.scaleTransform.y})`)
      )
  }

  /** zooms around so that cluster center is in the center of svg viewport and all clusters are visible */
  zoomAroundCluster() {
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
      (el, i) => (el.label_kmedoids === this.props.selectedCluster) ? true : false)
      .map((el, i) => this.props.allCoordinatesFull?.[numNeighbors]?.[minDist]?.[i]!)
    
    const mean_x = _.meanBy(allCoordsOfSelectedCluster, 'x') || 15
    const mean_y = _.meanBy(allCoordsOfSelectedCluster, 'y') || 15
    // TODO max x and max y, min x and min y, then scale factor just like below
    // position where mean point is in the center of viewport
    const mean_center_x = this.props.width / 2 - mean_x
    const mean_center_y = this.props.height / 2 - mean_y
    const delta_x = _.maxBy(allCoordsOfSelectedCluster, 'x')?.x || 0 - (_.minBy(allCoordsOfSelectedCluster, 'x')?.x || 0)
    const delta_y = _.maxBy(allCoordsOfSelectedCluster, 'y')?.y || 0 - (_.minBy(allCoordsOfSelectedCluster, 'y')?.y || 0)
    const scaleFactor = Math.min(this.props.width/delta_x, this.props.height/delta_y)

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

  hasCommentClickedOnChanged(prevProps: PropsForProjection) {
    return prevProps.selected_datum !== this.props.selected_datum
  }

  haveCoordinatesChanged(prevProps: PropsForProjection) {
    return !_.isEqual(_.sortBy(prevProps.allCoordinates), _.sortBy(this.props.allCoordinates))
  }

  haveSearchResultsChanged(prevProps: PropsForProjection) {
    return prevProps.searchResultIndices !== this.props.searchResultIndices
  }

  haveClustersToShowChanged(prevProps: PropsForProjection) {
    return !_.isEqual(_.sortBy(prevProps.clustersToShow), _.sortBy(this.props.clustersToShow))
  }

  hasSelectedClusterChanged(prevProps: PropsForProjection) {
    return prevProps.selectedCluster !== this.props.selectedCluster
  }

  hasHoveredCommentCoordinateChanged(prevProps: PropsForProjection) {
    return prevProps.hoveredCommentCoordinate?.index !== this.props.hoveredCommentCoordinate?.index
  }

  componentDidUpdate(prevProps: PropsForProjection, prevState: {}) {
    if (this.hasCommentClickedOnChanged(prevProps)) {
      this.updateColorPoints()
      return
    }
    if (this.hasSelectedClusterChanged(prevProps)) {
      this.drawScatterPlot()
      this.updateColorPoints()
      this.zoomAroundCluster()
      return
    }
    if (this.haveCoordinatesChanged(prevProps) || this.haveClustersToShowChanged(prevProps)) {
      this.drawScatterPlot()
      this.updateColorPoints()
      return
    }
    if (this.haveSearchResultsChanged(prevProps)) return this.highlightSearchResults()
    if (this.hasHoveredCommentCoordinateChanged(prevProps)) return this.showHoveredComment()
  }

  render() {
    const { width, height } = this.props
    return (
      <svg ref={(ref) => this.ref = ref} width={width} height={height} overflow="hidden"></svg>
    )
  }
}

export default Projection
