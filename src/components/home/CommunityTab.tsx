import React from 'react';
import {View} from 'react-native';
import {styles} from '../../styles';
import type {CommunityComment, CommunityPost, Message, Restaurant} from '../../types';
import {CommunitySheet} from '../CommunitySheet';
import {TabScreenHeader} from './TabScreenHeader';

type CommunityTabProps = {
  message: Message;
  loading: boolean;
  communityPosts: CommunityPost[];
  selectedCommunityPost: CommunityPost | null;
  postDraftRestaurant: Restaurant | null;
  postWriting: boolean;
  postEditing: boolean;
  postPlaceQuery: string;
  postPlaceResults: Restaurant[];
  postTitle: string;
  postContent: string;
  postImageUrl: string;
  communityComments: CommunityComment[];
  commentContent: string;
  editingCommentId: number | null;
  editingCommentContent: string;
  savedRestaurants: Restaurant[];
  userId: number;
  onSelectCommunityPost: (post: CommunityPost | null) => void;
  onSaveCommunityRestaurant: (post: CommunityPost) => void;
  onToggleCommunityRecommendation: (post: CommunityPost) => void;
  onDeleteCommunityPost: (post: CommunityPost) => void;
  onStartEditCommunityPost: (post: CommunityPost) => void;
  onCancelEditCommunityPost: () => void;
  onUpdateCommunityPost: () => void;
  onStartCommunityPost: () => void;
  onCancelCommunityPost: () => void;
  onSearchCommunityPostPlaces: () => void;
  onSelectCommunityPostPlace: (restaurant: Restaurant) => void;
  onPickCommunityPostImage: () => void;
  onCreateCommunityPost: () => void;
  onChangePostPlaceQuery: (value: string) => void;
  onChangePostTitle: (value: string) => void;
  onChangePostContent: (value: string) => void;
  onChangePostImageUrl: (value: string) => void;
  onCreateCommunityComment: () => void;
  onStartEditCommunityComment: (comment: CommunityComment) => void;
  onCancelEditCommunityComment: () => void;
  onUpdateCommunityComment: (comment: CommunityComment) => void;
  onDeleteCommunityComment: (comment: CommunityComment) => void;
  onChangeCommentContent: (value: string) => void;
  onChangeEditingCommentContent: (value: string) => void;
};

export function CommunityTab({
  message,
  loading,
  communityPosts,
  selectedCommunityPost,
  postDraftRestaurant,
  postWriting,
  postEditing,
  postPlaceQuery,
  postPlaceResults,
  postTitle,
  postContent,
  postImageUrl,
  communityComments,
  commentContent,
  editingCommentId,
  editingCommentContent,
  savedRestaurants,
  userId,
  onSelectCommunityPost,
  onSaveCommunityRestaurant,
  onToggleCommunityRecommendation,
  onDeleteCommunityPost,
  onStartEditCommunityPost,
  onCancelEditCommunityPost,
  onUpdateCommunityPost,
  onStartCommunityPost,
  onCancelCommunityPost,
  onSearchCommunityPostPlaces,
  onSelectCommunityPostPlace,
  onPickCommunityPostImage,
  onCreateCommunityPost,
  onChangePostPlaceQuery,
  onChangePostTitle,
  onChangePostContent,
  onChangePostImageUrl,
  onCreateCommunityComment,
  onStartEditCommunityComment,
  onCancelEditCommunityComment,
  onUpdateCommunityComment,
  onDeleteCommunityComment,
  onChangeCommentContent,
  onChangeEditingCommentContent,
}: CommunityTabProps) {
  return (
    <View style={styles.tabScreen}>
      <TabScreenHeader
        eyebrow="Community"
        title="커뮤니티"
        message={message}
        loading={loading}
      />
      <CommunitySheet
        posts={communityPosts}
        selectedPost={selectedCommunityPost}
        draftRestaurant={postDraftRestaurant}
        writing={postWriting}
        editing={postEditing}
        placeQuery={postPlaceQuery}
        placeResults={postPlaceResults}
        title={postTitle}
        content={postContent}
        imageUrl={postImageUrl}
        comments={communityComments}
        commentContent={commentContent}
        editingCommentId={editingCommentId}
        editingCommentContent={editingCommentContent}
        savedRestaurants={savedRestaurants}
        userId={userId}
        loading={loading}
        onSelectPost={onSelectCommunityPost}
        onSaveRestaurant={onSaveCommunityRestaurant}
        onToggleRecommendation={onToggleCommunityRecommendation}
        onDeletePost={onDeleteCommunityPost}
        onStartEditPost={onStartEditCommunityPost}
        onCancelEditPost={onCancelEditCommunityPost}
        onUpdatePost={onUpdateCommunityPost}
        onStartPost={onStartCommunityPost}
        onCancelPost={onCancelCommunityPost}
        onSearchPlaces={onSearchCommunityPostPlaces}
        onSelectPlace={onSelectCommunityPostPlace}
        onPickImage={onPickCommunityPostImage}
        onCreatePost={onCreateCommunityPost}
        onChangePlaceQuery={onChangePostPlaceQuery}
        onChangeTitle={onChangePostTitle}
        onChangeContent={onChangePostContent}
        onChangeImageUrl={onChangePostImageUrl}
        onCreateComment={onCreateCommunityComment}
        onStartEditComment={onStartEditCommunityComment}
        onCancelEditComment={onCancelEditCommunityComment}
        onUpdateComment={onUpdateCommunityComment}
        onDeleteComment={onDeleteCommunityComment}
        onChangeCommentContent={onChangeCommentContent}
        onChangeEditingCommentContent={onChangeEditingCommentContent}
        onClose={() => onSelectCommunityPost(null)}
        showHandle={false}
      />
    </View>
  );
}
