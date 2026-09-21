import React from 'react';
import {View} from 'react-native';
import {styles} from '../../styles';
import type {Message} from '../../types';
import {MapAccountSheet} from '../AccountSheet';
import {TabScreenHeader} from './TabScreenHeader';

type MyPageTabProps = {
  message: Message;
  loading: boolean;
  userId: number;
  currentPassword: string;
  newPassword: string;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onDeleteUser: () => void;
};

export function MyPageTab({
  message,
  loading,
  userId,
  currentPassword,
  newPassword,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangePassword,
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
        currentPassword={currentPassword}
        newPassword={newPassword}
        loading={loading}
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
