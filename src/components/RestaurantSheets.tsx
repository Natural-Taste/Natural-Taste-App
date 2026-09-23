import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../styles';
import type {Restaurant, UserLocation} from '../types';
import {
  formatRestaurantDistance,
  formatRestaurantReview,
  getRestaurantKey,
} from '../utils/restaurants';
import {PrimaryButton} from './Common';

export function MapRestaurantSheet({
  title,
  emptyText,
  restaurants,
  savedIdSet,
  userLocation,
  loading,
  onSelectRestaurant,
  onToggleSaved,
}: {
  title: string;
  emptyText: string;
  restaurants: Restaurant[];
  savedIdSet: Set<number>;
  userLocation: UserLocation | null;
  loading: boolean;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = filterQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return restaurants;
    }

    return restaurants.filter(restaurant =>
      [
        restaurant.name,
        restaurant.address,
        restaurant.category ?? '',
        restaurant.memo ?? '',
        restaurant.tags ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [filterQuery, restaurants]);

  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{title}</Text>
        <Text style={styles.sheetCount}>{filteredRestaurants.length}곳</Text>
      </View>
      <TextInput
        style={[styles.input, styles.listFilterInput]}
        placeholder="목록에서 검색"
        value={filterQuery}
        onChangeText={setFilterQuery}
      />
      {restaurants.length === 0 ? (
        <Text style={styles.sheetEmptyText}>{emptyText}</Text>
      ) : filteredRestaurants.length === 0 ? (
        <Text style={styles.sheetEmptyText}>검색 결과가 없습니다.</Text>
      ) : (
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetList}
          showsVerticalScrollIndicator={false}>
          {filteredRestaurants.map(restaurant => {
            const saved =
              restaurant.saved ||
              (restaurant.id !== null && savedIdSet.has(restaurant.id));
            const distance = formatRestaurantDistance(restaurant, userLocation);
            const review = formatRestaurantReview(restaurant);

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
                  {distance ? (
                    <Text style={styles.restaurantDistance} numberOfLines={1}>
                      거리 {distance}
                    </Text>
                  ) : null}
                  <Text style={styles.restaurantAddress} numberOfLines={1}>
                    {restaurant.address}
                  </Text>
                  {restaurant.memo ? (
                    <Text style={styles.restaurantMeta} numberOfLines={1}>
                      메모 {restaurant.memo}
                    </Text>
                  ) : null}
                  {review ? (
                    <Text style={styles.restaurantReview} numberOfLines={1}>
                      {review}
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
  rating,
  tags,
  revisit,
  userLocation,
  loading,
  onToggleSaved,
  onChangeMemo,
  onUpdateMemo,
  onChangeRating,
  onChangeTags,
  onChangeRevisit,
  onUpdateReview,
  onClose,
}: {
  restaurant: Restaurant;
  saved: boolean;
  memo: string;
  rating: number | null;
  tags: string;
  revisit: boolean | null;
  userLocation: UserLocation | null;
  loading: boolean;
  onToggleSaved: (restaurant: Restaurant) => void;
  onChangeMemo: (value: string) => void;
  onUpdateMemo: (restaurant: Restaurant) => void;
  onChangeRating: (value: number | null) => void;
  onChangeTags: (value: string) => void;
  onChangeRevisit: (value: boolean | null) => void;
  onUpdateReview: (restaurant: Restaurant) => void;
  onClose: () => void;
}) {
  const distance = formatRestaurantDistance(restaurant, userLocation);

  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.detailTopRow}>
        <View style={styles.restaurantTextGroup}>
          <Text style={styles.detailName}>{restaurant.name}</Text>
          <Text style={styles.restaurantMeta}>
            {restaurant.category || '카테고리 미정'}
          </Text>
          {distance ? (
            <Text style={styles.restaurantDistance}>거리 {distance}</Text>
          ) : null}
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
          <Text style={styles.restaurantMeta}>내 평가</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(value => (
              <Pressable
                key={value}
                style={({pressed}) => [
                  styles.ratingButton,
                  rating === value ? styles.ratingButtonActive : null,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => onChangeRating(value)}>
                <Text
                  style={[
                    styles.ratingButtonText,
                    rating === value ? styles.ratingButtonActiveText : null,
                  ]}>
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="태그 예: 혼밥, 데이트"
            value={tags}
            onChangeText={onChangeTags}
          />
          <View style={styles.revisitRow}>
            <Pressable
              style={({pressed}) => [
                styles.secondaryButton,
                revisit === true ? styles.secondaryButtonActive : null,
                pressed ? styles.pressed : null,
              ]}
              onPress={() => onChangeRevisit(true)}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  revisit === true ? styles.secondaryButtonActiveText : null,
                ]}>
                재방문 의사 있음
              </Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.secondaryButton,
                revisit === false ? styles.secondaryButtonActive : null,
                pressed ? styles.pressed : null,
              ]}
              onPress={() => onChangeRevisit(false)}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  revisit === false ? styles.secondaryButtonActiveText : null,
                ]}>
                없음
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={({pressed}) => [
              styles.smallActionButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={() => onUpdateReview(restaurant)}
            disabled={loading}>
            <Text style={styles.smallActionButtonText}>평가 저장</Text>
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
