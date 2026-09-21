import React from 'react';
import type {CommunityComment, CommunityPost, Restaurant} from '../types';
import {CommunityDetailSheet} from './community/CommunityDetailSheet';
import {CommunityListSheet} from './community/CommunityListSheet';
import {CommunityWriteSheet} from './community/CommunityWriteSheet';

type CommunitySheetProps = {
  posts: CommunityPost[];
  selectedPost: CommunityPost | null;
  draftRestaurant: Restaurant | null;
  writing: boolean;
  editing: boolean;
  placeQuery: string;
  placeResults: Restaurant[];
  title: string;
  content: string;
  imageUrl: string;
  comments: CommunityComment[];
  commentContent: string;
  editingCommentId: number | null;
  editingCommentContent: string;
  savedRestaurants: Restaurant[];
  userId: number;
  loading: boolean;
  onSelectPost: (post: CommunityPost) => void;
  onSaveRestaurant: (post: CommunityPost) => void;
  onToggleRecommendation: (post: CommunityPost) => void;
  onDeletePost: (post: CommunityPost) => void;
  onStartEditPost: (post: CommunityPost) => void;
  onCancelEditPost: () => void;
  onUpdatePost: () => void;
  onStartPost: () => void;
  onCancelPost: () => void;
  onSearchPlaces: () => void;
  onSelectPlace: (restaurant: Restaurant) => void;
  onPickImage: () => void;
  onCreatePost: () => void;
  onChangePlaceQuery: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeImageUrl: (value: string) => void;
  onCreateComment: () => void;
  onStartEditComment: (comment: CommunityComment) => void;
  onCancelEditComment: () => void;
  onUpdateComment: (comment: CommunityComment) => void;
  onDeleteComment: (comment: CommunityComment) => void;
  onChangeCommentContent: (value: string) => void;
  onChangeEditingCommentContent: (value: string) => void;
  onClose: () => void;
  showHandle?: boolean;
};

export function CommunitySheet({
  posts,
  selectedPost,
  draftRestaurant,
  writing,
  editing,
  placeQuery,
  placeResults,
  title,
  content,
  imageUrl,
  comments,
  commentContent,
  editingCommentId,
  editingCommentContent,
  savedRestaurants,
  userId,
  loading,
  onSelectPost,
  onSaveRestaurant,
  onToggleRecommendation,
  onDeletePost,
  onStartEditPost,
  onCancelEditPost,
  onUpdatePost,
  onStartPost,
  onCancelPost,
  onSearchPlaces,
  onSelectPlace,
  onPickImage,
  onCreatePost,
  onChangePlaceQuery,
  onChangeTitle,
  onChangeContent,
  onChangeImageUrl,
  onCreateComment,
  onStartEditComment,
  onCancelEditComment,
  onUpdateComment,
  onDeleteComment,
  onChangeCommentContent,
  onChangeEditingCommentContent,
  onClose,
  showHandle = true,
}: CommunitySheetProps) {
  if (writing) {
    return (
      <CommunityWriteSheet
        draftRestaurant={draftRestaurant}
        placeQuery={placeQuery}
        placeResults={placeResults}
        title={title}
        content={content}
        imageUrl={imageUrl}
        savedRestaurants={savedRestaurants}
        loading={loading}
        showHandle={showHandle}
        onCancelPost={onCancelPost}
        onSearchPlaces={onSearchPlaces}
        onSelectPlace={onSelectPlace}
        onPickImage={onPickImage}
        onCreatePost={onCreatePost}
        onChangePlaceQuery={onChangePlaceQuery}
        onChangeTitle={onChangeTitle}
        onChangeContent={onChangeContent}
        onChangeImageUrl={onChangeImageUrl}
      />
    );
  }

  if (selectedPost) {
    return (
      <CommunityDetailSheet
        selectedPost={selectedPost}
        comments={comments}
        commentContent={commentContent}
        editing={editing}
        editTitle={title}
        editContent={content}
        editImageUrl={imageUrl}
        editingCommentId={editingCommentId}
        editingCommentContent={editingCommentContent}
        savedRestaurants={savedRestaurants}
        userId={userId}
        loading={loading}
        showHandle={showHandle}
        onSaveRestaurant={onSaveRestaurant}
        onToggleRecommendation={onToggleRecommendation}
        onDeletePost={onDeletePost}
        onStartEditPost={onStartEditPost}
        onCancelEditPost={onCancelEditPost}
        onUpdatePost={onUpdatePost}
        onChangeEditTitle={onChangeTitle}
        onChangeEditContent={onChangeContent}
        onChangeEditImageUrl={onChangeImageUrl}
        onPickImage={onPickImage}
        onCreateComment={onCreateComment}
        onStartEditComment={onStartEditComment}
        onCancelEditComment={onCancelEditComment}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
        onChangeCommentContent={onChangeCommentContent}
        onChangeEditingCommentContent={onChangeEditingCommentContent}
        onClose={onClose}
      />
    );
  }

  return (
    <CommunityListSheet
      posts={posts}
      savedRestaurants={savedRestaurants}
      loading={loading}
      showHandle={showHandle}
      onSelectPost={onSelectPost}
      onSaveRestaurant={onSaveRestaurant}
      onStartPost={onStartPost}
    />
  );
}
