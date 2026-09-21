import React from 'react';
import {TextInput, View} from 'react-native';
import type {AuthMode} from '../types';
import {styles} from '../styles';
import {Field, PrimaryButton, TabButton} from './Common';

export function AuthPanel({
  mode,
  email,
  password,
  name,
  loading,
  onChangeMode,
  onChangeEmail,
  onChangePassword,
  onChangeName,
  onSubmit,
}: {
  mode: AuthMode;
  email: string;
  password: string;
  name: string;
  loading: boolean;
  onChangeMode: (mode: AuthMode) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeName: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.segmentedControl}>
        <TabButton
          label="로그인"
          active={mode === 'login'}
          onPress={() => onChangeMode('login')}
        />
        <TabButton
          label="회원가입"
          active={mode === 'signup'}
          onPress={() => onChangeMode('signup')}
        />
      </View>
      {mode === 'signup' ? (
        <Field label="이름">
          <TextInput
            style={styles.input}
            placeholder="이름"
            value={name}
            onChangeText={onChangeName}
          />
        </Field>
      ) : null}
      <Field label="이메일">
        <TextInput
          style={styles.input}
          placeholder="foodmap@example.com"
          value={email}
          onChangeText={onChangeEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </Field>
      <Field label="비밀번호">
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={onChangePassword}
          secureTextEntry
        />
      </Field>
      <PrimaryButton
        label={mode === 'login' ? '로그인' : '회원가입'}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  );
}
