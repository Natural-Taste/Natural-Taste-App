import React from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {styles} from '../../styles';
import type {CommunityPost, Restaurant} from '../../types';
import {formatDate} from '../../utils/date';
import {findSavedRestaurant} from '../../utils/restaurants';

type CommunityListSheetProps = {
  posts: CommunityPost[];
  savedRestaurants: Restaurant[];
  loading: boolean;
  showHandle: boolean;
  onSelectPost: (post: CommunityPost) => void;
  onSaveRestaurant: (post: CommunityPost) => void;
  onStartPost: () => void;
};

export function CommunityListSheet({
  posts,
  savedRestaurants,
  loading,
  showHandle,
  onSelectPost,
  onSaveRestaurant,
  onStartPost,
}: CommunityListSheetProps) {
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
