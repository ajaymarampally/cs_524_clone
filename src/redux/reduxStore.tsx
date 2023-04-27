import { configureStore } from '@reduxjs/toolkit';
import reduxRoot from './reduxRoot';
import {persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';


const persistConfig = {
    key: 'root',
    storage
};

const persistedReducer = persistReducer(persistConfig, reduxRoot);


const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk]
});

export default store;
