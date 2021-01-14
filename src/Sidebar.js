import React, { Component } from 'react'
import Comment from './SidebarElements/Comment'
import Separator from './SidebarElements/Separator'
import Select from './SidebarElements/Select'

// if you want to change order, also change selectEmbedding in Layout.js
const dimReductionChoice = ["Don't use clustering results", 'Use clustering results']

const labelsNames = ['KMedoids', 'K-Means']

class Sidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dimReductionIndex: 0,
      labelChoiceIndex: 0,
    }
    this.handleSelectAlgorithm = this.handleSelectAlgorithm.bind(this)
    this.handleLabelChoice = this.handleLabelChoice.bind(this)
  }

  selectCommentsOfCluster() {
    let { selected_datum, data, labels } = this.props
    let labelChoice = this.props.labelChoice
    if (selected_datum === null || data === null || labels === null) return []
    return data.filter((elem, index) => {
      if (labels[index]?.[labelChoice] === labels[selected_datum]?.[labelChoice]) return true
      return false
    })
  }

  createComments(data) {
    let { sidebar_orientation } = this.props
    return data.map((element, i) => {
      if (i > 20) return
      return (
        <Comment elem={element} sidebar_orientation={sidebar_orientation} key={`cluster-peer-${i}`} dense />
      )
    })
  }

  componentDidMount() {
    this.handleSelectAlgorithm = this.handleSelectAlgorithm.bind(this)
  }

  handleSelectAlgorithm(event) {
    let i = parseInt(event.target.value) || 0
    this.props.setEmbeddingIndex(i)
  }

  handleLabelChoice(event) {
    let i = event.target.value // index of list
    this.setState({
      labelChoiceIndex: i,
    })
    let label_attribute = Object.getOwnPropertyNames(this.props.labels[0])[i]
    this.props.selectLabel(label_attribute)
  }

  render() {
    let {
      sidebar_orientation,
      grem,
      algorithm_choice,
      selected_datum,
      data,
      labels
    } = this.props

    const isOnMobile = sidebar_orientation === 'horizontal'
    const style_container = {
      width: '100%',
      height: '100%'
    }
    const style_content = { // comment + associated comments
      display: isOnMobile ? 'inline' : 'block',
      overflow: 'scroll',
      height: isOnMobile ? '100vw' : '100vh',
      width: '100%'
    }

    if (selected_datum) {
      var cluster = this.selectCommentsOfCluster()
      var comments_of_cluster = this.createComments(cluster)
    }

    return (
      <div style={style_container}>
        <div>
          <div style={style_content}>
            <Select
              title={'Dimensionality Reduction Positioning    '}
              onChange={this.handleSelectAlgorithm}
              value={this.props.embeddingChoiceIndex}
              list_of_options={dimReductionChoice}
            />
            <Select
              title={'Clustering    '}
              onChange={this.handleLabelChoice}
              value={this.state.labelChoice}
              list_of_options={labelsNames}
            />

            <Separator sidebar_orientation={sidebar_orientation} />
            {!selected_datum ? "Click on a point to see its content here"
              : <div
                style={{
                  display: 'flex',
                  flexDirection:
                    sidebar_orientation === 'horizontal' ? 'row' : 'column',
                }}
              >
                <p style={{display: 'inline', padding: '8px 16px'}}>{`${cluster.length} of ${data.length} comments in this cluster`}</p>
                <Separator sidebar_orientation={sidebar_orientation} />
                <Comment elem={data[selected_datum]} sidebar_orientation={sidebar_orientation} />
                <Separator sidebar_orientation={sidebar_orientation} />
                {comments_of_cluster}
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Sidebar
