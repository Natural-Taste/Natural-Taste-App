import React from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../styles';
import type {Restaurant} from '../types';
import {getRestaurantKey} from '../utils/restaurants';
import {PrimaryButton} from './Common';

export function MapRestaurantSheet({
  title,
  emptyText,
  restaurants,
  savedIdSet,
  loading,
  onSelectRestaurant,
  onToggleSaved,
}: {
  title: string;
  emptyText: string;
  restaurants: Restaurant[];
  savedIdSet: Set<number>;
  loading: boolean;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
}) {
  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{title}</Text>
        <Text style={styles.sheetCount}>{restaurants.length}곳</Text>
      </View>
      {restaurants.length === 0 ? (
        <Text style={styles.sheetEmptyText}>{emptyText}</Text>
      ) : (
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetList}
          showsVerticalScrollIndicator={false}>
          {restaurants.map(restaurant => {
            const saved =
              restaurant.saved ||
              (restaurant.id !== null && savedIdSet.has(restaurant.id));

            return (
              <Pressable
                key={getRestaurantKey(restaurant)}
                style={({pressed}) => [
                  styles.sheetRestaurant,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => onSelectRestaurant(restaurant)}>
                <View style={styles.restaurantTextGroup}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantMeta} numberOfLines={1}>
                    {restaurant.category || '카테고리 미정'}
                  </Text>
                  <Text style={styles.restaurantAddress} numberOfLines={1}>
                    {restaurant.address}
                  </Text>
                  {restaurant.memo ? (
                    <Text style={styles.restaurantMeta} numberOfLines={1}>
                      메모 {restaurant.memo}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={({pressed}) => [
                    styles.sheetSaveButton,
                    saved ? styles.sheetSaveButtonActive : null,
                    pressed ? styles.pressed : null,
                    loading ? styles.disabled : null,
                  ]}
                  onPress={() => onToggleSaved(restaurant)}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.sheetSaveButtonText,
                      saved ? styles.sheetSaveButtonActiveText : null,
                    ]}>
                    {saved ? '저장됨' : '저장'}
                  </Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

export function MapRestaurantDetail({
  restaurant,
  saved,
  memo,
  loading,
  onToggleSaved,
  onChangeMemo,
  onUpdateMemo,
  onClose,
}: {
  restaurant: Restaurant;
  saved: boolean;
  memo: string;
  loading: boolean;
  onToggleSaved: (restaurant: Restaurant) => void;
  onChangeMemo: (value: string) => void;
  onUpdateMemo: (restaurant: Restaurant) => void;
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.detailTopRow}>
        <View style={styles.restaurantTextGroup}>
          <Text style={styles.detailName}>{restaurant.name}</Text>
          <Text style={styles.restaurantMeta}>
            {restaurant.category || '카테고리 미정'}
          </Text>
        </View>
        <Pressable
          style={({pressed}) => [
            styles.closeButton,
            pressed ? styles.pressed : null,
          ]}
          onPress={onClose}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </Pressable>
      </View>
      <Text style={styles.detailLine}>{restaurant.address}</Text>
      {restaurant.phone ? (
        <Text style={styles.detailLine}>전화 {restaurant.phone}</Text>
      ) : null}
      {restaurant.placeUrl ? (
        <Text style={styles.detailLine}>장소 URL {restaurant.placeUrl}</Text>
      ) : null}
      {saved ? (
        <View style={styles.memoBox}>
          <Text style={styles.restaurantMeta}>내 메모</Text>
          <TextInput
            style={[styles.input, styles.memoInput]}
            placeholder="맛집 메모"
            value={memo}
            onChangeText={onChangeMemo}
            multiline
          />
          <Pressable
            style={({pressed}) => [
              styles.smallActionButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={() => onUpdateMemo(restaurant)}
            disabled={loading}>
            <Text style={styles.smallActionButtonText}>메모 저장</Text>
          </Pressable>
        </View>
      ) : null}
      <PrimaryButton
        label={saved ? '저장 취소' : '맛집 저장'}
        onPress={() => onToggleSaved(restaurant)}
        disabled={loading}
      />
    </View>
  );
}
