import React, { Component, SFC } from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import Root from './containers/Root'

const render = (Comp: typeof Component | SFC<any>) => {
  ReactDOM.render(
    <AppContainer>
      <Comp />
    </AppContainer>,
    document.getElementById('root')
  )
}

render(Root)

declare var module: any
if (module.hot) {
  // const NextRoot = require('./containers/Root').default
  module.hot.accept('./containers/Root', () => {
    render(Root)
  })
}

// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))
