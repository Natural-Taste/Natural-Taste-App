import React from 'react';
import {Image, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../styles';
import type {CommunityComment, CommunityPost, Restaurant} from '../types';
import {formatDate} from '../utils/date';
import {findSavedRestaurant, getRestaurantKey} from '../utils/restaurants';
import {Field, PrimaryButton} from './Common';

export function CommunitySheet({
  posts,
  selectedPost,
  draftRestaurant,
  writing,
  placeQuery,
  placeResults,
  title,
  content,
  imageUrl,
  comments,
  commentContent,
  savedRestaurants,
  loading,
  onSelectPost,
  onSaveRestaurant,
  onToggleRecommendation,
  onStartPost,
  onCancelPost,
  onSearchPlaces,
  onSelectPlace,
  onCreatePost,
  onChangePlaceQuery,
  onChangeTitle,
  onChangeContent,
  onChangeImageUrl,
  onCreateComment,
  onChangeCommentContent,
  onClose,
  showHandle = true,
}: {
  posts: CommunityPost[];
  selectedPost: CommunityPost | null;
  draftRestaurant: Restaurant | null;
  writing: boolean;
  placeQuery: string;
  placeResults: Restaurant[];
  title: string;
  content: string;
  imageUrl: string;
  comments: CommunityComment[];
  commentContent: string;
  savedRestaurants: Restaurant[];
  loading: boolean;
  onSelectPost: (post: CommunityPost) => void;
  onSaveRestaurant: (post: CommunityPost) => void;
  onToggleRecommendation: (post: CommunityPost) => void;
  onStartPost: () => void;
  onCancelPost: () => void;
  onSearchPlaces: () => void;
  onSelectPlace: (restaurant: Restaurant) => void;
  onCreatePost: () => void;
  onChangePlaceQuery: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeImageUrl: (value: string) => void;
  onCreateComment: () => void;
  onChangeCommentContent: (value: string) => void;
  onClose: () => void;
  showHandle?: boolean;
}) {
  if (writing) {
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
          <View style={styles.savedPlaceSection}>
            <Text style={styles.savedPlaceTitle}>내 맛집 리스트</Text>
            {savedRestaurants.length > 0 ? (
              <ScrollView
                style={styles.savedPlaceScroll}
                contentContainerStyle={styles.savedPlaceList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={savedRestaurants.length > 3}>
                {savedRestaurants.map(restaurant => {
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
              </ScrollView>
            ) : (
              <Text style={styles.savedPlaceEmpty}>
                저장한 맛집이 없으면 장소를 검색해 선택해 주세요.
              </Text>
            )}
          </View>
          {placeResults.length > 0 ? (
            <View style={styles.placeResultList}>
              {placeResults.map(restaurant => {
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
            <TextInput
              style={styles.input}
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChangeText={onChangeImageUrl}
              autoCapitalize="none"
            />
          </Field>
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

  if (selectedPost) {
    const saved = Boolean(findSavedRestaurant(selectedPost.restaurant, savedRestaurants));

    return (
      <ScrollView
        style={styles.communityWriteScroll}
        contentContainerStyle={styles.communityWriteContent}
        showsVerticalScrollIndicator>
        <View>
          {showHandle ? <View style={styles.sheetHandle} /> : null}
          <View style={styles.detailTopRow}>
            <View style={styles.restaurantTextGroup}>
              <Text style={styles.detailName}>{selectedPost.title}</Text>
              <Text style={styles.restaurantMeta}>
                작성자 {selectedPost.authorId} · {formatDate(selectedPost.createdAt)}
              </Text>
            </View>
            <Pressable
              style={({pressed}) => [
                styles.closeButton,
                pressed ? styles.pressed : null,
              ]}
              onPress={onClose}>
              <Text style={styles.closeButtonText}>목록</Text>
            </Pressable>
          </View>
          {selectedPost.imageUrl ? (
            <Image
              source={{uri: selectedPost.imageUrl}}
              style={styles.postImage}
              resizeMode="cover"
            />
          ) : null}
          <Text style={styles.postContent}>{selectedPost.content}</Text>
          <View style={styles.postRestaurantBox}>
            <Text style={styles.restaurantName}>{selectedPost.restaurant.name}</Text>
            <Text style={styles.restaurantMeta}>
              {selectedPost.restaurant.category || '카테고리 미정'}
            </Text>
            <Text style={styles.restaurantAddress}>
              {selectedPost.restaurant.address}
            </Text>
          </View>
          <View style={styles.postActionRow}>
            <Pressable
              style={({pressed}) => [
                styles.recommendButton,
                selectedPost.recommended ? styles.recommendButtonActive : null,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={() => onToggleRecommendation(selectedPost)}
              disabled={loading}>
              <Text
                style={[
                  styles.recommendButtonText,
                  selectedPost.recommended ? styles.recommendButtonActiveText : null,
                ]}>
                추천 {selectedPost.recommendationCount}
              </Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.recommendButton,
                saved ? styles.recommendButtonActive : null,
                pressed ? styles.pressed : null,
                loading || saved ? styles.disabled : null,
              ]}
              onPress={() => onSaveRestaurant(selectedPost)}
              disabled={loading || saved}>
              <Text
                style={[
                  styles.recommendButtonText,
                  saved ? styles.recommendButtonActiveText : null,
                ]}>
                {saved ? '저장됨' : '장소 저장'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.commentSection}>
            <Text style={styles.savedPlaceTitle}>댓글 {selectedPost.commentCount}</Text>
            {comments.length > 0 ? (
              <View style={styles.commentList}>
                {comments.map(comment => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Text style={styles.restaurantMeta}>
                      작성자 {comment.authorId} · {formatDate(comment.createdAt)}
                    </Text>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.savedPlaceEmpty}>아직 댓글이 없습니다.</Text>
            )}
            <View style={styles.commentInputRow}>
              <TextInput
                style={[styles.input, styles.commentInput]}
                placeholder="댓글 작성"
                value={commentContent}
                onChangeText={onChangeCommentContent}
              />
              <Pressable
                style={({pressed}) => [
                  styles.inlineSearchButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={onCreateComment}
                disabled={loading}>
                <Text style={styles.inlineSearchButtonText}>등록</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View>
      {showHandle ? <View style={styles.sheetHandle} /> : null}
      <View style={styles.sheetHeader}>
        <View>
          <Text style={styles.sheetTitle}>커뮤니티</Text>
          <Text style={styles.sheetCount}>{posts.length}개</Text>
        </View>
        <Pressable
          style={({pressed}) => [
            styles.writeButton,
            pressed ? styles.pressed : null,
            loading ? styles.disabled : null,
          ]}
          onPress={onStartPost}
          disabled={loading}>
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </Pressable>
      </View>
      {posts.length === 0 ? (
        <Text style={styles.sheetEmptyText}>
          글쓰기를 눌러 장소에 대한 후기를 남겨보세요.
        </Text>
      ) : (
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetList}
          showsVerticalScrollIndicator={false}>
          {posts.map(post => {
            const saved = Boolean(findSavedRestaurant(post.restaurant, savedRestaurants));

            return (
              <Pressable
                key={post.id}
                style={({pressed}) => [
                  styles.communityPost,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => onSelectPost(post)}>
                <View style={styles.restaurantTextGroup}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {post.title}
                  </Text>
                  <Text style={styles.restaurantMeta} numberOfLines={1}>
                    {post.restaurant.name}
                  </Text>
                  <Text style={styles.restaurantAddress} numberOfLines={1}>
                    {post.restaurant.address}
                  </Text>
                  <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                  <Text style={styles.postDate}>
                    추천 {post.recommendationCount} · 댓글 {post.commentCount}
                  </Text>
                </View>
                <Pressable
                  style={({pressed}) => [
                    styles.sheetSaveButton,
                    saved ? styles.sheetSaveButtonActive : null,
                    pressed ? styles.pressed : null,
                    loading || saved ? styles.disabled : null,
                  ]}
                  onPress={() => onSaveRestaurant(post)}
                  disabled={loading || saved}>
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
