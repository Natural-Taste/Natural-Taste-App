import React from 'react';
import {Image, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../../styles';
import type {CommunityComment, CommunityPost, Restaurant} from '../../types';
import {formatDate} from '../../utils/date';
import {findSavedRestaurant} from '../../utils/restaurants';

type CommunityDetailSheetProps = {
  selectedPost: CommunityPost;
  comments: CommunityComment[];
  commentContent: string;
  savedRestaurants: Restaurant[];
  loading: boolean;
  showHandle: boolean;
  onSaveRestaurant: (post: CommunityPost) => void;
  onToggleRecommendation: (post: CommunityPost) => void;
  onCreateComment: () => void;
  onChangeCommentContent: (value: string) => void;
  onClose: () => void;
};

export function CommunityDetailSheet({
  selectedPost,
  comments,
  commentContent,
  savedRestaurants,
  loading,
  showHandle,
  onSaveRestaurant,
  onToggleRecommendation,
  onCreateComment,
  onChangeCommentContent,
  onClose,
}: CommunityDetailSheetProps) {
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
