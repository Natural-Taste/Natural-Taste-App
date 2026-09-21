import React from 'react';
import {View} from 'react-native';
import {styles} from '../styles';
import type {
  ActivePanel,
  CommunityComment,
  CommunityPost,
  FriendRequest,
  FriendUser,
  Message,
  Restaurant,
} from '../types';
import {BottomTabBar} from './home/BottomTabBar';
import {CommunityTab} from './home/CommunityTab';
import {MapTab} from './home/MapTab';
import {MyPageTab} from './home/MyPageTab';
import {SearchTab} from './home/SearchTab';

type MapHomeProps = {
  query: string;
  message: Message;
  loading: boolean;
  restaurants: Restaurant[];
  savedRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
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
  userSearchQuery: string;
  searchedUsers: FriendUser[];
  friendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
  friends: FriendUser[];
  selectedFriend: FriendUser | null;
  friendRestaurants: Restaurant[];
  savedIdSet: Set<number>;
  activePanel: ActivePanel;
  userId: number;
  currentPassword: string;
  newPassword: string;
  onChangeQuery: (value: string) => void;
  onSearch: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
  onOpenMap: () => void;
  onOpenCommunity: () => void;
  onOpenSearch: () => void;
  onSearchUsers: () => void;
  onRequestFriend: (user: FriendUser) => void;
  onAcceptFriendRequest: (request: FriendRequest) => void;
  onRejectFriendRequest: (request: FriendRequest) => void;
  onCancelSentFriendRequest: (request: FriendRequest) => void;
  onDeleteFriend: (friend: FriendUser) => void;
  onSelectFriend: (friend: FriendUser | null) => void;
  onChangeUserSearchQuery: (value: string) => void;
  onSelectCommunityPost: (post: CommunityPost | null) => void;
  onSaveCommunityRestaurant: (post: CommunityPost) => void;
  onToggleCommunityRecommendation: (post: CommunityPost) => void;
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
  onChangeCommentContent: (value: string) => void;
  onCloseDetail: () => void;
  onOpenMyPage: () => void;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onDeleteUser: () => void;
};

export function MapHome(props: MapHomeProps) {
  return (
    <View style={styles.mapHome}>
      {props.activePanel === 'map' ? (
        <MapTab
          query={props.query}
          message={props.message}
          loading={props.loading}
          restaurants={props.restaurants}
          savedRestaurants={props.savedRestaurants}
          selectedRestaurant={props.selectedRestaurant}
          savedIdSet={props.savedIdSet}
          onChangeQuery={props.onChangeQuery}
          onSearch={props.onSearch}
          onSelectRestaurant={props.onSelectRestaurant}
          onToggleSaved={props.onToggleSaved}
          onCloseDetail={props.onCloseDetail}
        />
      ) : props.activePanel === 'community' ? (
        <CommunityTab
          message={props.message}
          loading={props.loading}
          communityPosts={props.communityPosts}
          selectedCommunityPost={props.selectedCommunityPost}
          postDraftRestaurant={props.postDraftRestaurant}
          postWriting={props.postWriting}
          postPlaceQuery={props.postPlaceQuery}
          postPlaceResults={props.postPlaceResults}
          postTitle={props.postTitle}
          postContent={props.postContent}
          postImageUrl={props.postImageUrl}
          communityComments={props.communityComments}
          commentContent={props.commentContent}
          savedRestaurants={props.savedRestaurants}
          onSelectCommunityPost={props.onSelectCommunityPost}
          onSaveCommunityRestaurant={props.onSaveCommunityRestaurant}
          onToggleCommunityRecommendation={props.onToggleCommunityRecommendation}
          onStartCommunityPost={props.onStartCommunityPost}
          onCancelCommunityPost={props.onCancelCommunityPost}
          onSearchCommunityPostPlaces={props.onSearchCommunityPostPlaces}
          onSelectCommunityPostPlace={props.onSelectCommunityPostPlace}
          onCreateCommunityPost={props.onCreateCommunityPost}
          onChangePostPlaceQuery={props.onChangePostPlaceQuery}
          onChangePostTitle={props.onChangePostTitle}
          onChangePostContent={props.onChangePostContent}
          onChangePostImageUrl={props.onChangePostImageUrl}
          onCreateCommunityComment={props.onCreateCommunityComment}
          onChangeCommentContent={props.onChangeCommentContent}
        />
      ) : props.activePanel === 'search' ? (
        <SearchTab
          message={props.message}
          loading={props.loading}
          userSearchQuery={props.userSearchQuery}
          searchedUsers={props.searchedUsers}
          friendRequests={props.friendRequests}
          sentFriendRequests={props.sentFriendRequests}
          friends={props.friends}
          selectedFriend={props.selectedFriend}
          friendRestaurants={props.friendRestaurants}
          savedRestaurants={props.savedRestaurants}
          onChangeUserSearchQuery={props.onChangeUserSearchQuery}
          onSearchUsers={props.onSearchUsers}
          onRequestFriend={props.onRequestFriend}
          onAcceptFriendRequest={props.onAcceptFriendRequest}
          onRejectFriendRequest={props.onRejectFriendRequest}
          onCancelSentFriendRequest={props.onCancelSentFriendRequest}
          onDeleteFriend={props.onDeleteFriend}
          onSelectFriend={props.onSelectFriend}
          onToggleSaved={props.onToggleSaved}
        />
      ) : (
        <MyPageTab
          message={props.message}
          loading={props.loading}
          userId={props.userId}
          currentPassword={props.currentPassword}
          newPassword={props.newPassword}
          onChangeCurrentPassword={props.onChangeCurrentPassword}
          onChangeNewPassword={props.onChangeNewPassword}
          onChangePassword={props.onChangePassword}
          onLogout={props.onLogout}
          onDeleteUser={props.onDeleteUser}
        />
      )}

      <BottomTabBar
        activePanel={props.activePanel}
        loading={props.loading}
        onOpenMap={props.onOpenMap}
        onOpenCommunity={props.onOpenCommunity}
        onOpenSearch={props.onOpenSearch}
        onOpenMyPage={props.onOpenMyPage}
      />
    </View>
  );
}
