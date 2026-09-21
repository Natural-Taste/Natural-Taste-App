import React from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from '../styles';
import type {FriendRequest, FriendUser, Restaurant} from '../types';
import {formatDate} from '../utils/date';
import {findSavedRestaurant, getRestaurantKey} from '../utils/restaurants';
import {Field} from './Common';

export function FriendSearchSheet({
  query,
  searchedUsers,
  friendRequests,
  sentFriendRequests,
  friends,
  selectedFriend,
  friendRestaurants,
  savedRestaurants,
  loading,
  onChangeQuery,
  onSearchUsers,
  onRequestFriend,
  onAcceptRequest,
  onRejectRequest,
  onCancelSentRequest,
  onDeleteFriend,
  onSelectFriend,
  onToggleSaved,
}: {
  query: string;
  searchedUsers: FriendUser[];
  friendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
  friends: FriendUser[];
  selectedFriend: FriendUser | null;
  friendRestaurants: Restaurant[];
  savedRestaurants: Restaurant[];
  loading: boolean;
  onChangeQuery: (value: string) => void;
  onSearchUsers: () => void;
  onRequestFriend: (user: FriendUser) => void;
  onAcceptRequest: (request: FriendRequest) => void;
  onRejectRequest: (request: FriendRequest) => void;
  onCancelSentRequest: (request: FriendRequest) => void;
  onDeleteFriend: (friend: FriendUser) => void;
  onSelectFriend: (friend: FriendUser | null) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
}) {
  const savedIdSet = new Set(
    savedRestaurants
      .map(restaurant => restaurant.id)
      .filter((id): id is number => id !== null),
  );

  return (
    <ScrollView
      style={styles.communityWriteScroll}
      contentContainerStyle={styles.communityWriteContent}
      showsVerticalScrollIndicator>
      <Field label="사용자 검색">
        <View style={styles.inlineSearchRow}>
          <TextInput
            style={[styles.input, styles.inlineSearchInput]}
            placeholder="이름 또는 이메일"
            value={query}
            onChangeText={onChangeQuery}
            returnKeyType="search"
            onSubmitEditing={onSearchUsers}
            autoCapitalize="none"
          />
          <Pressable
            style={({pressed}) => [
              styles.inlineSearchButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={onSearchUsers}
            disabled={loading}>
            <Text style={styles.inlineSearchButtonText}>검색</Text>
          </Pressable>
        </View>
      </Field>

      <FriendSection title="검색 결과" emptyText="검색한 사용자가 여기에 표시됩니다.">
        {searchedUsers.map(user => {
          const sentRequest = sentFriendRequests.find(
            request => request.receiver?.id === user.id,
          );
          const receivedRequest = friendRequests.find(
            request => request.requester.id === user.id,
          );
          const action = getSearchAction(user, sentRequest, receivedRequest);

          return (
            <FriendUserRow
              key={user.id}
              user={user}
              actionLabel={action.label}
              active={user.relationshipStatus === 'FRIEND'}
              danger={user.relationshipStatus === 'SENT_REQUEST'}
              loading={loading || action.disabled}
              onPress={() => {
                if (action.type === 'request') {
                  onRequestFriend(user);
                } else if (action.type === 'cancel' && sentRequest) {
                  onCancelSentRequest(sentRequest);
                } else if (action.type === 'accept' && receivedRequest) {
                  onAcceptRequest(receivedRequest);
                }
              }}
            />
          );
        })}
      </FriendSection>

      <FriendSection title="받은 친구 요청" emptyText="받은 친구 요청이 없습니다.">
        {friendRequests.map(friendRequest => (
          <View key={friendRequest.id} style={styles.friendRow}>
            <View style={styles.restaurantTextGroup}>
              <Text style={styles.restaurantName}>{friendRequest.requester.name}</Text>
              <Text style={styles.restaurantAddress}>{friendRequest.requester.email}</Text>
              <Text style={styles.postDate}>{formatDate(friendRequest.createdAt)}</Text>
            </View>
            <View style={styles.friendActionRow}>
              <Pressable
                style={({pressed}) => [
                  styles.smallActionButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={() => onAcceptRequest(friendRequest)}
                disabled={loading}>
                <Text style={styles.smallActionButtonText}>수락</Text>
              </Pressable>
              <Pressable
                style={({pressed}) => [
                  styles.smallActionButton,
                  styles.smallActionDangerButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={() => onRejectRequest(friendRequest)}
                disabled={loading}>
                <Text
                  style={[
                    styles.smallActionButtonText,
                    styles.smallActionDangerButtonText,
                  ]}>
                  거절
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </FriendSection>

      <FriendSection title="내 친구" emptyText="아직 친구가 없습니다.">
        {friends.map(friend => (
          <FriendUserRow
            key={friend.id}
            user={friend}
            actionLabel={
              selectedFriend?.id === friend.id ? '선택됨' : '맛집 보기'
            }
            active={selectedFriend?.id === friend.id}
            loading={loading}
            onPress={() => onSelectFriend(friend)}
          />
        ))}
      </FriendSection>

      {selectedFriend ? (
        <View style={styles.friendSection}>
          <View style={styles.detailTopRow}>
            <View style={styles.restaurantTextGroup}>
              <Text style={styles.savedPlaceTitle}>
                {selectedFriend.name}님의 맛집 리스트
              </Text>
              <Text style={styles.restaurantAddress}>{selectedFriend.email}</Text>
            </View>
            <View style={styles.friendActionRow}>
              <Pressable
                style={({pressed}) => [
                  styles.smallActionButton,
                  styles.smallActionDangerButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={() => onDeleteFriend(selectedFriend)}
                disabled={loading}>
                <Text
                  style={[
                    styles.smallActionButtonText,
                    styles.smallActionDangerButtonText,
                  ]}>
                  끊기
                </Text>
              </Pressable>
              <Pressable
                style={({pressed}) => [
                  styles.closeButton,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => onSelectFriend(null)}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>
          </View>
          {friendRestaurants.length > 0 ? (
            <View style={styles.listStack}>
              {friendRestaurants.map(restaurant => {
                const saved =
                  restaurant.saved ||
                  (restaurant.id !== null && savedIdSet.has(restaurant.id)) ||
                  Boolean(findSavedRestaurant(restaurant, savedRestaurants));

                return (
                  <View key={getRestaurantKey(restaurant)} style={styles.friendRestaurantRow}>
                    <View style={styles.restaurantTextGroup}>
                      <Text style={styles.restaurantName} numberOfLines={1}>
                        {restaurant.name}
                      </Text>
                      <Text style={styles.restaurantMeta} numberOfLines={1}>
                        {restaurant.category || '카테고리 미정'}
                      </Text>
                      <Text style={styles.restaurantAddress} numberOfLines={1}>
                        {restaurant.address}
                      </Text>
                    </View>
                    <Pressable
                      style={({pressed}) => [
                        styles.sheetSaveButton,
                        saved ? styles.sheetSaveButtonActive : null,
                        pressed ? styles.pressed : null,
                        loading || saved ? styles.disabled : null,
                      ]}
                      onPress={() => onToggleSaved(restaurant)}
                      disabled={loading || saved}>
                      <Text
                        style={[
                          styles.sheetSaveButtonText,
                          saved ? styles.sheetSaveButtonActiveText : null,
                        ]}>
                        {saved ? '저장됨' : '저장'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.savedPlaceEmpty}>저장한 맛집이 없습니다.</Text>
          )}
        </View>
      ) : null}
    </ScrollView>
  );
}

function FriendSection({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const childCount = React.Children.count(children);

  return (
    <View style={styles.friendSection}>
      <Text style={styles.savedPlaceTitle}>{title}</Text>
      {childCount > 0 ? <View style={styles.listStack}>{children}</View> : (
        <Text style={styles.savedPlaceEmpty}>{emptyText}</Text>
      )}
    </View>
  );
}

function getSearchAction(
  user: FriendUser,
  sentRequest: FriendRequest | undefined,
  receivedRequest: FriendRequest | undefined,
) {
  if (user.relationshipStatus === 'FRIEND') {
    return {type: 'none', label: '친구', disabled: true};
  }
  if (user.relationshipStatus === 'SENT_REQUEST') {
    return {type: 'cancel', label: '요청 취소', disabled: !sentRequest};
  }
  if (user.relationshipStatus === 'RECEIVED_REQUEST') {
    return {type: 'accept', label: '수락', disabled: !receivedRequest};
  }
  return {type: 'request', label: '요청', disabled: false};
}

function FriendUserRow({
  user,
  actionLabel,
  active = false,
  danger = false,
  loading,
  onPress,
}: {
  user: FriendUser;
  actionLabel: string;
  active?: boolean;
  danger?: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <View style={[styles.friendRow, active ? styles.placeResultItemActive : null]}>
      <View style={styles.restaurantTextGroup}>
        <Text style={styles.restaurantName}>{user.name}</Text>
        <Text style={styles.restaurantAddress}>{user.email}</Text>
      </View>
      <Pressable
        style={({pressed}) => [
          styles.sheetSaveButton,
          active ? styles.sheetSaveButtonActive : null,
          danger ? styles.smallActionDangerButton : null,
          pressed ? styles.pressed : null,
          loading ? styles.disabled : null,
        ]}
        onPress={onPress}
        disabled={loading}>
        <Text
          style={[
            styles.sheetSaveButtonText,
            active ? styles.sheetSaveButtonActiveText : null,
            danger ? styles.smallActionDangerButtonText : null,
          ]}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
