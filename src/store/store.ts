import { configureStore } from '@reduxjs/toolkit';
import guitarSliceReducer from './guitar-slice';

export const store = configureStore({
  reducer: {
    guitar: guitarSliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 