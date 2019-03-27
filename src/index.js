import 'react-hot-loader/patch'

import React from 'react'
import getRoot from 'get-root'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'

const doRender = Component => {
  render(
    <Router>
      <AppContainer>
        <Component />
      </AppContainer>
    </Router>,
    getRoot()
  )
}

doRender(App)

if (module.hot) {
  module.hot.accept('./App', () => {
    const next = require('./App')
    doRender(next.default)
  })
}
