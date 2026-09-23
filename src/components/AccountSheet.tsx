import React from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../styles';
import type {Notification} from '../types';
import {formatDate} from '../utils/date';
import {Field, PrimaryButton} from './Common';

export function MapAccountSheet({
  userId,
  notifications,
  unreadNotificationCount,
  profileName,
  profileNameDraft,
  currentPassword,
  newPassword,
  loading,
  onChangeProfileName,
  onUpdateProfile,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangePassword,
  onLogout,
  onDeleteUser,
  onClose,
  showHandle = true,
}: {
  userId: number;
  notifications: Notification[];
  unreadNotificationCount: number;
  profileName: string;
  profileNameDraft: string;
  currentPassword: string;
  newPassword: string;
  loading: boolean;
  onChangeProfileName: (value: string) => void;
  onUpdateProfile: () => void;
  onMarkNotificationRead: (notification: Notification) => void;
  onMarkAllNotificationsRead: () => void;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onDeleteUser: () => void;
  onClose?: () => void;
  showHandle?: boolean;
}) {
  return (
    <View>
      {showHandle ? <View style={styles.sheetHandle} /> : null}
      <View style={styles.detailTopRow}>
        <View style={styles.restaurantTextGroup}>
          <Text style={styles.sheetTitle}>회원 정보</Text>
          <Text style={styles.restaurantMeta}>
            {profileName || '이름 미설정'} · 회원 번호 {userId}
          </Text>
        </View>
        {onClose ? (
          <Pressable
            style={({pressed}) => [
              styles.closeButton,
              pressed ? styles.pressed : null,
            ]}
            onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        ) : null}
      </View>
      <Field label="이름">
        <View style={styles.inlineSearchRow}>
          <TextInput
            style={[styles.input, styles.inlineSearchInput]}
            placeholder="표시 이름"
            value={profileNameDraft}
            onChangeText={onChangeProfileName}
          />
          <Pressable
            style={({pressed}) => [
              styles.inlineSearchButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={onUpdateProfile}
            disabled={loading}>
            <Text style={styles.inlineSearchButtonText}>저장</Text>
          </Pressable>
        </View>
      </Field>
      <View style={styles.notificationSection}>
        <View style={styles.notificationHeader}>
          <Text style={styles.savedPlaceTitle}>
            알림 {unreadNotificationCount > 0 ? `${unreadNotificationCount}개` : ''}
          </Text>
          {unreadNotificationCount > 0 ? (
            <Pressable
              style={({pressed}) => [
                styles.smallActionButton,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={onMarkAllNotificationsRead}
              disabled={loading}>
              <Text style={styles.smallActionButtonText}>모두 읽음</Text>
            </Pressable>
          ) : null}
        </View>
        {notifications.length > 0 ? (
          <ScrollView style={styles.notificationList}>
            <View style={styles.savedPlaceList}>
              {notifications.map(notification => (
                <Pressable
                  key={notification.id}
                  style={({pressed}) => [
                    styles.notificationItem,
                    !notification.read ? styles.notificationItemUnread : null,
                    pressed ? styles.pressed : null,
                  ]}
                  onPress={() => onMarkNotificationRead(notification)}>
                  <View style={styles.restaurantTextGroup}>
                    <Text style={styles.restaurantName}>{notification.message}</Text>
                    <Text style={styles.restaurantMeta}>{formatDate(notification.createdAt)}</Text>
                  </View>
                  {!notification.read ? (
                    <Text style={styles.notificationUnreadText}>새 알림</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.savedPlaceEmpty}>아직 알림이 없습니다.</Text>
        )}
      </View>
      <Field label="현재 비밀번호">
        <TextInput
          style={styles.input}
          placeholder="현재 비밀번호"
          value={currentPassword}
          onChangeText={onChangeCurrentPassword}
          secureTextEntry
        />
      </Field>
      <Field label="새 비밀번호">
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호"
          value={newPassword}
          onChangeText={onChangeNewPassword}
          secureTextEntry
        />
      </Field>
      <View style={styles.accountActionGrid}>
        <PrimaryButton
          label="비밀번호 수정"
          onPress={onChangePassword}
          disabled={loading}
        />
        <View style={styles.accountSecondaryRow}>
          <Pressable
            style={({pressed}) => [
              styles.accountSecondaryButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={onLogout}
            disabled={loading}>
            <Text style={styles.accountSecondaryButtonText}>로그아웃</Text>
          </Pressable>
          <Pressable
            style={({pressed}) => [
              styles.accountDangerButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={onDeleteUser}
            disabled={loading}>
            <Text style={styles.accountDangerButtonText}>회원탈퇴</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
