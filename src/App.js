import React, { Component } from 'react'
import './App.css'
import Data from './Data'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';


const themeForMaterialComponents = createMuiTheme({
  palette: {
    type: 'dark',
    background: {
      paper: '#303030'
    }
  }
})

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={themeForMaterialComponents}>
        <Data />
      </ThemeProvider>
    )
  }
}

export default App
