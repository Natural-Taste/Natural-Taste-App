import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
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
import {CommunitySheet} from './CommunitySheet';
import {FriendSearchSheet} from './FriendSearchSheet';
import {MapAccountSheet} from './AccountSheet';
import {MapPreview} from './MapPreview';
import {MapRestaurantDetail, MapRestaurantSheet} from './RestaurantSheets';
import {findSavedRestaurant} from '../utils/restaurants';

export function MapHome({
  query,
  message,
  loading,
  restaurants,
  savedRestaurants,
  selectedRestaurant,
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
  userSearchQuery,
  searchedUsers,
  friendRequests,
  friends,
  selectedFriend,
  friendRestaurants,
  savedIdSet,
  activePanel,
  userId,
  currentPassword,
  newPassword,
  onChangeQuery,
  onSearch,
  onSelectRestaurant,
  onToggleSaved,
  onOpenMap,
  onOpenCommunity,
  onOpenSearch,
  onSearchUsers,
  onRequestFriend,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onSelectFriend,
  onChangeUserSearchQuery,
  onSelectCommunityPost,
  onSaveCommunityRestaurant,
  onToggleCommunityRecommendation,
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
  onChangeCommentContent,
  onCloseDetail,
  onOpenMyPage,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangePassword,
  onLogout,
  onDeleteUser,
}: {
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
}) {
  const {height} = useWindowDimensions();
  const hasSearchResults = restaurants.length > 0;
  const mapRestaurants = hasSearchResults ? restaurants : savedRestaurants;
  const sheetRestaurants = selectedRestaurant
    ? []
    : hasSearchResults
      ? restaurants
      : savedRestaurants;

  return (
    <View style={styles.mapHome}>
      {activePanel === 'map' ? (
        <>
          <MapPreview
            restaurants={mapRestaurants}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={onSelectRestaurant}
          />

          <View style={styles.mapTopPanel}>
            <View style={styles.mapBrandRow}>
              <View>
                <Text style={styles.mapEyebrow}>Natural Taste</Text>
                <Text style={styles.mapTitle}>내 주변 맛집 지도</Text>
              </View>
            </View>

            <View style={styles.mapSearchBar}>
              <TextInput
                style={styles.mapSearchInput}
                placeholder="지역, 음식, 가게 검색"
                value={query}
                onChangeText={onChangeQuery}
                returnKeyType="search"
                onSubmitEditing={onSearch}
              />
              <Pressable
                style={({pressed}) => [
                  styles.mapSearchButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={onSearch}
                disabled={loading}>
                <Text style={styles.mapSearchButtonText}>검색</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.mapStatus,
                message.tone === 'error' ? styles.messageError : null,
                message.tone === 'success' ? styles.messageSuccess : null,
              ]}>
              {loading ? <ActivityIndicator color="#49624A" /> : null}
              <Text style={styles.mapStatusText} numberOfLines={2}>
                {message.text}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.bottomSheet,
              styles.bottomSheetAboveTabs,
              {maxHeight: Math.max(230, height * 0.42)},
            ]}>
            {selectedRestaurant ? (
              <MapRestaurantDetail
                restaurant={selectedRestaurant}
                saved={Boolean(
                  selectedRestaurant.saved ||
                    findSavedRestaurant(selectedRestaurant, savedRestaurants),
                )}
                loading={loading}
                onToggleSaved={onToggleSaved}
                onClose={onCloseDetail}
              />
            ) : (
              <MapRestaurantSheet
                title={hasSearchResults ? '검색 결과' : '저장한 맛집'}
                emptyText={
                  hasSearchResults
                    ? '검색 결과가 없습니다.'
                    : '저장한 맛집이 지도에 표시됩니다.'
                }
                restaurants={sheetRestaurants}
                savedIdSet={savedIdSet}
                loading={loading}
                onSelectRestaurant={onSelectRestaurant}
                onToggleSaved={onToggleSaved}
              />
            )}
          </View>
        </>
      ) : activePanel === 'community' ? (
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
            loading={loading}
            onSelectPost={onSelectCommunityPost}
            onSaveRestaurant={onSaveCommunityRestaurant}
            onToggleRecommendation={onToggleCommunityRecommendation}
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
            onChangeCommentContent={onChangeCommentContent}
            onClose={() => onSelectCommunityPost(null)}
            showHandle={false}
          />
        </View>
      ) : activePanel === 'search' ? (
        <View style={styles.tabScreen}>
          <TabScreenHeader
            eyebrow="Search"
            title="검색"
            message={message}
            loading={loading}
          />
          <FriendSearchSheet
            query={userSearchQuery}
            searchedUsers={searchedUsers}
            friendRequests={friendRequests}
            friends={friends}
            selectedFriend={selectedFriend}
            friendRestaurants={friendRestaurants}
            savedRestaurants={savedRestaurants}
            loading={loading}
            onChangeQuery={onChangeUserSearchQuery}
            onSearchUsers={onSearchUsers}
            onRequestFriend={onRequestFriend}
            onAcceptRequest={onAcceptFriendRequest}
            onRejectRequest={onRejectFriendRequest}
            onSelectFriend={onSelectFriend}
            onToggleSaved={onToggleSaved}
          />
        </View>
      ) : (
        <View style={styles.tabScreen}>
          <TabScreenHeader
            eyebrow="My Page"
            title="마이페이지"
            message={message}
            loading={loading}
          />
          <MapAccountSheet
            userId={userId}
            currentPassword={currentPassword}
            newPassword={newPassword}
            loading={loading}
            onChangeCurrentPassword={onChangeCurrentPassword}
            onChangeNewPassword={onChangeNewPassword}
            onChangePassword={onChangePassword}
            onLogout={onLogout}
            onDeleteUser={onDeleteUser}
            showHandle={false}
          />
        </View>
      )}

      <BottomTabBar
        activePanel={activePanel}
        loading={loading}
        onOpenMap={onOpenMap}
        onOpenCommunity={onOpenCommunity}
        onOpenSearch={onOpenSearch}
        onOpenMyPage={onOpenMyPage}
      />
    </View>
  );
}

function TabScreenHeader({
  eyebrow,
  title,
  message,
  loading,
}: {
  eyebrow: string;
  title: string;
  message: Message;
  loading: boolean;
}) {
  return (
    <View style={styles.tabScreenHeader}>
      <Text style={styles.mapEyebrow}>{eyebrow}</Text>
      <Text style={styles.tabScreenTitle}>{title}</Text>
      <View
        style={[
          styles.mapStatus,
          message.tone === 'error' ? styles.messageError : null,
          message.tone === 'success' ? styles.messageSuccess : null,
        ]}>
        {loading ? <ActivityIndicator color="#49624A" /> : null}
        <Text style={styles.mapStatusText} numberOfLines={2}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

function BottomTabBar({
  activePanel,
  loading,
  onOpenMap,
  onOpenCommunity,
  onOpenSearch,
  onOpenMyPage,
}: {
  activePanel: ActivePanel;
  loading: boolean;
  onOpenMap: () => void;
  onOpenCommunity: () => void;
  onOpenSearch: () => void;
  onOpenMyPage: () => void;
}) {
  return (
    <View style={styles.bottomTabBar}>
      <BottomTabButton
        label="지도"
        active={activePanel === 'map'}
        disabled={loading}
        onPress={onOpenMap}
      />
      <BottomTabButton
        label="커뮤니티"
        active={activePanel === 'community'}
        disabled={loading}
        onPress={onOpenCommunity}
      />
      <BottomTabButton
        label="검색"
        active={activePanel === 'search'}
        disabled={loading}
        onPress={onOpenSearch}
      />
      <BottomTabButton
        label="마이페이지"
        active={activePanel === 'mypage'}
        disabled={loading}
        onPress={onOpenMyPage}
      />
    </View>
  );
}

function BottomTabButton({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.bottomTabButton,
        active ? styles.bottomTabButtonActive : null,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <View
        style={[
          styles.bottomTabIndicator,
          active ? styles.bottomTabIndicatorActive : null,
        ]}
      />
      <Text
        style={[
          styles.bottomTabButtonText,
          active ? styles.bottomTabButtonTextActive : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}
