import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {styles} from '../../styles';
import type {Message} from '../../types';

type TabScreenHeaderProps = {
  eyebrow: string;
  title: string;
  message: Message;
  loading: boolean;
};

export function TabScreenHeader({
  eyebrow,
  title,
  message,
  loading,
}: TabScreenHeaderProps) {
  return (
    <View style={styles.tabScreenHeader}>
      <Text style={styles.mapEyebrow}>{eyebrow}</Text>
      <Text style={styles.tabScreenTitle}>{title}</Text>
      <View
        style={[
          styles.mapStatus,
          message.tone === 'error' ? styles.messageError : null,
          message.tone === 'success' ? styles.messageSuccess : null,
        ]}>
        {loading ? <ActivityIndicator color="#49624A" /> : null}
        <Text style={styles.mapStatusText} numberOfLines={2}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}
