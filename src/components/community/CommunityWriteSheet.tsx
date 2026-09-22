import React from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../../styles';
import type {Restaurant} from '../../types';
import {getRestaurantKey} from '../../utils/restaurants';
import {Field, PrimaryButton} from '../Common';
import {CommunityImagePreview} from './CommunityImagePreview';

type CommunityWriteSheetProps = {
  draftRestaurant: Restaurant | null;
  placeQuery: string;
  placeResults: Restaurant[];
  title: string;
  content: string;
  imageUrl: string;
  imageUploading: boolean;
  savedRestaurants: Restaurant[];
  loading: boolean;
  showHandle: boolean;
  onCancelPost: () => void;
  onSearchPlaces: () => void;
  onSelectPlace: (restaurant: Restaurant) => void;
  onPickImage: () => void;
  onCreatePost: () => void;
  onChangePlaceQuery: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeImageUrl: (value: string) => void;
};

export function CommunityWriteSheet({
  draftRestaurant,
  placeQuery,
  placeResults,
  title,
  content,
  imageUrl,
  imageUploading,
  savedRestaurants,
  loading,
  showHandle,
  onCancelPost,
  onSearchPlaces,
  onSelectPlace,
  onPickImage,
  onCreatePost,
  onChangePlaceQuery,
  onChangeTitle,
  onChangeContent,
  onChangeImageUrl,
}: CommunityWriteSheetProps) {
  return (
    <ScrollView
      style={styles.communityWriteScroll}
      contentContainerStyle={styles.communityWriteContent}
      showsVerticalScrollIndicator>
      <View>
        {showHandle ? <View style={styles.sheetHandle} /> : null}
        <View style={styles.detailTopRow}>
          <View style={styles.restaurantTextGroup}>
            <Text style={styles.sheetTitle}>게시글 작성</Text>
            <Text style={styles.restaurantMeta}>
              장소를 선택하고 후기를 남겨주세요.
            </Text>
          </View>
          <Pressable
            style={({pressed}) => [
              styles.closeButton,
              pressed ? styles.pressed : null,
            ]}
            onPress={onCancelPost}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>
        <Field label="장소">
          <View style={styles.inlineSearchRow}>
            <TextInput
              style={[styles.input, styles.inlineSearchInput]}
              placeholder="장소명, 지역, 음식 검색"
              value={placeQuery}
              onChangeText={onChangePlaceQuery}
              returnKeyType="search"
              onSubmitEditing={onSearchPlaces}
            />
            <Pressable
              style={({pressed}) => [
                styles.inlineSearchButton,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={onSearchPlaces}
              disabled={loading}>
              <Text style={styles.inlineSearchButtonText}>검색</Text>
            </Pressable>
          </View>
        </Field>
        {draftRestaurant ? (
          <View style={styles.selectedPlaceBox}>
            <Text style={styles.restaurantName}>{draftRestaurant.name}</Text>
            <Text style={styles.restaurantMeta} numberOfLines={1}>
              {draftRestaurant.category || '카테고리 미정'}
            </Text>
            <Text style={styles.restaurantAddress} numberOfLines={1}>
              {draftRestaurant.address}
            </Text>
          </View>
        ) : null}
        <PlacePickerList
          title="내 맛집 리스트"
          emptyText="저장한 맛집이 없으면 장소를 검색해 선택해 주세요."
          restaurants={savedRestaurants}
          draftRestaurant={draftRestaurant}
          scroll
          onSelectPlace={onSelectPlace}
        />
        {placeResults.length > 0 ? (
          <View style={styles.placeResultList}>
            <PlacePickerItems
              restaurants={placeResults}
              draftRestaurant={draftRestaurant}
              onSelectPlace={onSelectPlace}
            />
          </View>
        ) : null}
        <Field label="제목">
          <TextInput
            style={styles.input}
            placeholder="게시글 제목"
            value={title}
            onChangeText={onChangeTitle}
          />
        </Field>
        <Field label="사진 URL">
          <View style={styles.inlineSearchRow}>
            <TextInput
              style={[styles.input, styles.inlineSearchInput]}
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChangeText={onChangeImageUrl}
              autoCapitalize="none"
            />
            <Pressable
              style={({pressed}) => [
                styles.inlineSearchButton,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={onPickImage}
              disabled={loading}>
              <Text style={styles.inlineSearchButtonText}>
                {imageUploading ? '업로드 중' : '사진 선택'}
              </Text>
            </Pressable>
          </View>
          {imageUploading ? (
            <Text style={styles.fieldHelperText}>사진을 업로드하고 있습니다.</Text>
          ) : null}
        </Field>
        <CommunityImagePreview
          imageUrl={imageUrl}
          loading={loading}
          onRemove={() => onChangeImageUrl('')}
        />
        <Field label="내용">
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="맛집을 추천하는 이유"
            value={content}
            onChangeText={onChangeContent}
            multiline
          />
        </Field>
        <PrimaryButton
          label="게시글 작성"
          onPress={onCreatePost}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

type PlacePickerListProps = {
  title: string;
  emptyText: string;
  restaurants: Restaurant[];
  draftRestaurant: Restaurant | null;
  scroll?: boolean;
  onSelectPlace: (restaurant: Restaurant) => void;
};

function PlacePickerList({
  title,
  emptyText,
  restaurants,
  draftRestaurant,
  scroll = false,
  onSelectPlace,
}: PlacePickerListProps) {
  return (
    <View style={styles.savedPlaceSection}>
      <Text style={styles.savedPlaceTitle}>{title}</Text>
      {restaurants.length > 0 ? (
        scroll ? (
          <ScrollView
            style={styles.savedPlaceScroll}
            contentContainerStyle={styles.savedPlaceList}
            nestedScrollEnabled
            showsVerticalScrollIndicator={restaurants.length > 3}>
            <PlacePickerItems
              restaurants={restaurants}
              draftRestaurant={draftRestaurant}
              onSelectPlace={onSelectPlace}
            />
          </ScrollView>
        ) : (
          <PlacePickerItems
            restaurants={restaurants}
            draftRestaurant={draftRestaurant}
            onSelectPlace={onSelectPlace}
          />
        )
      ) : (
        <Text style={styles.savedPlaceEmpty}>{emptyText}</Text>
      )}
    </View>
  );
}

type PlacePickerItemsProps = {
  restaurants: Restaurant[];
  draftRestaurant: Restaurant | null;
  onSelectPlace: (restaurant: Restaurant) => void;
};

function PlacePickerItems({
  restaurants,
  draftRestaurant,
  onSelectPlace,
}: PlacePickerItemsProps) {
  return (
    <>
      {restaurants.map(restaurant => {
        const selected =
          draftRestaurant &&
          getRestaurantKey(draftRestaurant) === getRestaurantKey(restaurant);

        return (
          <Pressable
            key={getRestaurantKey(restaurant)}
            style={({pressed}) => [
              styles.placeResultItem,
              selected ? styles.placeResultItemActive : null,
              pressed ? styles.pressed : null,
            ]}
            onPress={() => onSelectPlace(restaurant)}>
            <View style={styles.restaurantTextGroup}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <Text style={styles.restaurantAddress} numberOfLines={1}>
                {restaurant.address}
              </Text>
            </View>
            <Text style={styles.placeSelectText}>
              {selected ? '선택됨' : '선택'}
            </Text>
          </Pressable>
        );
      })}
    </>
  );
}
