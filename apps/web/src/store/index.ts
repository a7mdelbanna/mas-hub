import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authSlice } from './slices/authSlice';
import { uiSlice } from './slices/uiSlice';
import { api } from '../lib/api/baseApi';
import { mockAuthApi } from '../lib/api/mockAuthApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    [api.reducerPath]: api.reducer,
    [mockAuthApi.reducerPath]: mockAuthApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
        ignoredPaths: [
          'auth.user.createdAt',
          'auth.user.updatedAt',
          'auth.user.startDate',
          'auth.user.endDate',
          'auth.user.metadata',
          'auth.user.metadata.createdAt',
          'auth.user.metadata.updatedAt',
          'auth.user.metadata.lastLoginAt',
        ],
      },
    }).concat(api.middleware, mockAuthApi.middleware),
  devTools: import.meta.env.DEV,
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export slice exports for convenience
export * from './slices/authSlice';
export * from './slices/uiSlice';