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
  placeQuery: string;
  placeResults: Restaurant[];
  title: string;
  content: string;
  imageUrl: string;
  comments: CommunityComment[];
  commentContent: string;
  savedRestaurants: Restaurant[];
  userId: number;
  loading: boolean;
  onSelectPost: (post: CommunityPost) => void;
  onSaveRestaurant: (post: CommunityPost) => void;
  onToggleRecommendation: (post: CommunityPost) => void;
  onDeletePost: (post: CommunityPost) => void;
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
  onDeleteComment: (comment: CommunityComment) => void;
  onChangeCommentContent: (value: string) => void;
  onClose: () => void;
  showHandle?: boolean;
};

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
  userId,
  loading,
  onSelectPost,
  onSaveRestaurant,
  onToggleRecommendation,
  onDeletePost,
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
  onDeleteComment,
  onChangeCommentContent,
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
        savedRestaurants={savedRestaurants}
        userId={userId}
        loading={loading}
        showHandle={showHandle}
        onSaveRestaurant={onSaveRestaurant}
        onToggleRecommendation={onToggleRecommendation}
        onDeletePost={onDeletePost}
        onCreateComment={onCreateComment}
        onDeleteComment={onDeleteComment}
        onChangeCommentContent={onChangeCommentContent}
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
