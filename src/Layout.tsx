import React, { Component } from 'react'
import Sidebar, { PropsForSidebar } from './Sidebar'
import Projection, { PropsForProjection } from './ProjectionElements/Projection'
import ProjectionParameters from './ProjectionElements/ProjectionParameters'
import About from './About'
import * as _ from 'lodash'
import SearchBar from "material-ui-search-bar"
import { PropsFromData, Label } from './Data'
import { least } from 'd3'
import SlidersParamter from './ProjectionElements/Sliders'
import DragBar, { DRAGBAR_GUTTER } from './DragBar'


// padding constructor
function p(tb: number, lr: number) {
  return `${tb}px ${lr}px`
}

export type LayoutState = {
  ww: number | null,
  wh: number | null,
  sidebar_height: number | null,
  selected_datum: number | null,
  searchInput: string,
  // for faster lookup, as object of form {'id':position, ...} with position being rank in results
  searchResultIndices: object,
  /** is the cluster of which user wants a detail view */
  selectedCluster: string | null,
  sidebar_width: number | null,
}

class Layout extends Component<PropsFromData, LayoutState> {
  sidebar_ctx: any | null
  sidebar_mount: any

  constructor(props: PropsFromData) {
    super(props)
    this.state = {
      ww: null,
      wh: null,
      sidebar_height: null,
      sidebar_width: null,
      selected_datum: null,
      searchInput: "",
      searchResultIndices: {},
      selectedCluster: null,
    }
    this.sidebar_ctx = null
    this.setSize = _.debounce(this.setSize.bind(this), 200)
    this.setSelectedDatum = this.setSelectedDatum.bind(this)
    this.updateSearchResultIndices = this.updateSearchResultIndices.bind(this)
    this.selectCluster = this.selectCluster.bind(this)
  }

  selectCluster(newLabel: string | null) {
    this.setState({
      selectedCluster: newLabel
    })
  }

  setSize() {
    this.setState({ ww: window.innerWidth, wh: window.innerHeight })
    let sidebar_height = this.sidebar_mount.offsetHeight
    let sidebar_width = window.innerWidth / 3
    this.setState({ sidebar_height: sidebar_height, sidebar_width: sidebar_width })
  }

  componentWillMount() {
    this.setSize()
  }

  componentDidMount() {
    window.addEventListener('resize', this.setSize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setSize)
  }

  haveEmbeddingsChanged(prevProps: PropsFromData) {
    return prevProps.embeddings !== this.props.embeddings || prevProps.embeddings.length !== this.props.embeddings.length
  }

  /**
   * sets the selected datum which causes it to show in the sidebar 
   * @param {int} i is the index of the selected datum
   */
  setSelectedDatum(i: number | null) {
    if (!this.props.labels) return
    this.setState({
      selected_datum: i,
      selectedCluster: (i) ? this.props.labels[i].label_kmedoids : null
    })
  }


  updateSearchResultIndices(searchTerm: string) {
    if (searchTerm.length < 1) return
    let searchResults = this.props.searchIndex?.search(searchTerm)
    let searchResultsCleaned: any = searchResults?.map((result: lunr.Index.Result, i) => [result.ref, i])
    this.setState({
      searchInput: searchTerm,
      searchResultIndices: Object.fromEntries(searchResultsCleaned),
      selected_datum: null, // empty sidebar
    })
  }

  render() {
    let sidebar_ctx = this.sidebar_ctx
    let line_height = 1.5
    let sidebar_style: any = {
      position: 'absolute', left: 0, top: 0,
      height: '100vh', overflow: 'auto', background: '#222',
      display: 'flex', flexDirection: 'column',
    }
    let main_style: any = {
      position: 'relative', height: '100vh',
      background: '#111', overflow: 'hidden',
    }

    let sidebar_orientation
    let font_size = 16
    sidebar_style = {
      ...sidebar_style,
      width: this.state.sidebar_width,
    }
    main_style = {
      ...main_style,
      width: this.state.ww! - (this.state.sidebar_width || 0),
      left: this.state.sidebar_width,
      height: this.state.wh!,
    }
    sidebar_orientation = 'vertical'

    let grem = font_size * line_height

    let general_style = {
      fontSize: font_size,
      lineHeight: line_height,
    }

    const propsForSidebar: PropsForSidebar = {
      ...this.props,
      ...this.state,
      setSelectedDatum: this.setSelectedDatum,
      selectCluster: this.selectCluster,
      sidebar_orientation: sidebar_orientation,
    }

    const propsForProjection: PropsForProjection = {
      ...this.props,
      width: main_style.width,
      height: main_style.height,
      sidebar_ctx: sidebar_ctx,
      selectedCluster: this.state.selectedCluster,
      setSelectedDatum: this.setSelectedDatum,
      selected_datum: this.state.selected_datum,
      searchResultIndices: this.state.searchResultIndices,
      selectCluster: this.selectCluster
    }


    return this.state.ww! !== null ? (
      <div style={general_style}>
        <div style={{ position: 'absolute', zIndex: 10, left: '50%', marginLeft: '-10vw', right: '50%', top: '4vh', width: '30vw' }}>
          <SearchBar
            value={this.state.searchInput}
            onChange={this.updateSearchResultIndices}
          />
        </div>
        <div
          style={sidebar_style}
          ref={sidebar_mount => {
            this.sidebar_mount = sidebar_mount
          }}
        >
          <Sidebar {...propsForSidebar} />
        </div>
        <div style={main_style}>
          <ProjectionParameters {...propsForProjection} />
          <Projection {...propsForProjection} />
        </div>
      </div>
    ) : (
        <div style={{ padding: '1rem' }}>Loading layout...</div>
      )
  }
}

export default Layout
