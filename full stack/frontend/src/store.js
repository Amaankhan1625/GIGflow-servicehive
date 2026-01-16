import { configureStore } from '@reduxjs/toolkit';
import io from 'socket.io-client';
import authReducer from './features/authSlice';
import gigsReducer from './features/gigsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigsReducer,
  },
});

export const socket = io('http://localhost:5000');

export default store;
