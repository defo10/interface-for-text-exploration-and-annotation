import React, { Component } from 'react'
import Layout from './Layout'
import * as _ from 'lodash'
import * as d3 from 'd3'
import * as lunr from 'lunr'

import { connect } from 'react-redux';
import {
  renameLabel, setLabelOfId, setState,
  selectEmbeddings, selectData, selectLabels
} from './Store.js';

class Data extends Component {
  constructor(props) {
    super(props)
    this.state = {
      embeddings_supervised: null,
      embeddings_unsupervised: null,
      embeddings_size: 400,
      data: null,
      labels: null,
      algorithm_options: null,
      search_index: null,
    }
    this.updateEmbeddings = this.updateEmbeddings.bind(this)
  }

  /** scales embeddings to values between [0, 10]
   * the index key stays untouched.
   * @param {Array} embeddings are the coordinates, has form [{x->val,y->val, index->val},...]
   * @returns an array of the coordinates of the form [[x, y, index], ...]
   */
  scaleEmbeddings(embeddings) {
    let xs = embeddings.map(e => Math.abs(e.x))
    let ys = embeddings.map(e => Math.abs(e.y))
    let max_x = _.max(xs)
    let max_y = _.max(ys)
    let max = Math.max(max_x, max_y)
    let scale = d3
      .scaleLinear()
      .domain([-max, max])
      .range([0, 100])
    let scaled_embeddings = embeddings.map(e => [scale(e.x), scale(e.y), e.index])
    return scaled_embeddings
  }

  /**
   * adds an index to the end of each row of a parsed csv
   * @param array is an array of array, where each member array represents a row 
   */
  addIndex(array) {
    return array.map((row, i) => [...row, i])
  }

  /**
   * picks n random elements from arr without duplicates.
   * see. https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
   * @param {*} arr 
   * @param {*} n 
   */
  getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  loadEmbeddings(howMany) {
    // TODO same random vals for both embeddings
    // coordinates (embeddings) for supervised data
    fetch(`${process.env.PUBLIC_URL}/coordinates_supervised.json`)
      .then(result => result.text())
      .then(json_str => JSON.parse(json_str))
      .then(coordinates => {
        const embeddings = coordinates
        const scaled_embeddings = this.scaleEmbeddings(embeddings)
        const random_embeddings = (howMany < embeddings.length * 2/3) ? this.getRandom(scaled_embeddings, howMany) : scaled_embeddings
        this.setState({
          embeddings_supervised: random_embeddings,
        })
      })

    // coordinates (embeddings) for unsupervised data 
    fetch(`${process.env.PUBLIC_URL}/coordinates_unsupervised.json`)
      .then(result => result.text())
      .then(json_str => JSON.parse(json_str))
      .then(coordinates => {
        // unsupervised dim reduction
        const embeddings = coordinates
        const scaled_embeddings = this.scaleEmbeddings(embeddings)
        const random_embeddings = (howMany < embeddings.length * 2/3) ? this.getRandom(scaled_embeddings, howMany) : scaled_embeddings
        this.setState({
          embeddings_unsupervised: random_embeddings,
        })
      })
  }

  updateEmbeddings(event) {
    let size = parseInt(event.target.value) || 0
    this.setState({
      embeddings_size: size
    })
    this.loadEmbeddings(size)
  }


  componentDidMount() {
    this.loadEmbeddings(400) // embeddings

    // data
    fetch(`${process.env.PUBLIC_URL}/data.json`)
      .then(result => result.text())
      .then(json_str => JSON.parse(json_str))
      .then(data => {
        this.setState({
          data: data,
        })
        return data
      })
      .then(data => { // build search index
        const search_index = lunr(function() {
          this.field('comment')

          for (let i = 0; i < data.length; i++) {
            this.add({
              'comment': data[i].text,
              'id': `${i}`
            })
          }
        })
        this.setState({
          search_index: search_index
        })
      })

    // labels
    fetch(`${process.env.PUBLIC_URL}/labels.json`)
      .then(result => result.text())
      .then(json_str => JSON.parse(json_str))
      .then(labels => {
        this.setState({
          labels: labels,
        })
      })
  }

  render() {
    return this.state.embeddings_supervised && this.state.embeddings_unsupervised && this.state.data ? (
      <Layout
        {...this.state}
        algorithm_embedding_keys={algorithm_embedding_keys}
        updateEmbeddings={this.updateEmbeddings}
      />
    ) : (
        <div style={{ padding: '1rem' }}>Loading data...</div>
      )
  }
}

const mapStateToProps = state => {
  return {
    embeddings: selectEmbeddings(state),
    data: selectData(state),
    labels: selectLabels(state)
  }
}

const mapDispatchToProps = {
  setState
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Data)
