import { createMuiTheme, responsiveFontSizes, ThemeProvider } from '@material-ui/core/styles';
import React, { Component } from 'react';
import './App.css';
import Data from './Data';


const themeForMaterialComponents = responsiveFontSizes(createMuiTheme({
  palette: {
    type: 'dark',
    secondary: {
      main: 'rgba(255, 255, 255, 1)',
      dark: 'rgba(255, 255, 255, 1)',
      light: 'rgba(255, 255, 255, 1)'
    },
    primary: {
      main: 'rgba(255, 255, 255, 1)',
      dark: 'rgba(255, 255, 255, 1)',
      light: 'rgba(255, 255, 255, 1)'
    },
    background: {
      paper: '#303030'
    },
  },
  overrides: {
    MuiTableRow: {
      "root": {
        "&$selected": {
          "backgroundColor": 'rgba(255, 255, 255, 0.15)',
          "&:hover": {
            "backgroundColor": 'rgba(255, 255, 255, 0.05)',
          }
        }
      }
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
