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
  profileName: string;
  profileNameDraft: string;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangePassword: () => void;
  onChangeProfileName: (value: string) => void;
  onUpdateProfile: () => void;
  onLogout: () => void;
  onDeleteUser: () => void;
};

export function MyPageTab({
  message,
  loading,
  userId,
  currentPassword,
  newPassword,
  profileName,
  profileNameDraft,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangePassword,
  onChangeProfileName,
  onUpdateProfile,
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
        profileName={profileName}
        profileNameDraft={profileNameDraft}
        currentPassword={currentPassword}
        newPassword={newPassword}
        loading={loading}
        onChangeProfileName={onChangeProfileName}
        onUpdateProfile={onUpdateProfile}
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
