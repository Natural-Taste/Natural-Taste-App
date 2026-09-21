import {useState} from 'react';
import {request, getErrorMessage} from '../api/client';
import type {AuthResponse, FriendRequest, FriendUser, Message, Restaurant} from '../types';

type UseFriendFeatureParams = {
  auth: AuthResponse | null;
  setLoading: (loading: boolean) => void;
  setMessage: (message: Message) => void;
};

export function useFriendFeature({auth, setLoading, setMessage}: UseFriendFeatureParams) {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<FriendUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null);
  const [friendRestaurants, setFriendRestaurants] = useState<Restaurant[]>([]);

  const resetFriendState = () => {
    setUserSearchQuery('');
    setSearchedUsers([]);
    setFriendRequests([]);
    setFriends([]);
    setSelectedFriend(null);
    setFriendRestaurants([]);
  };

  const searchUsers = async () => {
    if (!auth || !userSearchQuery.trim()) {
      setMessage({tone: 'error', text: '사용자 검색어를 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const data = await request<FriendUser[]>(
        `/users/search?query=${encodeURIComponent(userSearchQuery.trim())}`,
        {auth},
      );
      setSearchedUsers(data);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? `${data.length}명의 사용자를 찾았습니다.`
            : '검색 결과가 없습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '사용자 검색에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const requestFriend = async (user: FriendUser) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      await request('/friends/requests', {
        method: 'POST',
        auth,
        body: {receiverId: user.id},
      });
      setSearchedUsers(current => current.filter(item => item.id !== user.id));
      setMessage({tone: 'success', text: '친구 요청을 보냈습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '친구 요청에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!auth) {
      return;
    }

    try {
      const data = await request<FriendRequest[]>('/friends/requests/received', {
        auth,
      });
      setFriendRequests(data);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '친구 요청 조회에 실패했습니다.'),
      });
    }
  };

  const loadFriends = async () => {
    if (!auth) {
      return;
    }

    try {
      const data = await request<FriendUser[]>('/friends', {auth});
      setFriends(data);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '친구 목록 조회에 실패했습니다.'),
      });
    }
  };

  const acceptFriendRequest = async (friendRequest: FriendRequest) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const accepted = await request<FriendUser>(
        `/friends/requests/${friendRequest.id}/accept`,
        {method: 'POST', auth},
      );
      setFriendRequests(current => current.filter(item => item.id !== friendRequest.id));
      setFriends(current => [
        accepted,
        ...current.filter(item => item.id !== accepted.id),
      ]);
      setMessage({tone: 'success', text: '친구 요청을 수락했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '친구 요청 수락에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async (friendRequest: FriendRequest) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      await request(`/friends/requests/${friendRequest.id}`, {
        method: 'DELETE',
        auth,
      });
      setFriendRequests(current => current.filter(item => item.id !== friendRequest.id));
      setMessage({tone: 'success', text: '친구 요청을 거절했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '친구 요청 거절에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const selectFriend = async (friend: FriendUser | null) => {
    if (!auth) {
      return;
    }

    setSelectedFriend(friend);
    setFriendRestaurants([]);
    if (!friend) {
      return;
    }

    setLoading(true);
    try {
      const data = await request<Restaurant[]>(
        `/friends/${friend.id}/restaurants/saved`,
        {auth},
      );
      setFriendRestaurants(data);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? `${friend.name}님의 맛집 리스트를 불러왔습니다.`
            : `${friend.name}님이 저장한 맛집이 없습니다.`,
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '친구 맛집 조회에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    userSearchQuery,
    searchedUsers,
    friendRequests,
    friends,
    selectedFriend,
    friendRestaurants,
    setUserSearchQuery,
    setSelectedFriend,
    setFriendRestaurants,
    resetFriendState,
    searchUsers,
    requestFriend,
    loadFriendRequests,
    loadFriends,
    acceptFriendRequest,
    rejectFriendRequest,
    selectFriend,
  };
}
