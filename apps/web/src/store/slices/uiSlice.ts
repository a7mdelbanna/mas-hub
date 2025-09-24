import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Language, PortalType } from '../../types/models';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  language: Language;
  isRTL: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  currentPortal: PortalType | 'admin';
  notifications: {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }[];
}

const initialState: UIState = {
  theme: 'system',
  language: 'en',
  isRTL: false,
  sidebarOpen: true,
  sidebarCollapsed: false,
  currentPortal: 'employee',
  notifications: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      state.isRTL = action.payload === 'ar';
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCurrentPortal: (state, action: PayloadAction<PortalType | 'admin'>) => {
      state.currentPortal = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarOpen,
  setCurrentPortal,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;