import { combineReducers } from '@reduxjs/toolkit';
import flightSlice from './slices/flightSlice';

const rootReducer = combineReducers({
  flight: flightSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
