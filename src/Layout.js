import React, { Component } from 'react'
import Sidebar from './Sidebar'
import Projection from './Projection'
import About from './About'
import * as _ from 'lodash'
import SearchBar from "material-ui-search-bar"


// padding constructor
function p(tb, lr) {
  return `${tb}px ${lr}px`
}

let color_array = [
  [141, 211, 199],
  [255, 255, 179],
  [190, 186, 218],
  [251, 128, 114],
  [128, 177, 211],
  [253, 180, 98],
  [179, 222, 105],
  [252, 205, 229],
  [188, 128, 189],
  [204, 235, 197],
]

class Layout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ww: null,
      wh: null,
      sidebar_height: null,
      selected_datum: null,
      embeddingChoiceIndex: 0, // supervised or unsupervised
      labelChoice: Object.getOwnPropertyNames(this.props.labels[0])[0],
      searchInput: "",
      searchResultIndices: {} // for faster lookup, as object of form {'id':position, ...} with position being rank in results
    }
    this.sidebar_ctx = null
    this.setSize = _.debounce(this.setSize.bind(this), 200)
    this.selectEmbedding = this.selectEmbedding.bind(this)
    this.setSelectedDatum = this.setSelectedDatum.bind(this)
    this.selectLabel = this.selectLabel.bind(this)
    this.updateSearchResultIndices = this.updateSearchResultIndices.bind(this)
    this.setEmbeddingIndex = this.setEmbeddingIndex.bind(this)
  }

  setEmbeddingIndex(i) {
    this.setState({
      embeddingChoiceIndex: i
    })
  }

  /**
   * 
   * @param {int} i is the index of the embeddings chosen
   */
  selectEmbedding(i) {
    return (i == 1) ? this.props.embeddings_supervised : this.props.embeddings_unsupervised
  }

  selectLabel(label) {
    this.setState({
      labelChoice: label
    })
  }

  setSize() {
    this.setState({ ww: window.innerWidth, wh: window.innerHeight })
    let sidebar_height = this.sidebar_mount.offsetHeight
    this.setState({ sidebar_height: sidebar_height })
    if (this.sidebar_ctx) this.sidebar_ctx.imageSmoothingEnabled = false
  }

  setHoverIndex(hover_index) {
    this.setState({ hover_index: hover_index })
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

  haveEmbeddingsChanged(prevProps) {
    return prevProps.embeddings !== this.props.embeddings || prevProps.embeddings.length !== this.props.embeddings.length
  }

  componentDidUpdate(prevProps, prevState) {
  }

  /**
   * sets the selected datum which causes it to show in the sidebar WIP
   * @param {int} i is the index of the selected datum
   */
  setSelectedDatum(i) {
    this.setState({
      selected_datum: i,
    })
  }

  updateSearchResultIndices(newVal) {
    if (newVal.length < 1) return
    let searchResults = this.props.search_index.search(newVal)
    let searchResultsCleaned = searchResults.map((result, i) => [result.ref, i])
    this.setState({
      searchInput: newVal,
      searchResultIndices: Object.fromEntries(searchResultsCleaned),
      selected_datum: null, // empty sidebar
    })
  }

  render() {
    let { data, labels, algorithm_options,
      algorithm_embedding_keys, } = this.props

    let { ww, wh, sidebar_height, hover_index, show_about,
      selected_datum, searchResultIndices } = this.state
    let sidebar_ctx = this.sidebar_ctx

    let line_height = 1.5

    let sidebar_style = {
      position: 'absolute', left: 0, top: 0,
      height: '100vh', overflow: 'auto', background: '#222',
      display: 'flex', flexDirection: 'column',
    }
    let main_style = {
      position: 'relative', height: '100vh',
      background: '#111', overflow: 'hidden',
    }

    let sidebar_image_size, sidebar_orientation
    let font_size = 16
    if (ww < 800) { // media-query mobile
      font_size = 14
      sidebar_style = {
        ...sidebar_style,
        flexDirection: 'row',
        width: '100%',
        top: 'auto',
        height: 'auto',
        bottom: 0,
      }
      main_style = { width: ww, height: wh - sidebar_height }
      sidebar_orientation = 'horizontal'
    } else if (ww < 800 + 600) { // media-query small desktop
      let scaler = 200 + (300 - 200) * ((ww - 800) / 600)
      font_size = 14 + 2 * ((ww - 800) / 600)
      sidebar_style = {
        ...sidebar_style,
        width: scaler,
      }
      main_style = {
        ...main_style,
        width: ww - scaler,
        left: scaler,
        height: wh,
      }
      sidebar_orientation = 'vertical'
    } else { // media-query desktop
      let sidebar_width = 300
      sidebar_style = {
        ...sidebar_style,
        width: sidebar_width,
      }
      main_style = {
        ...main_style,
        width: ww - sidebar_width,
        left: sidebar_width,
        height: wh,
      }
      sidebar_orientation = 'vertical'
    }

    let grem = font_size * line_height

    let general_style = {
      fontSize: font_size,
      lineHeight: line_height,
    }

    return ww !== null ? (
      <div style={general_style}>
        <div style={{ position: 'absolute', zIndex: '10', left: '50%', marginLeft: '-10vw', right: '50%', top: '4vh', width: '30vw' }}>
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
          <Sidebar
            sidebar_orientation={sidebar_orientation}
            grem={grem}
            p={p}
            color_array={color_array}
            hover_index={hover_index}
            toggleAbout={this.toggleAbout}
            algorithm_options={algorithm_options}
            embeddingChoiceIndex={this.state.embeddingChoiceIndex}
            setEmbeddingIndex={this.setEmbeddingIndex}
            selected_datum={selected_datum}
            data={data}
            labels={labels}
            labelChoice={this.state.labelChoice}
            selectLabel={this.selectLabel}
          />
        </div>
        <div style={main_style}>
          <div style={{ position: 'absolute', left: '32px', bottom: '32px', }}>
            <h6 style={{display:'inline'}}>Data Points to show: </h6>
            <input name="numDataPoints" type="text" pattern="[0-9]*" 
              style={{width:'4em', display:'inline'}}
              value={this.props.embeddings_size}
              onChange={this.props.updateEmbeddings}
            ></input>
          </div>
          <Projection
            width={main_style.width}
            height={main_style.height}
            embeddings={this.selectEmbedding(this.state.embeddingChoiceIndex)}
            data={data}
            color_array={color_array}
            sidebar_ctx={sidebar_ctx}
            sidebar_image_size={sidebar_image_size}
            algorithm_embedding_keys={algorithm_embedding_keys}
            setSelectedDatum={this.setSelectedDatum}
            selected_datum={selected_datum}
            labels={labels}
            labelChoice={this.state.labelChoice}
            searchResultIndices={searchResultIndices}
          />
        </div>
        {show_about ? (
          <About grem={grem} p={p} toggleAbout={this.toggleAbout} />
        ) : null}
      </div>
    ) : (
        <div style={{ padding: '1rem' }}>Loading layout...</div>
      )
  }
}

export default Layout
