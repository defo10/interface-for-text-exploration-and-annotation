import React, { Component } from 'react'
import * as d3 from 'd3'



class Projection extends Component {
  ref = null
  svg = null

  constructor(props) {
    super(props)
    this.state = {}
  }

  /** draws scatter plot
   */
  drawScatterPlot() {
    const { width, height, setSelectedDatum, embeddings } = this.props

    this.svg = d3.select(this.ref)
    const circles = this.svg.selectAll("circle")
      .data(embeddings)
      .join("circle")
        .attr('id', d => d[2])
        .attr("transform", d => `translate(${d[0]}, ${d[1]})`)
        .attr("fill", 'white')
        .attr("r", 3)

    // this clickt event causes the react lifecycle method componentDidUpdate
    // to be called. There, we'll update the colors. (the props in this
    // function body aren't up to date at that point)
    circles.on("click", event => setSelectedDatum(event.target.id))

    // zoom behavior
    const zoomBehavior = this.getZoomBehavior(circles)
    this.svg.call(zoomBehavior)

    // start with scaled up view
    this.svg.call(zoomBehavior.transform, this.getInitScale(width, height))
  }

  /** 
   * returns function which applies a transformation after each zoom
   * event (that is, dragging around + zooming).
   * 
   * @param selection is the selection of nodes which should be transformed
   * @returns a zoomBehavior function, to be called on the node on which this behavior
   * should be bound to.
   */
  getZoomBehavior(selection) {
    return d3.zoom().on("zoom", (event) => {
      selection.attr("transform", d => `translate(${event.transform.apply(d)})`)
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
  getInitScale(width, height) {
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
    if (!this.svg) return
    const { selected_datum, labels, labelChoice, embeddings} = this.props

    this.svg.selectAll('circle')
      .data(embeddings)
      .attr('fill', d => {
        const i = d[2] // == id == index of datum in data d
        if (i == selected_datum) return 'cyan'
        if (labels[i]?.[labelChoice] === labels[selected_datum]?.[labelChoice]) return 'green'
        return 'white'
      })
  }

  highlightSearchResults() {
    if (!this.svg) return
    const { selected_datum, labels, labelChoice, embeddings, searchResultIndices } = this.props

    this.svg.selectAll('circle')
      .data(embeddings)
      .attr('fill', d => {
        const i = d[2] // == id == index of datum in data d
        if (searchResultIndices[i]) return 'green'
        return 'white'
      })
  }

  hasSelectedDatumChanged(prevProps) {
    return prevProps.selected_datum !== this.props.selected_datum
  }

  haveEmbeddingsChanged(prevProps) {
    return prevProps.embeddings !== this.props.embeddings || prevProps.embeddings.length !== this.props.embeddings.length
  }

  hasLabelChoiceChanged(prevProps) {
    return prevProps.labelChoice !== this.props.labelChoice
  }

  haveSearchResultsChanged(prevProps) {
    return prevProps.searchResultIndices !== this.props.searchResultIndices
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.hasSelectedDatumChanged(prevProps)) return this.updateColorPoints()
    if (this.haveEmbeddingsChanged(prevProps)) {
      this.drawScatterPlot()
      this.updateColorPoints()
      return
    }
    if (this.hasLabelChoiceChanged(prevProps)) return this.updateColorPoints()
    if (this.haveSearchResultsChanged) return this.highlightSearchResults()
  }

  render() {
    const { width, height } = this.props
    return (
          <svg ref={(ref) => this.ref = ref} width={width} height={height} overflow="hidden"></svg>
    )
  }
}

export default Projection
