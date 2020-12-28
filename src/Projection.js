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
    /**
    const data = this.props.mnist_embeddings
    if (!this.ref) console.log('ref is null')

    const svg = d3.select(this.ref)
    const circle = svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("transform", d => `translate(${d})`)
    .attr("fill", "blue")
    .attr("r", 1.5)

    svg.call(d3.zoom().on("zoom", zoomed))

    function zoomed() {
      circle.attr("transform", d => `translate(${d3.event.transform.apply(d)})`)
    }
    */
    
    const data = this.props.mnist_embeddings
    const context = this.ref.getContext('2d')
    const r = 1.5 // radius

    // redraw points on zoom
    d3.select(context.canvas).call(d3.zoom()
      .on("zoom", () => zoomed(this.props.width, this.props.height))
    )

    function zoomed(width, height) {
      context.save() // push current transformation matrix onto stack
      context.clearRect(0, 0, width, height)
      context.beginPath()
      for (const d of data) {
        const [x, y] = d3.event.transform.apply(d)
        context.moveTo(x + r, y) // position of circle
        context.arc(x, y, r, 0, 2 * Math.PI) // draw circle
      }
      context.fillStyle = 'red'
      context.fill()
      context.restore() // pop changes to get to save() position
    }

    //zoomed(d3.zoomIdentity) // start zoom position
  };

  componentDidMount() {
    this.drawScatterPlot()
  }

  render() {
    let { width, height } = this.props

    return (
          <svg ref={(ref) => this.ref = ref} width={width} height={height} overflow="hidden"></svg>
    )
  }
}

export default Projection
