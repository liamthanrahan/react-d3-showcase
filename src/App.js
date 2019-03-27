import React, { Component } from 'react'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import Site from './components/Site'
import reducer from './reducer'

const store = createStore(reducer, applyMiddleware(thunk))

export class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Site />
      </Provider>
    )
  }
}

export default App
