// this file builds the layout of the interface
import lunr from 'lunr'
import * as _ from 'lodash'
import React, { Component } from 'react'
import SplitPane from 'react-split-pane'
import { PropsFromData } from './Data'
import Projection, { PropsForProjection } from './ProjectionElements/Projection'
import ProjectionParameters from './ProjectionElements/ProjectionParameters'
import SidebarOverview, { PropsForSidebar } from './SidebarOverview'
import SidebarDetails from './SidebarDetails'

const minSizePanel = 350

export type LayoutState = {
  ww: number | null,
  wh: number | null,
  sidebar_height: number | null,
  /** is the index of the comment clicked on by the user in the projection, or null if nothing selected */
  selected_datum: number | null,
  searchInput: string,
  // for faster lookup, as object of form {'id':position, ...} with position being rank in results
  searchResultIndices: object,
  /** is the cluster of which user wants a detail view */
  selectedCluster: string | null,
  sidebar_width: number | null,
  /** the width in px of the svg element */
  svg_width: number | null,
  /** at every drag of the user, we need to redraw the svg element. This is done with the key prop */
  svgKey: string
}

class Layout extends Component<PropsFromData, LayoutState> {
  sidebar_ctx: any | null
  sidebar_mount: HTMLDivElement | null = null

  constructor(props: PropsFromData) {
    super(props)
    this.state = {
      ww: null,
      wh: null,
      sidebar_height: null,
      sidebar_width: null,
      svg_width: null,
      selected_datum: null,
      searchInput: '',
      searchResultIndices: {},
      selectedCluster: null,
      svgKey: '1'
    }
    this.sidebar_ctx = null
    this.setSize = _.debounce(this.setSize.bind(this), 200)
    this.setSelectedDatum = this.setSelectedDatum.bind(this)
    this.updateSearchResultIndices = this.updateSearchResultIndices.bind(this)
    this.selectCluster = this.selectCluster.bind(this)
  }

  selectCluster(newLabel: string) {
    this.setState({
      selectedCluster: newLabel
    })
    this.props.setChangedClusterName({
      original: newLabel,
      changed: newLabel
    })
  }

  setSize() {
    const sidebar_height = this.sidebar_mount?.offsetHeight || 0
    const sidebar_width = _.max([window.innerWidth / 4 || 350, 350]) || 350
    const svg_width = _.min([window.innerWidth - (2 * minSizePanel), 0.5 * window.innerWidth]) || window.innerWidth - (2 * minSizePanel)
    this.setState({
      sidebar_height: sidebar_height,
      sidebar_width: sidebar_width,
      svg_width: svg_width,
      ww: window.innerWidth,
      wh: window.innerHeight
    })
  }

  UNSAFE_componentWillMount() {
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
    const searchResults = this.props.searchIndex?.search(searchTerm)
    const searchResultsCleaned: any = searchResults?.map((result: lunr.Index.Result, i) => [result.ref, i])
    this.setState({
      searchInput: searchTerm,
      searchResultIndices: Object.fromEntries(searchResultsCleaned),
      selected_datum: null // empty sidebar
    })
  }

  render() {
    const sidebar_ctx = this.sidebar_ctx
    const sidebar_style: any = {
      height: this.state.wh,
      overflow: 'auto',
      background: '#222',
      display: 'flex',
      flexDirection: 'column'
    }
    const main_style: any = {
      position: 'inline-block',
      height: this.state.wh,
      background: '#111',
      overflow: 'hidden'
    }

    const sidebar_orientation = 'vertical'

    const propsForSidebar: PropsForSidebar = {
      ...this.props,
      ...this.state,
      setSelectedDatum: this.setSelectedDatum,
      selectCluster: this.selectCluster,
      sidebar_orientation: sidebar_orientation
    }

    // show all coordinates to show in array of array which is more performant
    const allCoordinatesAsArrayFilt = this.props.allCoordinates!
      .filter(d => this.props.clustersToShow.includes(this.props.labels?.[d.index].label_kmedoids || '')) // only comments of clusters set visible
      .map(d => [d.x, d.y, d.index])

    const propsForProjection: PropsForProjection = {
      ...this.props,
      width: this.state.svg_width || 0,
      height: main_style.height,
      sidebar_ctx: sidebar_ctx,
      selectedCluster: this.state.selectedCluster,
      setSelectedDatum: this.setSelectedDatum,
      selected_datum: this.state.selected_datum,
      searchResultIndices: this.state.searchResultIndices,
      selectCluster: this.selectCluster,
      allCoordinatesAsArray: allCoordinatesAsArrayFilt
    }

    /* code for search bar, add above SplitPane
    <div style={general_style}>
        <div style={{ position: 'absolute', zIndex: 10, left: '50%', marginLeft: '-10vw', right: '50%', top: '4vh', width: '30vw' }}>
          <SearchBar
            value={this.state.searchInput}
            onChange={this.updateSearchResultIndices}
          />
        </div>
        splitpane
    </div>
    */

    return this.state.ww! !== null
      ? (<SplitPane
        split="vertical"
        minSize={minSizePanel}
        maxSize={700}
        defaultSize={this.state.sidebar_width || minSizePanel}
        onChange={(newWidth) => {
          this.setState({
            sidebar_width: newWidth + 8,
            svgKey: `${parseInt(this.state.svgKey) + 1}` // forces redrawing of component
          })
        }
        }
      >
        <div
          style={sidebar_style}
          ref={sidebar_mount => {
            this.sidebar_mount = sidebar_mount
          }}
        >
          <SidebarOverview {...propsForSidebar} />
        </div>
        <SplitPane
          split="vertical"
          minSize={400}
          defaultSize={this.state.svg_width || 400}
          maxSize={this.state.ww - (2 * minSizePanel)}
          onChange={(newWidth) => {
            this.setState({
              svg_width: newWidth,
              svgKey: `${parseInt(this.state.svgKey) + 1}` // forces redrawing of component
            })
          }
          }
        >
          <div style={main_style}>
            <ProjectionParameters {...propsForProjection} />
            <Projection key={this.state.svgKey} {...propsForProjection} />
          </div>
          <div style={sidebar_style}>
            <SidebarDetails {...propsForSidebar} />
          </div>
        </SplitPane>
      </SplitPane>)
      : <div style={{ padding: '1rem' }}>Loading layout...</div>
  }
}

export default Layout
