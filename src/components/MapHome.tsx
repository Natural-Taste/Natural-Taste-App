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
  UserLocation,
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
  restaurantMemo: string;
  userLocation: UserLocation | null;
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
  profileName: string;
  profileNameDraft: string;
  onChangeQuery: (value: string) => void;
  onLoadUserLocation: () => void;
  onSearch: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
  onChangeRestaurantMemo: (value: string) => void;
  onUpdateRestaurantMemo: (restaurant: Restaurant) => void;
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
  onCloseDetail: () => void;
  onOpenMyPage: () => void;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangePassword: () => void;
  onChangeProfileName: (value: string) => void;
  onUpdateProfile: () => void;
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
          restaurantMemo={props.restaurantMemo}
          userLocation={props.userLocation}
          savedIdSet={props.savedIdSet}
          onChangeQuery={props.onChangeQuery}
          onLoadUserLocation={props.onLoadUserLocation}
          onSearch={props.onSearch}
          onSelectRestaurant={props.onSelectRestaurant}
          onToggleSaved={props.onToggleSaved}
          onChangeRestaurantMemo={props.onChangeRestaurantMemo}
          onUpdateRestaurantMemo={props.onUpdateRestaurantMemo}
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
          postEditing={props.postEditing}
          postPlaceQuery={props.postPlaceQuery}
          postPlaceResults={props.postPlaceResults}
          postTitle={props.postTitle}
          postContent={props.postContent}
          postImageUrl={props.postImageUrl}
          communityComments={props.communityComments}
          commentContent={props.commentContent}
          editingCommentId={props.editingCommentId}
          editingCommentContent={props.editingCommentContent}
          savedRestaurants={props.savedRestaurants}
          userId={props.userId}
          onSelectCommunityPost={props.onSelectCommunityPost}
          onSaveCommunityRestaurant={props.onSaveCommunityRestaurant}
          onToggleCommunityRecommendation={props.onToggleCommunityRecommendation}
          onDeleteCommunityPost={props.onDeleteCommunityPost}
          onStartEditCommunityPost={props.onStartEditCommunityPost}
          onCancelEditCommunityPost={props.onCancelEditCommunityPost}
          onUpdateCommunityPost={props.onUpdateCommunityPost}
          onStartCommunityPost={props.onStartCommunityPost}
          onCancelCommunityPost={props.onCancelCommunityPost}
          onSearchCommunityPostPlaces={props.onSearchCommunityPostPlaces}
          onSelectCommunityPostPlace={props.onSelectCommunityPostPlace}
          onPickCommunityPostImage={props.onPickCommunityPostImage}
          onCreateCommunityPost={props.onCreateCommunityPost}
          onChangePostPlaceQuery={props.onChangePostPlaceQuery}
          onChangePostTitle={props.onChangePostTitle}
          onChangePostContent={props.onChangePostContent}
          onChangePostImageUrl={props.onChangePostImageUrl}
          onCreateCommunityComment={props.onCreateCommunityComment}
          onStartEditCommunityComment={props.onStartEditCommunityComment}
          onCancelEditCommunityComment={props.onCancelEditCommunityComment}
          onUpdateCommunityComment={props.onUpdateCommunityComment}
          onDeleteCommunityComment={props.onDeleteCommunityComment}
          onChangeCommentContent={props.onChangeCommentContent}
          onChangeEditingCommentContent={props.onChangeEditingCommentContent}
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
          profileName={props.profileName}
          profileNameDraft={props.profileNameDraft}
          onChangeCurrentPassword={props.onChangeCurrentPassword}
          onChangeNewPassword={props.onChangeNewPassword}
          onChangePassword={props.onChangePassword}
          onChangeProfileName={props.onChangeProfileName}
          onUpdateProfile={props.onUpdateProfile}
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
