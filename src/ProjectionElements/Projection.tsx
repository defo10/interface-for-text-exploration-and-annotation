import React, { Component } from 'react'
import * as d3 from 'd3'
import { Coordinate, PropsFromData } from '../Data'
import { ZoomBehavior } from 'd3'


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
  }
} & PropsFromData


class Projection extends Component<PropsForProjection, {}> {
  ref: SVGSVGElement | null = null
  svg: d3.Selection<SVGSVGElement, any, null, undefined> | null = null
  scaleTransform: any = null

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

    const { width, height, setSelectedDatum, getSelectedCoordinates, 
      clustersToShow, selectCluster, labels } = this.props
    this.svg = d3.select(this.ref)


    const coordsToShow = this.getIntersectionCoordinatesClustersToShow(getSelectedCoordinates(), clustersToShow)
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
    const zoomBehavior = this.getZoomBehavior(circles)
    this.svg.call(zoomBehavior)

    // start with scaled up init view if first time, else take previours scale state 
    this.svg.call(zoomBehavior.transform, this.scaleTransform || this.getInitScale(width, height))
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
    const scaleFactor = Math.min(width / 100, height / 100)
    return d3.zoomIdentity.scale(scaleFactor)
  }

  componentDidMount() {
    this.drawScatterPlot()
  }

  /**
   * accesses the svg node associated with this class and updates
   * all points so that the clicked point and the points belonging
   * to its cluster have distinct colors
   */
  updateColorPoints() {
    const { selected_datum, labels, getSelectedCoordinates, clustersToShow } = this.props
    if (!this.svg  || !labels) return

    const coordsToShow = this.getIntersectionCoordinatesClustersToShow(getSelectedCoordinates(), clustersToShow)
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
    const { selected_datum, labels, labelChoice, getSelectedCoordinates, searchResultIndices, clustersToShow } = this.props
    const coordsToShow = this.getIntersectionCoordinatesClustersToShow(getSelectedCoordinates(), clustersToShow)
    if (coordsToShow.length === 0) return this.svg.selectAll('circle').remove()

    this.svg.selectAll('circle')
      .data(coordsToShow)
      .attr('fill', d => {
        if (searchResultIndices[d.index]) return 'green'
        return 'white'
      })
  }

  hasSelectedDatumChanged(prevProps: PropsForProjection) {
    return prevProps.selected_datum !== this.props.selected_datum
  }

  haveCoordinatesChanged(prevProps: PropsForProjection) {
    return prevProps.coordinatesParameters.minDistParameter !== this.props.coordinatesParameters.minDistParameter
      || prevProps.coordinatesParameters.numNeighborsParameter !== this.props.coordinatesParameters.numNeighborsParameter
      || prevProps.coordinates_to_show !== this.props.coordinates_to_show
  }

  haveSearchResultsChanged(prevProps: PropsForProjection) {
    return prevProps.searchResultIndices !== this.props.searchResultIndices
  }

  haveClustersToShowChanged(prevProps: PropsForProjection) {
    return prevProps.clustersToShow !== this.props.clustersToShow
  }

  hasSelectedClusterChanged(prevProps: PropsForProjection) {
    return prevProps.selectedCluster !== this.props.selectedCluster
  }

  componentDidUpdate(prevProps: PropsForProjection, prevState: {}) {
    if (this.haveCoordinatesChanged(prevProps) || this.haveClustersToShowChanged(prevProps)) {
      this.drawScatterPlot()
      this.updateColorPoints()
      return
    }
    if (this.hasSelectedClusterChanged(prevProps) || this.hasSelectedDatumChanged(prevProps))
      return this.updateColorPoints()
    if (this.haveSearchResultsChanged(prevProps)) return this.highlightSearchResults()
  }

  render() {
    const { width, height } = this.props
    return (
      <svg ref={(ref) => this.ref = ref} width={width} height={height} overflow="hidden"></svg>
    )
  }
}

export default Projection
