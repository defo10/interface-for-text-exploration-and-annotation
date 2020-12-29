import React, { Component } from 'react'
import Layout from './Layout'
import * as _ from 'lodash'
import * as d3 from 'd3'
import * as Papa from 'papaparse'

let algorithm_options = ['UMAP', 'T-SNE', 'UMAP min_dist=0.8']
let algorithm_embedding_keys = [
  'mnist_embeddings',
  'tsne_mnist_embeddings',
  'md08_umap_mnist_embeddings',
]

class Data extends Component {
  constructor(props) {
    super(props)
    this.state = {
      embeddings: null,
      data: null,
      label_kmedoids: null,
      label_kmeans: null,
    }
  }

  /** scales embeddings to values between [0, 10]
   * @param {Array} embeddings are the coordinates, has form [[x,y],...]
   */
  scaleEmbeddings(embeddings) {
    let xs = embeddings.map(e => Math.abs(e[0]))
    let ys = embeddings.map(e => Math.abs(e[1]))
    let max_x = _.max(xs)
    let max_y = _.max(ys)
    let max = Math.max(max_x, max_y)
    let scale = d3
      .scaleLinear()
      .domain([-max, max])
      .range([0, 1])
    let scaled_embeddings = embeddings.map(e => [scale(e[0]), scale(e[1])])
    return scaled_embeddings
  }

  componentDidMount() {
    fetch(`${process.env.PUBLIC_URL}/resultpoints.csv`)
      .then(result => result.text())
      .then(csv => {
        return Papa.parse(csv, {header: false})
      })
      .then(parse_result => {
        const embeddings = parse_result.data.slice(0,250)
        let scaled_embeddings = this.scaleEmbeddings(embeddings)
        this.setState({
          embeddings: scaled_embeddings,
        })
      })
    fetch(`${process.env.PUBLIC_URL}/raw_data_labels.csv`)
      .then(result => result.text())
      .then(csv => Papa.parse(csv, {header: false}))
      .then(parse_result => {
        const raw_labels = parse_result.data
        let data = []
        let label_kmedoids = []
        let label_kmeans = []
        raw_labels.forEach(row => {
          data.push(row.slice(0, -2))
          label_kmedoids.push(row.slice(-2, -1))
          label_kmeans.push(row.slice(-1))
        });
        this.setState({
          data: data,
          label_kmedoids: label_kmedoids,
          label_kmeans: label_kmeans,
        })
      })
  }

  render() {
    return this.state.embeddings && this.state.data ? (
      <Layout
        {...this.state}
        algorithm_options={algorithm_options}
        algorithm_embedding_keys={algorithm_embedding_keys}
      />
    ) : (
      <div style={{ padding: '1rem' }}>Loading data...</div>
    )
  }
}

export default Data
