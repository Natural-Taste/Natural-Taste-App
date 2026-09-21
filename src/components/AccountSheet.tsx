import React from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';
import {styles} from '../styles';
import {Field, PrimaryButton} from './Common';

export function MapAccountSheet({
  userId,
  profileName,
  profileNameDraft,
  currentPassword,
  newPassword,
  loading,
  onChangeProfileName,
  onUpdateProfile,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangePassword,
  onLogout,
  onDeleteUser,
  onClose,
  showHandle = true,
}: {
  userId: number;
  profileName: string;
  profileNameDraft: string;
  currentPassword: string;
  newPassword: string;
  loading: boolean;
  onChangeProfileName: (value: string) => void;
  onUpdateProfile: () => void;
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
