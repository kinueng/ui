import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import BaseReducer from './reducers/BaseServiceReducer';

const reducer = combineReducers({
  baseInfo: BaseReducer,
})

export default createStore(
  reducer,
  applyMiddleware(thunk)
);
