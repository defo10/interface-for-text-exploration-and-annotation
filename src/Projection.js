import React, { Component } from 'react'
import * as d3 from 'd3'



class Projection extends Component {
  ref = null

  constructor(props) {
    super(props)
    this.state = {}
  }

  /** draws scatter plot
   */
  drawScatterPlot() {
    const embeddings = this.props.embeddings
    const { width, height } = this.props
    if (!this.ref) console.log('ref is null')

    const svg = d3.select(this.ref)
    const circle = svg.selectAll("circle")
      .data(embeddings)
      .join("circle")
        .attr("transform", d => {
          return `translate(${d[0]}, ${d[1]})`
        })
        .attr("fill", "red")
        .attr("r", 2.5)

    svg.call(d3.zoom().on("zoom", zoomed))

    function zoomed() {
      circle.attr("transform", d => `translate(${d3.event.transform.apply(d)})`)
    }
    //zoomed(d3.zoomIdentity) // start zoom position
  };

  componentDidMount() {
    this.drawScatterPlot()
  }

  render() {
    const { width, height } = this.props
    return (
          <svg ref={(ref) => this.ref = ref} width={width} height={height} overflow="hidden"></svg>
    )
  }
}

export default Projection
