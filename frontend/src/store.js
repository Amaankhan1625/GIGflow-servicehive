import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import gigsReducer from './features/gigsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigsReducer,
  },
});

export default store;
