import React, { Component } from 'react'
import Sidebar, { PropsForSidebar } from './Sidebar'
import Sidebar2 from './Sidebar2'
import Projection, { PropsForProjection } from './ProjectionElements/Projection'
import ProjectionParameters from './ProjectionElements/ProjectionParameters'
import About from './About'
import * as _ from 'lodash'
import SearchBar from "material-ui-search-bar"
import { PropsFromData, Label } from './Data'
import { least } from 'd3'
import SlidersParamter from './ProjectionElements/Sliders'
import SplitPane from 'react-split-pane'

const minSizePanel = 350

// padding constructor
function p(tb: number, lr: number) {
  return `${tb}px ${lr}px`
}

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
      searchInput: "",
      searchResultIndices: {},
      selectedCluster: null,
      svgKey: "1",
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
    let sidebar_height = this.sidebar_mount?.offsetHeight || 0
    let sidebar_width = _.max([window.innerWidth / 4 || 350, 350]) || 350
    let svg_width = 0.5 * window.innerWidth
    this.setState({
      sidebar_height: sidebar_height,
      sidebar_width: sidebar_width,
      svg_width: svg_width,
      ww: window.innerWidth,
      wh: window.innerHeight,
    })
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
      height: this.state.wh,
      overflow: 'auto', background: '#222',
      display: 'flex', flexDirection: 'column',
    }
    let main_style: any = {
      position: 'inline-block', height: this.state.wh,
      background: '#111', overflow: 'hidden',
    }

    let sidebar_orientation
    let font_size = 16
    sidebar_orientation = 'vertical'

    let grem = font_size * line_height

    const propsForSidebar: PropsForSidebar = {
      ...this.props,
      ...this.state,
      setSelectedDatum: this.setSelectedDatum,
      selectCluster: this.selectCluster,
      sidebar_orientation: sidebar_orientation,
    }

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
    }

    /* code for search bar, add above splitpane
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

    return this.state.ww! !== null ? (
      <SplitPane
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
          <Sidebar {...propsForSidebar} />
        </div>
        <SplitPane
          split="vertical"
          minSize={400}
          defaultSize={this.state.svg_width || 400}
          maxSize={(this.state.ww - (this.state.sidebar_width || 0)) / 10 * 8}
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
            <Sidebar2 {...propsForSidebar} />
          </div>
        </SplitPane>
      </SplitPane>
    ) : (
        <div style={{ padding: '1rem' }}>Loading layout...</div>
      )
  }
}

export default Layout
