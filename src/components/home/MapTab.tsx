import React from 'react';
import {ActivityIndicator, Pressable, Text, TextInput, useWindowDimensions, View} from 'react-native';
import {styles} from '../../styles';
import type {Message, Restaurant} from '../../types';
import {findSavedRestaurant} from '../../utils/restaurants';
import {MapPreview} from '../MapPreview';
import {MapRestaurantDetail, MapRestaurantSheet} from '../RestaurantSheets';

type MapTabProps = {
  query: string;
  message: Message;
  loading: boolean;
  restaurants: Restaurant[];
  savedRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  restaurantMemo: string;
  savedIdSet: Set<number>;
  onChangeQuery: (value: string) => void;
  onSearch: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
  onChangeRestaurantMemo: (value: string) => void;
  onUpdateRestaurantMemo: (restaurant: Restaurant) => void;
  onCloseDetail: () => void;
};

export function MapTab({
  query,
  message,
  loading,
  restaurants,
  savedRestaurants,
  selectedRestaurant,
  restaurantMemo,
  savedIdSet,
  onChangeQuery,
  onSearch,
  onSelectRestaurant,
  onToggleSaved,
  onChangeRestaurantMemo,
  onUpdateRestaurantMemo,
  onCloseDetail,
}: MapTabProps) {
  const {height} = useWindowDimensions();
  const hasSearchResults = restaurants.length > 0;
  const mapRestaurants = hasSearchResults ? restaurants : savedRestaurants;
  const sheetRestaurants = selectedRestaurant
    ? []
    : hasSearchResults
      ? restaurants
      : savedRestaurants;
  const savedSelectedRestaurant = selectedRestaurant
    ? findSavedRestaurant(selectedRestaurant, savedRestaurants)
    : null;
  const detailRestaurant =
    selectedRestaurant && savedSelectedRestaurant
      ? {...selectedRestaurant, ...savedSelectedRestaurant, saved: true}
      : selectedRestaurant;

  return (
    <>
      <MapPreview
        restaurants={mapRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={onSelectRestaurant}
      />

      <View style={styles.mapTopPanel}>
        <View style={styles.mapBrandRow}>
          <View>
            <Text style={styles.mapEyebrow}>Natural Taste</Text>
            <Text style={styles.mapTitle}>내 주변 맛집 지도</Text>
          </View>
        </View>

        <View style={styles.mapSearchBar}>
          <TextInput
            style={styles.mapSearchInput}
            placeholder="지역, 음식, 가게 검색"
            value={query}
            onChangeText={onChangeQuery}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
          <Pressable
            style={({pressed}) => [
              styles.mapSearchButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={onSearch}
            disabled={loading}>
            <Text style={styles.mapSearchButtonText}>검색</Text>
          </Pressable>
        </View>

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

      <View
        style={[
          styles.bottomSheet,
          styles.bottomSheetAboveTabs,
          {maxHeight: Math.max(230, height * 0.42)},
        ]}>
        {detailRestaurant ? (
          <MapRestaurantDetail
            restaurant={detailRestaurant}
            saved={Boolean(detailRestaurant.saved || savedSelectedRestaurant)}
            memo={restaurantMemo}
            loading={loading}
            onToggleSaved={onToggleSaved}
            onChangeMemo={onChangeRestaurantMemo}
            onUpdateMemo={onUpdateRestaurantMemo}
            onClose={onCloseDetail}
          />
        ) : (
          <MapRestaurantSheet
            title={hasSearchResults ? '검색 결과' : '저장한 맛집'}
            emptyText={
              hasSearchResults
                ? '검색 결과가 없습니다.'
                : '저장한 맛집이 지도에 표시됩니다.'
            }
            restaurants={sheetRestaurants}
            savedIdSet={savedIdSet}
            loading={loading}
            onSelectRestaurant={onSelectRestaurant}
            onToggleSaved={onToggleSaved}
          />
        )}
      </View>
    </>
  );
}
