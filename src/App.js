import { createMuiTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import React, { Component } from 'react';
import './App.css';
import Data from './Data';


const themeForMaterialComponents = responsiveFontSizes(createMuiTheme({
  palette: {
    type: 'dark',
    background: {
      paper: '#303030'
    }
  }
}))

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
