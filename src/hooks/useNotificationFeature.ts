import {useState} from 'react';
import {request, getErrorMessage} from '../api/client';
import type {AuthResponse, Message, Notification} from '../types';

type UseNotificationFeatureParams = {
  auth: AuthResponse | null;
  setMessage: (message: Message) => void;
};

type UnreadCountResponse = {
  unreadCount: number;
};

export function useNotificationFeature({
  auth,
  setMessage,
}: UseNotificationFeatureParams) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const resetNotifications = () => {
    setNotifications([]);
    setUnreadNotificationCount(0);
  };

  const loadNotificationCount = async (authOverride?: AuthResponse) => {
    const activeAuth = authOverride ?? auth;
    if (!activeAuth) {
      return;
    }

    try {
      const data = await request<UnreadCountResponse>('/notifications/unread-count', {
        auth: activeAuth,
      });
      setUnreadNotificationCount(data.unreadCount);
    } catch {
      setUnreadNotificationCount(0);
    }
  };

  const loadNotifications = async (authOverride?: AuthResponse) => {
    const activeAuth = authOverride ?? auth;
    if (!activeAuth) {
      return;
    }

    try {
      const data = await request<Notification[]>('/notifications', {auth: activeAuth});
      setNotifications(data);
      setUnreadNotificationCount(data.filter(notification => !notification.read).length);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '알림 조회에 실패했습니다.'),
      });
    }
  };

  const markNotificationRead = async (notification: Notification) => {
    if (!auth || notification.read) {
      return;
    }

    try {
      const updated = await request<Notification>(
        `/notifications/${notification.id}/read`,
        {method: 'PATCH', auth},
      );
      setNotifications(current =>
        current.map(item => (item.id === updated.id ? updated : item)),
      );
      setUnreadNotificationCount(current => Math.max(current - 1, 0));
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '알림 읽음 처리에 실패했습니다.'),
      });
    }
  };

  const markAllNotificationsRead = async () => {
    if (!auth || unreadNotificationCount === 0) {
      return;
    }

    try {
      await request('/notifications/read-all', {method: 'PATCH', auth});
      setNotifications(current =>
        current.map(notification => ({...notification, read: true})),
      );
      setUnreadNotificationCount(0);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '알림 전체 읽음 처리에 실패했습니다.'),
      });
    }
  };

  return {
    notifications,
    unreadNotificationCount,
    resetNotifications,
    loadNotificationCount,
    loadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  };
}
