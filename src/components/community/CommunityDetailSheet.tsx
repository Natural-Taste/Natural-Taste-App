import React from 'react';
import {Image, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../../styles';
import type {CommunityComment, CommunityPost, Restaurant} from '../../types';
import {formatDate} from '../../utils/date';
import {findSavedRestaurant} from '../../utils/restaurants';
import {Field} from '../Common';

type CommunityDetailSheetProps = {
  selectedPost: CommunityPost;
  comments: CommunityComment[];
  commentContent: string;
  editing: boolean;
  editTitle: string;
  editContent: string;
  editImageUrl: string;
  editingCommentId: number | null;
  editingCommentContent: string;
  savedRestaurants: Restaurant[];
  userId: number;
  loading: boolean;
  showHandle: boolean;
  onSaveRestaurant: (post: CommunityPost) => void;
  onToggleRecommendation: (post: CommunityPost) => void;
  onDeletePost: (post: CommunityPost) => void;
  onStartEditPost: (post: CommunityPost) => void;
  onCancelEditPost: () => void;
  onUpdatePost: () => void;
  onChangeEditTitle: (value: string) => void;
  onChangeEditContent: (value: string) => void;
  onChangeEditImageUrl: (value: string) => void;
  onCreateComment: () => void;
  onStartEditComment: (comment: CommunityComment) => void;
  onCancelEditComment: () => void;
  onUpdateComment: (comment: CommunityComment) => void;
  onDeleteComment: (comment: CommunityComment) => void;
  onChangeCommentContent: (value: string) => void;
  onChangeEditingCommentContent: (value: string) => void;
  onClose: () => void;
};

export function CommunityDetailSheet({
  selectedPost,
  comments,
  commentContent,
  editing,
  editTitle,
  editContent,
  editImageUrl,
  editingCommentId,
  editingCommentContent,
  savedRestaurants,
  userId,
  loading,
  showHandle,
  onSaveRestaurant,
  onToggleRecommendation,
  onDeletePost,
  onStartEditPost,
  onCancelEditPost,
  onUpdatePost,
  onChangeEditTitle,
  onChangeEditContent,
  onChangeEditImageUrl,
  onCreateComment,
  onStartEditComment,
  onCancelEditComment,
  onUpdateComment,
  onDeleteComment,
  onChangeCommentContent,
  onChangeEditingCommentContent,
  onClose,
}: CommunityDetailSheetProps) {
  const saved = Boolean(findSavedRestaurant(selectedPost.restaurant, savedRestaurants));
  const canManagePost = selectedPost.authorId === userId;

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
        {editing ? (
          <View style={styles.editBox}>
            <Field label="제목">
              <TextInput
                style={styles.input}
                placeholder="게시글 제목"
                value={editTitle}
                onChangeText={onChangeEditTitle}
              />
            </Field>
            <Field label="사진 URL">
              <TextInput
                style={styles.input}
                placeholder="https://example.com/photo.jpg"
                value={editImageUrl}
                onChangeText={onChangeEditImageUrl}
                autoCapitalize="none"
              />
            </Field>
            <Field label="내용">
              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder="맛집을 추천하는 이유"
                value={editContent}
                onChangeText={onChangeEditContent}
                multiline
              />
            </Field>
            <View style={styles.editActionRow}>
              <Pressable
                style={({pressed}) => [
                  styles.secondaryAction,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={onCancelEditPost}
                disabled={loading}>
                <Text style={styles.secondaryActionText}>취소</Text>
              </Pressable>
              <Pressable
                style={({pressed}) => [
                  styles.primaryButton,
                  styles.editPrimaryButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={onUpdatePost}
                disabled={loading}>
                <Text style={styles.primaryButtonText}>수정 저장</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {selectedPost.imageUrl ? (
              <Image
                source={{uri: selectedPost.imageUrl}}
                style={styles.postImage}
                resizeMode="cover"
              />
            ) : null}
            <Text style={styles.postContent}>{selectedPost.content}</Text>
          </>
        )}
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
          {canManagePost && !editing ? (
            <Pressable
              style={({pressed}) => [
                styles.recommendButton,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={() => onStartEditPost(selectedPost)}
              disabled={loading}>
              <Text style={styles.recommendButtonText}>게시글 수정</Text>
            </Pressable>
          ) : null}
          {canManagePost ? (
            <Pressable
              style={({pressed}) => [
                styles.recommendButton,
                styles.smallActionDangerButton,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={() => onDeletePost(selectedPost)}
              disabled={loading}>
              <Text
                style={[
                  styles.recommendButtonText,
                  styles.smallActionDangerButtonText,
                ]}>
                게시글 삭제
              </Text>
            </Pressable>
          ) : null}
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
                  <View style={styles.detailTopRow}>
                    <Text style={styles.restaurantMeta}>
                      작성자 {comment.authorId} · {formatDate(comment.createdAt)}
                    </Text>
                    {comment.authorId === userId ? (
                      <Pressable
                        style={({pressed}) => [
                          styles.smallActionButton,
                          pressed ? styles.pressed : null,
                          loading ? styles.disabled : null,
                        ]}
                        onPress={() => onStartEditComment(comment)}
                        disabled={loading}>
                        <Text style={styles.smallActionButtonText}>수정</Text>
                      </Pressable>
                    ) : null}
                    {comment.authorId === userId ? (
                      <Pressable
                        style={({pressed}) => [
                          styles.smallActionButton,
                          styles.smallActionDangerButton,
                          pressed ? styles.pressed : null,
                          loading ? styles.disabled : null,
                        ]}
                        onPress={() => onDeleteComment(comment)}
                        disabled={loading}>
                        <Text
                          style={[
                            styles.smallActionButtonText,
                            styles.smallActionDangerButtonText,
                          ]}>
                          삭제
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                  {editingCommentId === comment.id ? (
                    <View style={styles.commentEditBox}>
                      <TextInput
                        style={[styles.input, styles.commentEditInput]}
                        placeholder="댓글 내용"
                        value={editingCommentContent}
                        onChangeText={onChangeEditingCommentContent}
                        multiline
                      />
                      <View style={styles.editActionRow}>
                        <Pressable
                          style={({pressed}) => [
                            styles.secondaryAction,
                            pressed ? styles.pressed : null,
                            loading ? styles.disabled : null,
                          ]}
                          onPress={onCancelEditComment}
                          disabled={loading}>
                          <Text style={styles.secondaryActionText}>취소</Text>
                        </Pressable>
                        <Pressable
                          style={({pressed}) => [
                            styles.primaryButton,
                            styles.editPrimaryButton,
                            pressed ? styles.pressed : null,
                            loading ? styles.disabled : null,
                          ]}
                          onPress={() => onUpdateComment(comment)}
                          disabled={loading}>
                          <Text style={styles.primaryButtonText}>저장</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  )}
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
