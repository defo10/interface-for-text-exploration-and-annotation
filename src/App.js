import React, { Component } from 'react'
import './App.css'
import Data from './Data'

import { Provider } from 'react-redux'
import store from './Store'

class App extends Component {
  render() {
    return <Provider store={store}>
      <Data />
    </Provider>
  }
}

export default App
