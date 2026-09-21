import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {styles} from '../../styles';
import type {ActivePanel} from '../../types';

type BottomTabBarProps = {
  activePanel: ActivePanel;
  loading: boolean;
  onOpenMap: () => void;
  onOpenCommunity: () => void;
  onOpenSearch: () => void;
  onOpenMyPage: () => void;
};

export function BottomTabBar({
  activePanel,
  loading,
  onOpenMap,
  onOpenCommunity,
  onOpenSearch,
  onOpenMyPage,
}: BottomTabBarProps) {
  return (
    <View style={styles.bottomTabBar}>
      <BottomTabButton
        label="지도"
        active={activePanel === 'map'}
        disabled={loading}
        onPress={onOpenMap}
      />
      <BottomTabButton
        label="커뮤니티"
        active={activePanel === 'community'}
        disabled={loading}
        onPress={onOpenCommunity}
      />
      <BottomTabButton
        label="검색"
        active={activePanel === 'search'}
        disabled={loading}
        onPress={onOpenSearch}
      />
      <BottomTabButton
        label="마이페이지"
        active={activePanel === 'mypage'}
        disabled={loading}
        onPress={onOpenMyPage}
      />
    </View>
  );
}

type BottomTabButtonProps = {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
};

function BottomTabButton({
  label,
  active,
  disabled,
  onPress,
}: BottomTabButtonProps) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.bottomTabButton,
        active ? styles.bottomTabButtonActive : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <View
        style={[
          styles.bottomTabIndicator,
          active ? styles.bottomTabIndicatorActive : null,
        ]}
      />
      <Text
        style={[
          styles.bottomTabButtonText,
          active ? styles.bottomTabButtonTextActive : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}
