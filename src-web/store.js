import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import BaseReducer from './reducers/BaseServiceReducer'

const reducer = combineReducers({
  baseInfo: BaseReducer,
})

export default createStore(reducer,
  composeWithDevTools(
    applyMiddleware(thunk)
  )
)
