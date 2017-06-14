import { createStore, combineReducers, applyMiddleware, compose, Store } from 'redux'
import { History } from 'history'
import thunk from 'redux-thunk'
import promiseMiddleware from 'redux-promise-middleware'
import { createLogger } from 'redux-logger'
import { routerReducer, routerMiddleware, push } from 'react-router-redux'
import reducers from './reducers' // Or wherever you keep your reducers
// Fix https://github.com/benmosher/eslint-plugin-import/issues/708
// eslint-disable-next-line import/named

// https://github.com/zalmoxisus/redux-devtools-extension
let composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export type ActionType = {
  type: string,
  payload?: object | Promise<any> | {
    promise: Promise<any>,
    data?: object,
  },
  meta?: object,
}

export type State = {
  location?: Location,
} | Object

declare var module: any
export default function configureStore(history: History, initialState: State = {}): Store<State> {
  let middlewares = [thunk, promiseMiddleware(), routerMiddleware(history)]
  if (process.env.NODE_ENV === 'development') {
    middlewares.unshift(createLogger())
  }
  let middlewareEnhancer = applyMiddleware(...middlewares)
  // Build the middleware for intercepting and dispatching navigation actions

  // Add the reducer to your store on the `router` key
  // Also apply our middleware for navigating
  const store: Store<State> = createStore(
    combineReducers({
      ...reducers,
      router: routerReducer,
    }),
    initialState,
    composeEnhancers(middlewareEnhancer)
  )
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      store.replaceReducer(reducers)
    })
  }
  return store
}
