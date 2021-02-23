import * as d3 from 'd3'
import * as _ from 'lodash'
import lunr from 'lunr'
import React, { Component } from 'react'
import Layout from './Layout'


export type Coordinate = {
  x: number,
  y: number,
  index: number
}

export const min_dists_arr: string[] = ['0.1', '0.2', '0.5', '0.9']
export type ParameterMinDist = '0.1' | '0.2' | '0.5' | '0.9'
export type MinDist = {
  '0.1': Coordinate[] | null,
  '0.2': Coordinate[] | null,
  '0.5': Coordinate[] | null,
  '0.9': Coordinate[] | null,
  [i: string]: Coordinate[] | null
}

export const num_neighbors_arr: string[] = ['2', '5', '10', '50']
export type ParameterNumNeighbors = '2' | '5' | '10' | '50'
export type NumNeighbors = {
  '2': MinDist,
  '5': MinDist,
  '10': MinDist,
  '50': MinDist,
  [i: string]: MinDist
}

/** used to keep track of changed label */
export type DataChanged = {
  oldLabel: Label
  newLabel: Label
} & DataPoint

export type DataPoint = {
  publishedAt: string,
  authorName: string,
  isReply: number,
  text: string | null,
  cleaned: string,
  i: number
}

export type Label = {
  label_kmedoids: string
}

export type ClusterInfo = {
  /**is the index of the medoid of that data point.
   * medoid might be null for newly created clusters.
  */
  medoid: number | null,
  /**are the indices of representatives of this cluster */
  representatives: number[],
  size: number,
  quality: number
}

export type Cluster = {
  [cluster: string]: ClusterInfo
}

type State = {
  /** this has actually all coordinates, unlike allCoordinates,
   * which has a sample for all parameters */
  allCoordinatesFull: NumNeighbors | null,
  /** samples to show for coordinate parameters */
  allCoordinates: Coordinate[] | null,
  coordinatesParameters: {
    numNeighborsParameter: ParameterNumNeighbors,
    minDistParameter: ParameterMinDist,
  }
  coordinates_to_show: number, // i.e. all svg circles to show
  data: DataPoint[] | null,
  /** data that was moved between clusters */
  dataChanged: DataChanged[]
  labels: Label[] | null,
  searchIndex: lunr.Index | null,
  /** is an array of cluster names to show on the projection */
  clustersToShow: string[],
  /** meta info about each cluster in a dictionary */
  clusters: Cluster,
  /** the coordinate of the comment the user hovers over, or null if not hovering */
  hoveredCommentCoordinate: Coordinate | null,
}

export type PropsFromData = {
  /** reloads as many coordinates that are shown in Projection as specified in e */
  reloadCoordinatesWithSize: (e: React.ChangeEvent<HTMLInputElement>, callback?: () => void) => void,
  setSelectedCoordinates: (numNeighbors: ParameterNumNeighbors, minDist: ParameterMinDist) => void,
  /**
   * 
   * @param clusters is an array of labels of the clusters to show
   */
  setClustersToShow: (clusters: string[], callback?: () => void) => void,
  /**
   * changes all occurences of oldLabel to newLabel inside labels and
   * clustersToShow.
   * Make sure to handle all lower lying variables, e.g. selectedCluster,
   * yourself.
   * @param oldLabels
   * @param newLabel 
   */
  renameLabels: (oldLabels: string[], newLabel: string) => void,
  /** 
   * adds new entry to dataChanged
   * if entry with same i property already exists, then first remove that.
   * if oldlabel is the same as newlabel, then remove and don't add
   * updates clusters state too
   */
  pushToDataChanged: (newDataChange: DataChanged) => void,
  /**
   * sets hoveredCommentCoordinate to the coordinate associated with
   * comment_index, or null of comment_index is null
   */
  setHoveredCommentCoordinate: (comment_index: number | null) => void,
  [key: string]: any,
} & State


export default class Data extends Component<any, State> {
  random_indices: number[] | null = null

  constructor(props: any) {
    super(props)
    this.state = {
      allCoordinatesFull: null,
      allCoordinates: null,
      coordinatesParameters: {
        numNeighborsParameter: '10',
        minDistParameter: '0.1'
      },
      coordinates_to_show: 400,
      data: null,
      labels: null,
      searchIndex: null,
      clustersToShow: ["12", "4", "1", "31"],  // only select four biggest on mount
      clusters: {},
      dataChanged: [],
      hoveredCommentCoordinate: null,
    }
    this.reloadCoordinatesWithSize = this.reloadCoordinatesWithSize.bind(this)
    this.setSelectedCoordinates = this.setSelectedCoordinates.bind(this)
    this.setClustersToShow = this.setClustersToShow.bind(this)
    this.renameLabels = this.renameLabels.bind(this)
    this.pushToDataChanged = this.pushToDataChanged.bind(this)
    this.setHoveredCommentCoordinate = this.setHoveredCommentCoordinate.bind(this)
  }

  setHoveredCommentCoordinate(comment_index: number | null) {
    if (!comment_index) {
      this.setState({
        hoveredCommentCoordinate: null
      })
      return
    }
    if (!this.state.allCoordinatesFull) return
    const allComments = this.state.allCoordinatesFull[this.state.coordinatesParameters.numNeighborsParameter][this.state.coordinatesParameters.minDistParameter]
    this.setState({
      hoveredCommentCoordinate: allComments![comment_index]
    })
  }

  pushToDataChanged(newData: DataChanged) {
    let alreadyExisting = _.find(this.state.dataChanged, ['i', newData.i])
    let newDataChanged = _.without(this.state.dataChanged, alreadyExisting)
    if (!(
      alreadyExisting && alreadyExisting.oldLabel.label_kmedoids == newData.newLabel.label_kmedoids // if users reverts change, skip
      || !alreadyExisting && newData.oldLabel.label_kmedoids == newData.newLabel.label_kmedoids // if wasnt changed before but has no change either, skip
    )) newDataChanged.push(newData)

    // if new cluster, set clusters
    if (!this.state.clusters[newData.newLabel.label_kmedoids]) {
      let copy = { ...this.state.clusters }
      copy[newData.newLabel.label_kmedoids] = {
        medoid: null,
        representatives: [],
        size: 1,
        quality: -1,
      }
      this.setState({
        clusters: copy
      })
    }

    this.setState({
      dataChanged: newDataChanged as DataChanged[]
    })
  }

  renameLabels(oldLabels: string[], newLabel: string) {
    // rename in clusterToShow
    const newClustersToShow = this.state.clustersToShow.map(
      (el, i) => oldLabels.includes(el) ? newLabel : el
    )

    // rename in labels
    const labels_new = this.state.labels!.map(
      (label) => {
        if (oldLabels.includes(label.label_kmedoids)) {
          return { label_kmedoids: newLabel } as Label
        }
        return label
      }
    )

    // rename in clusters
    let clusters_new: Cluster = _.cloneDeep(this.state.clusters)
    let didMerge = false
    for (const oldLabel of oldLabels) {

      if (oldLabel == newLabel) continue // skip merging if both already have same label

      const isMerging = clusters_new[newLabel]
      if (isMerging) { // merge if new already exists
        didMerge = true
        clusters_new[newLabel] = {
          medoid: clusters_new[newLabel].medoid,
          representatives: [...clusters_new[oldLabel].representatives, ...clusters_new[newLabel].representatives],
          size: clusters_new[oldLabel].size + clusters_new[newLabel].size,
          quality: -1
        }
      } else { // rename else
        clusters_new[newLabel] = { ...this.state.clusters[oldLabel] }
      }
      delete clusters_new[oldLabel]
    }

    // rename in dataChanged
    let dataChanged_new = this.state.dataChanged.map(el =>
      (oldLabels.includes(el.newLabel.label_kmedoids))
        ? { ...el, newLabel: { label_kmedoids: newLabel } }
        : el
    )

    this.setState({
      clustersToShow: newClustersToShow,
      labels: labels_new,
      clusters: clusters_new,
      dataChanged: dataChanged_new
    }, () => {
      if (didMerge) this.calc_quality()
    })
  }

  /** samples this.state.clustersToShow many coords from specified coordinates of parameter */
  updateSelectedCoordinates(callback?: () => void) {
    if (!this.state.allCoordinatesFull) {
      console.log('allCoordinates is null')
      return []
    }

    const numNeighbors = this.state.coordinatesParameters.numNeighborsParameter
    const minDist = this.state.coordinatesParameters.minDistParameter

    const rand_indices = this.getRandomIndices(this.state.labels!, this.state.clustersToShow, this.state.coordinates_to_show)
    const coordinates = rand_indices.map(i => this.state.allCoordinatesFull![numNeighbors][minDist]![i])

    this.setState({
      allCoordinates: coordinates
    }, callback)
  }

  setClustersToShow(clusters: string[], callback?: () => void) {
    this.setState({
      clustersToShow: clusters
    }, () => {
      this.updateSelectedCoordinates(callback)
    })
  }

  /** unlike getSelectedCoordinates, this returns all coordinates,
   * not only a sample
   */
  _getAllSelectedCoordinates() {
    if (!this.state.allCoordinatesFull) {
      console.log('allCoordinatesFull is null')
      return []
    }
    const numNeighbors = this.state.coordinatesParameters.numNeighborsParameter
    const minDist = this.state.coordinatesParameters.minDistParameter
    return this.state.allCoordinatesFull[numNeighbors][minDist] || []
  }

  setSelectedCoordinates(numNeighbors: ParameterNumNeighbors, minDist: ParameterMinDist) {
    this.setState({
      coordinatesParameters: {
        numNeighborsParameter: numNeighbors,
        minDistParameter: minDist
      }
    }, this.updateSelectedCoordinates) // then update svg points
  }

  /**
   * scales embeddings to values between [0, 10]
   * the index key stays untouched.
   * @param embeddings are the coordinates, has form [{x->val,y->val, index->val},...]
   * @returns an array of the coordinates of the form [[x, y, index], ...]
   */
  scaleEmbeddings(embeddings: Coordinate[]) {
    let xs = embeddings.map(e => Math.abs(e.x))
    let ys = embeddings.map(e => Math.abs(e.y))
    let max_x = _.max(xs) || 0
    let max_y = _.max(ys) || 0
    let max = Math.max(max_x, max_y)
    let scale = d3
      .scaleLinear()
      .domain([-max, max])
      .range([0, 100])
    let scaled_embeddings = embeddings.map(e => {
      const coordinate_scaled: Coordinate = {
        'x': scale(e.x), 'y': scale(e.y), 'index': e.index
      }
      return coordinate_scaled
    }
    )
    return scaled_embeddings
  }

  /**
   * picks n random elements from arr without duplicates.
   * 
   * if bigger is longer than 4/5th of arr's length, random indices of the lenght of the whole
   * list @param arr is  returned as a random picks would take too many tries to find new indices.
   * 
   * modified from
   * https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
   * 
   * @param {*} arr the original giving the shape
   * @param clustersToShow is an array of clusters to pick from
   * @param {*} n how many to pick from
   */
  getRandomIndices(arr: any[], clustersToShow: string[], n: number) {
    let indices_arr = Array.from(Array(arr.length).keys()) // why so difficult, js?

    indices_arr = indices_arr.filter(i => {
      if (!this.state.labels) return false
      return clustersToShow.includes(this.state.labels[i].label_kmedoids)
    })

    if (n > indices_arr.length * 4 / 5) {
      return indices_arr
    }

    var result = new Array(n),
      len = indices_arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = indices_arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  /**
   * how many coordinates to pcik form all clusters to show coordinates
   * @param howMany how many to numbers to pick from all clusters to show
   */
  async loadCoordinates(howMany: number) {
    var all_coordinates_full: NumNeighbors = {
      '2': { '0.1': null, '0.2': null, '0.5': null, '0.9': null } as MinDist,
      '5': { '0.1': null, '0.2': null, '0.5': null, '0.9': null } as MinDist,
      '10': { '0.1': null, '0.2': null, '0.5': null, '0.9': null } as MinDist,
      '50': { '0.1': null, '0.2': null, '0.5': null, '0.9': null } as MinDist,
    }

    // creates a combination of all above, i.e. [['2', '0.1'], ['2', '0.2'], ...]
    const allParamsPairs = Object.keys(all_coordinates_full).flatMap(
      numNeigbor => Object.keys(all_coordinates_full['2'])
        .map(mindistEl => [numNeigbor, mindistEl])
    )

    const allPromisesParamPairs: Promise<boolean>[] = allParamsPairs.map(paramaterPair => {
      const num_neighbors = paramaterPair[0]
      const min_dist = paramaterPair[1]
      return fetch(`${process.env.PUBLIC_URL}/coordinates/coordinates_supervised.${num_neighbors}.${min_dist}.json`)
        .then((fetched: Response) => fetched.json())
        .then((coordinates: Coordinate[]) => {
          const scaled_coordinates: Coordinate[] = this.scaleEmbeddings(coordinates)
          all_coordinates_full[num_neighbors][min_dist] = scaled_coordinates
          return true
        })
    })

    await Promise.all(allPromisesParamPairs)

    return this.setState({
      allCoordinatesFull: all_coordinates_full,
    }, this.calc_quality) // calc_quality doesnt do anything on first run
  }

  async reloadCoordinatesWithSize(event: React.ChangeEvent<HTMLInputElement>, callback?: () => void) {
    let size = parseInt(event.target.value) || 0

    this.setState({
      coordinates_to_show: size
    }, () => {
      this.updateSelectedCoordinates(callback)
    })
  }

  async loadDataAndSearchIndex() {
    const fetched = await fetch(`${process.env.PUBLIC_URL}/data.json`)
    let data: DataPoint[] = JSON.parse(await fetched.text())
    data.forEach((el, i) => {
      el.i = i
    })
    const search_index = lunr(function () {
      this.field('comment')
      this.field('author')
      this.field('published')

      for (let i = 0; i < data.length; i++) {
        this.add({
          'comment': data[i].cleaned,
          'author': data[i].authorName,
          'published': data[i].publishedAt,
          'id': `${i}`,
        })
      }
    })
    this.setState({
      data: data,
      searchIndex: search_index
    })
  }

  async loadLabels() {
    const fetched = await fetch(`${process.env.PUBLIC_URL}/labels.json`)
    let labels: Label[] = JSON.parse(await fetched.text())
    labels = labels.map(el => {
      return {
        label_kmedoids: `${el.label_kmedoids}`
      }
    })

    this.setState({
      labels: labels,
    })
  }

  /** normalizes cluster quality so that values are in the range [0,1] */
  _normalize_clusters(clusters: Cluster) {
    let maxQuality = 0
    for (let label in clusters) {
      maxQuality = clusters[label].quality > maxQuality ? clusters[label].quality : maxQuality
    }
    let scale = d3.scaleLinear().domain([0, maxQuality]).range([0, 1])
    for (let label in clusters) {
      clusters[label].quality = scale(clusters[label].quality)
    }
  }

  /** sets the quality for each cluster.
   * currently named as density
   */
  calc_quality() {
    // using average of squared euclidean distances
    const clusters = { ...this.state.clusters }
    for (let label in clusters) {
      if (!clusters[label].medoid) return // doesnt happen
      const coordinates = this._getAllSelectedCoordinates()
      let medoid_pos = coordinates[clusters[label].medoid!]

      let distances = coordinates.map(
        (coord) => {
          if (this.state.labels?.[coord.index].label_kmedoids != label) return
          // is of same cluster:
          let sqrd_eucl_dist = Math.sqrt(Math.pow(coord.x - medoid_pos.x, 2) + Math.pow(coord.y - medoid_pos.y, 2))
          return sqrd_eucl_dist
        }
      )

      clusters[label].quality = _.mean(distances)
    }

    this._normalize_clusters(clusters)

    this.setState({
      clusters: clusters
    })
  }

  /** loads cluster representatives from disk and creates clusters state */
  async loadClusters() {
    const fetchedReprs = await fetch(`${process.env.PUBLIC_URL}/cluster-representatives.json`)
    const representatives: { [key: string]: number[] } = JSON.parse(await fetchedReprs.text())

    const fetchedMedoids = await fetch(`${process.env.PUBLIC_URL}/medoids.json`)
    const medoids: { medoids_indices: number }[] = JSON.parse(await fetchedMedoids.text())

    let clusters: Cluster = {}

    for (let orig_label in representatives) {
      clusters[orig_label] = {
        medoid: medoids[parseInt(orig_label)].medoids_indices,
        representatives: representatives[orig_label],
        size: 0,
        quality: 0
      }
    }

    for (let label of this.state.labels!) {
      clusters[label.label_kmedoids].size += 1
    }

    this.setState({
      clusters: clusters
    }, () => this.calc_quality())
  }


  async componentDidMount() {
    await Promise.all([
      this.loadCoordinates(this.state.coordinates_to_show), // embeddings
      this.loadDataAndSearchIndex(),
      this.loadLabels(),
    ])
    await this.setSelectedCoordinates(this.state.coordinatesParameters.numNeighborsParameter, this.state.coordinatesParameters.minDistParameter)
    await this.loadClusters()
  }

  render() {
    const props: PropsFromData = {
      ...this.state,
      reloadCoordinatesWithSize: this.reloadCoordinatesWithSize,
      setSelectedCoordinates: this.setSelectedCoordinates,
      setClustersToShow: this.setClustersToShow,
      renameLabels: this.renameLabels,
      pushToDataChanged: this.pushToDataChanged,
      setHoveredCommentCoordinate: this.setHoveredCommentCoordinate,
    }
    return this.state.allCoordinates && this.state.data && this.state.labels && this.state.clusters ? (
      <Layout {...props} />
    ) : (
        <div style={{ padding: '1rem' }}>Loading data...</div>
      )
  }
}