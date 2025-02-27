import { configureStore } from '@reduxjs/toolkit';
import { guitarSlice } from './guitarSlice';

export const store = configureStore({
  reducer: {
    guitar: guitarSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 