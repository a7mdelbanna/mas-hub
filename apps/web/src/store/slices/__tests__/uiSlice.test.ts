import { describe, it, expect } from 'vitest';
import uiReducer, { addNotification, removeNotification, clearNotifications } from '../uiSlice';

describe('uiSlice', () => {
  describe('notifications', () => {
    it('should add notification with serializable timestamp', () => {
      const initialState = {
        theme: 'system' as const,
        language: 'en' as const,
        isRTL: false,
        sidebarOpen: true,
        sidebarCollapsed: false,
        currentPortal: 'employee' as const,
        notifications: [],
      };

      const notification = {
        type: 'success' as const,
        title: 'Test Notification',
        message: 'This is a test message',
      };

      const newState = uiReducer(initialState, addNotification(notification));

      // Check that notification was added
      expect(newState.notifications).toHaveLength(1);

      // Check that timestamp is a string (ISO format)
      expect(typeof newState.notifications[0].timestamp).toBe('string');

      // Check that timestamp is a valid ISO string
      const timestamp = newState.notifications[0].timestamp;
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);

      // Check other properties
      expect(newState.notifications[0].type).toBe('success');
      expect(newState.notifications[0].title).toBe('Test Notification');
      expect(newState.notifications[0].message).toBe('This is a test message');
      expect(newState.notifications[0].read).toBe(false);
      expect(newState.notifications[0].id).toBeDefined();
    });

    it('should handle multiple notifications', () => {
      const initialState = {
        theme: 'system' as const,
        language: 'en' as const,
        isRTL: false,
        sidebarOpen: true,
        sidebarCollapsed: false,
        currentPortal: 'employee' as const,
        notifications: [],
      };

      let state = initialState;

      // Add first notification
      state = uiReducer(state, addNotification({
        type: 'info',
        title: 'First',
        message: 'First message',
      }));

      // Add second notification
      state = uiReducer(state, addNotification({
        type: 'warning',
        title: 'Second',
        message: 'Second message',
      }));

      // Check both notifications exist
      expect(state.notifications).toHaveLength(2);

      // Check both have serializable timestamps
      state.notifications.forEach(notification => {
        expect(typeof notification.timestamp).toBe('string');
        expect(() => new Date(notification.timestamp)).not.toThrow();
      });

      // Newer notification should be first (unshift)
      expect(state.notifications[0].title).toBe('Second');
      expect(state.notifications[1].title).toBe('First');
    });

    it('should remove notification by id', () => {
      const notificationId = '12345';
      const initialState = {
        theme: 'system' as const,
        language: 'en' as const,
        isRTL: false,
        sidebarOpen: true,
        sidebarCollapsed: false,
        currentPortal: 'employee' as const,
        notifications: [{
          id: notificationId,
          type: 'info' as const,
          title: 'Test',
          message: 'Test message',
          timestamp: new Date().toISOString(),
          read: false,
        }],
      };

      const newState = uiReducer(initialState, removeNotification(notificationId));
      expect(newState.notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const initialState = {
        theme: 'system' as const,
        language: 'en' as const,
        isRTL: false,
        sidebarOpen: true,
        sidebarCollapsed: false,
        currentPortal: 'employee' as const,
        notifications: [
          {
            id: '1',
            type: 'info' as const,
            title: 'Test 1',
            message: 'Message 1',
            timestamp: new Date().toISOString(),
            read: false,
          },
          {
            id: '2',
            type: 'success' as const,
            title: 'Test 2',
            message: 'Message 2',
            timestamp: new Date().toISOString(),
            read: false,
          },
        ],
      };

      const newState = uiReducer(initialState, clearNotifications());
      expect(newState.notifications).toHaveLength(0);
    });

    it('should ensure Redux serialization compatibility', () => {
      const initialState = {
        theme: 'system' as const,
        language: 'en' as const,
        isRTL: false,
        sidebarOpen: true,
        sidebarCollapsed: false,
        currentPortal: 'employee' as const,
        notifications: [],
      };

      const state = uiReducer(initialState, addNotification({
        type: 'success',
        title: 'Test',
        message: 'Test message',
      }));

      // Serialize and deserialize to test Redux compatibility
      const serialized = JSON.stringify(state);
      const deserialized = JSON.parse(serialized);

      // Check that the state can be successfully round-tripped
      expect(deserialized).toEqual(state);

      // Check that timestamp remains a string after deserialization
      expect(typeof deserialized.notifications[0].timestamp).toBe('string');
    });
  });
});