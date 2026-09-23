import React from 'react';
import {View} from 'react-native';
import {styles} from '../../styles';
import type {Message, Notification} from '../../types';
import {MapAccountSheet} from '../AccountSheet';
import {TabScreenHeader} from './TabScreenHeader';

type MyPageTabProps = {
  message: Message;
  loading: boolean;
  userId: number;
  notifications: Notification[];
  unreadNotificationCount: number;
  currentPassword: string;
  newPassword: string;
  profileName: string;
  profileNameDraft: string;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangePassword: () => void;
  onChangeProfileName: (value: string) => void;
  onUpdateProfile: () => void;
  onMarkNotificationRead: (notification: Notification) => void;
  onMarkAllNotificationsRead: () => void;
  onLogout: () => void;
  onDeleteUser: () => void;
};

export function MyPageTab({
  message,
  loading,
  userId,
  notifications,
  unreadNotificationCount,
  currentPassword,
  newPassword,
  profileName,
  profileNameDraft,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangePassword,
  onChangeProfileName,
  onUpdateProfile,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onLogout,
  onDeleteUser,
}: MyPageTabProps) {
  return (
    <View style={styles.tabScreen}>
      <TabScreenHeader
        eyebrow="My Page"
        title="마이페이지"
        message={message}
        loading={loading}
      />
      <MapAccountSheet
        userId={userId}
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
        profileName={profileName}
        profileNameDraft={profileNameDraft}
        currentPassword={currentPassword}
        newPassword={newPassword}
        loading={loading}
        onChangeProfileName={onChangeProfileName}
        onUpdateProfile={onUpdateProfile}
        onMarkNotificationRead={onMarkNotificationRead}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onChangeCurrentPassword={onChangeCurrentPassword}
        onChangeNewPassword={onChangeNewPassword}
        onChangePassword={onChangePassword}
        onLogout={onLogout}
        onDeleteUser={onDeleteUser}
        showHandle={false}
      />
    </View>
  );
}
