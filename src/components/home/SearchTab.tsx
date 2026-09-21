import React from 'react';
import {View} from 'react-native';
import {styles} from '../../styles';
import type {FriendRequest, FriendUser, Message, Restaurant} from '../../types';
import {FriendSearchSheet} from '../FriendSearchSheet';
import {TabScreenHeader} from './TabScreenHeader';

type SearchTabProps = {
  message: Message;
  loading: boolean;
  userSearchQuery: string;
  searchedUsers: FriendUser[];
  friendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
  friends: FriendUser[];
  selectedFriend: FriendUser | null;
  friendRestaurants: Restaurant[];
  savedRestaurants: Restaurant[];
  onChangeUserSearchQuery: (value: string) => void;
  onSearchUsers: () => void;
  onRequestFriend: (user: FriendUser) => void;
  onAcceptFriendRequest: (request: FriendRequest) => void;
  onRejectFriendRequest: (request: FriendRequest) => void;
  onCancelSentFriendRequest: (request: FriendRequest) => void;
  onDeleteFriend: (friend: FriendUser) => void;
  onSelectFriend: (friend: FriendUser | null) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
};

export function SearchTab({
  message,
  loading,
  userSearchQuery,
  searchedUsers,
  friendRequests,
  sentFriendRequests,
  friends,
  selectedFriend,
  friendRestaurants,
  savedRestaurants,
  onChangeUserSearchQuery,
  onSearchUsers,
  onRequestFriend,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  onCancelSentFriendRequest,
  onDeleteFriend,
  onSelectFriend,
  onToggleSaved,
}: SearchTabProps) {
  return (
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
        sentFriendRequests={sentFriendRequests}
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
        onCancelSentRequest={onCancelSentFriendRequest}
        onDeleteFriend={onDeleteFriend}
        onSelectFriend={onSelectFriend}
        onToggleSaved={onToggleSaved}
      />
    </View>
  );
}
