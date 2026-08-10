/**
 * Notification Store — Zustand
 *
 * Manages the state for the in-app Notification Center.
 * Stores a list of historical notifications (alerts, reports, etc.)
 * so the user can view them by clicking the bell icon.
 */

import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string; // ISO string
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => {
      const newNotif: AppNotification = {
        ...notification,
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(),
        isRead: false,
      };
      // Prepend to show newest first
      return { notifications: [newNotif, ...state.notifications] };
    }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  clearAll: () => set({ notifications: [] }),

  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
