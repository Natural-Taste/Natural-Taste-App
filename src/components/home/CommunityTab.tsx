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
  postPlaceQuery: string;
  postPlaceResults: Restaurant[];
  postTitle: string;
  postContent: string;
  postImageUrl: string;
  communityComments: CommunityComment[];
  commentContent: string;
  savedRestaurants: Restaurant[];
  userId: number;
  onSelectCommunityPost: (post: CommunityPost | null) => void;
  onSaveCommunityRestaurant: (post: CommunityPost) => void;
  onToggleCommunityRecommendation: (post: CommunityPost) => void;
  onDeleteCommunityPost: (post: CommunityPost) => void;
  onStartCommunityPost: () => void;
  onCancelCommunityPost: () => void;
  onSearchCommunityPostPlaces: () => void;
  onSelectCommunityPostPlace: (restaurant: Restaurant) => void;
  onCreateCommunityPost: () => void;
  onChangePostPlaceQuery: (value: string) => void;
  onChangePostTitle: (value: string) => void;
  onChangePostContent: (value: string) => void;
  onChangePostImageUrl: (value: string) => void;
  onCreateCommunityComment: () => void;
  onDeleteCommunityComment: (comment: CommunityComment) => void;
  onChangeCommentContent: (value: string) => void;
};

export function CommunityTab({
  message,
  loading,
  communityPosts,
  selectedCommunityPost,
  postDraftRestaurant,
  postWriting,
  postPlaceQuery,
  postPlaceResults,
  postTitle,
  postContent,
  postImageUrl,
  communityComments,
  commentContent,
  savedRestaurants,
  userId,
  onSelectCommunityPost,
  onSaveCommunityRestaurant,
  onToggleCommunityRecommendation,
  onDeleteCommunityPost,
  onStartCommunityPost,
  onCancelCommunityPost,
  onSearchCommunityPostPlaces,
  onSelectCommunityPostPlace,
  onCreateCommunityPost,
  onChangePostPlaceQuery,
  onChangePostTitle,
  onChangePostContent,
  onChangePostImageUrl,
  onCreateCommunityComment,
  onDeleteCommunityComment,
  onChangeCommentContent,
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
        placeQuery={postPlaceQuery}
        placeResults={postPlaceResults}
        title={postTitle}
        content={postContent}
        imageUrl={postImageUrl}
        comments={communityComments}
        commentContent={commentContent}
        savedRestaurants={savedRestaurants}
        userId={userId}
        loading={loading}
        onSelectPost={onSelectCommunityPost}
        onSaveRestaurant={onSaveCommunityRestaurant}
        onToggleRecommendation={onToggleCommunityRecommendation}
        onDeletePost={onDeleteCommunityPost}
        onStartPost={onStartCommunityPost}
        onCancelPost={onCancelCommunityPost}
        onSearchPlaces={onSearchCommunityPostPlaces}
        onSelectPlace={onSelectCommunityPostPlace}
        onCreatePost={onCreateCommunityPost}
        onChangePlaceQuery={onChangePostPlaceQuery}
        onChangeTitle={onChangePostTitle}
        onChangeContent={onChangePostContent}
        onChangeImageUrl={onChangePostImageUrl}
        onCreateComment={onCreateCommunityComment}
        onDeleteComment={onDeleteCommunityComment}
        onChangeCommentContent={onChangeCommentContent}
        onClose={() => onSelectCommunityPost(null)}
        showHandle={false}
      />
    </View>
  );
}
