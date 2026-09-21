import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {styles} from '../styles';
import type {Message} from '../types';

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function MessageBox({message, loading}: {message: Message; loading: boolean}) {
  return (
    <View
      style={[
        styles.messageBox,
        message.tone === 'error' ? styles.messageError : null,
        message.tone === 'success' ? styles.messageSuccess : null,
      ]}>
      {loading ? <ActivityIndicator color="#49624A" /> : null}
      <Text style={styles.messageText}>{message.text}</Text>
    </View>
  );
}

export function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.tabButton,
        active ? styles.tabButtonActive : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}>
      <Text style={[styles.tabButtonText, active ? styles.tabButtonTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.primaryButton,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}
