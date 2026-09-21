import React, {useMemo, useState} from 'react';
import {ScrollView, StatusBar, Text, useColorScheme, View} from 'react-native';
import {request, getErrorMessage} from './src/api/client';
import {AuthPanel} from './src/components/AuthPanel';
import {MessageBox} from './src/components/Common';
import {MapHome} from './src/components/MapHome';
import {emptyMessage} from './src/constants';
import {styles} from './src/styles';
import type {
  ActivePanel,
  AuthMode,
  AuthResponse,
  CommunityComment,
  CommunityPost,
  FriendRequest,
  FriendUser,
  Message,
  Restaurant,
} from './src/types';
import {
  findSavedRestaurant,
  getRestaurantKey,
  toSaveRestaurantBody,
} from './src/utils/restaurants';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>('map');
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [selectedCommunityPost, setSelectedCommunityPost] =
    useState<CommunityPost | null>(null);
  const [postWriting, setPostWriting] = useState(false);
  const [postDraftRestaurant, setPostDraftRestaurant] =
    useState<Restaurant | null>(null);
  const [postPlaceQuery, setPostPlaceQuery] = useState('');
  const [postPlaceResults, setPostPlaceResults] = useState<Restaurant[]>([]);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [communityComments, setCommunityComments] = useState<CommunityComment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<FriendUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null);
  const [friendRestaurants, setFriendRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(emptyMessage);

  const savedIdSet = useMemo(
    () =>
      new Set(
        savedRestaurants
          .map(restaurant => restaurant.id)
          .filter((id): id is number => id !== null),
      ),
    [savedRestaurants],
  );

  const savedPlaceSet = useMemo(
    () => new Set(savedRestaurants.map(getRestaurantKey)),
    [savedRestaurants],
  );

  const visibleRestaurants = useMemo(
    () =>
      restaurants.map(restaurant => ({
        ...restaurant,
        saved:
          restaurant.saved ||
          (restaurant.id !== null && savedIdSet.has(restaurant.id)) ||
          savedPlaceSet.has(getRestaurantKey(restaurant)),
      })),
    [restaurants, savedIdSet, savedPlaceSet],
  );

  const resetFriendState = () => {
    setUserSearchQuery('');
    setSearchedUsers([]);
    setFriendRequests([]);
    setFriends([]);
    setSelectedFriend(null);
    setFriendRestaurants([]);
  };

  const submitAuth = async () => {
    setLoading(true);
    setMessage({tone: 'info', text: '인증 요청을 보내는 중입니다.'});

    try {
      const data = await request<AuthResponse>(
        authMode === 'login' ? '/auth/login' : '/auth/signup',
        {
          method: 'POST',
          body:
            authMode === 'login'
              ? {email, password}
              : {email, password, name},
        },
      );

      setAuth(data);
      setPassword('');
      setCurrentPassword('');
      setNewPassword('');
      setActivePanel('map');
      setMessage({
        tone: 'success',
        text: authMode === 'login' ? '로그인되었습니다.' : '회원가입이 완료되었습니다.',
      });
      await loadSavedRestaurants(data);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '인증에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      await request('/auth/logout', {method: 'POST', auth});
    } catch {
      // 서버 로그아웃 실패와 관계없이 앱 토큰은 지웁니다.
    } finally {
      setAuth(null);
      setRestaurants([]);
      setSavedRestaurants([]);
      setSelectedRestaurant(null);
      setActivePanel('map');
      setCommunityPosts([]);
      setSelectedCommunityPost(null);
      setPostWriting(false);
      setPostDraftRestaurant(null);
      setPostPlaceQuery('');
      setPostPlaceResults([]);
      setPostImageUrl('');
      setCommunityComments([]);
      setCommentContent('');
      resetFriendState();
      setMessage({tone: 'success', text: '로그아웃되었습니다.'});
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      await request('/users/me/password', {
        method: 'PATCH',
        auth,
        body: {currentPassword, newPassword},
      });
      setCurrentPassword('');
      setNewPassword('');
      setMessage({tone: 'success', text: '비밀번호가 수정되었습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '비밀번호 수정에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      await request('/users/me', {
        method: 'DELETE',
        auth,
        body: {password: currentPassword},
      });
      setAuth(null);
      setRestaurants([]);
      setSavedRestaurants([]);
      setSelectedRestaurant(null);
      setActivePanel('map');
      setCommunityPosts([]);
      setSelectedCommunityPost(null);
      setPostWriting(false);
      setPostDraftRestaurant(null);
      setPostPlaceQuery('');
      setPostPlaceResults([]);
      setPostImageUrl('');
      setCommunityComments([]);
      setCommentContent('');
      resetFriendState();
      setMessage({tone: 'success', text: '회원탈퇴가 완료되었습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '회원탈퇴에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const searchRestaurants = async () => {
    if (!auth || !query.trim()) {
      setMessage({tone: 'error', text: '검색어를 입력해 주세요.'});
      return;
    }

    setLoading(true);
    setMessage({tone: 'info', text: '맛집을 검색하는 중입니다.'});

    try {
      const data = await request<Restaurant[]>(
        `/restaurants/search?query=${encodeURIComponent(query.trim())}`,
        {auth},
      );
      setRestaurants(data);
      setSelectedRestaurant(null);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? `${data.length}개의 맛집을 찾았습니다.`
            : '검색 결과가 없습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '맛집 검색에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRestaurants = async (authOverride?: AuthResponse) => {
    const activeAuth = authOverride ?? auth;
    if (!activeAuth) {
      return;
    }

    setLoading(true);
    try {
      const data = await request<Restaurant[]>('/restaurants/saved', {
        auth: activeAuth,
      });
      setSavedRestaurants(data);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? '저장한 맛집 목록을 불러왔습니다.'
            : '아직 저장한 맛집이 없습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '저장 목록 조회에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSaved = async (restaurant: Restaurant) => {
    if (!auth) {
      return;
    }

    const savedRestaurant = findSavedRestaurant(restaurant, savedRestaurants);
    const isSaved = Boolean(savedRestaurant) || restaurant.saved;
    setLoading(true);

    try {
      if (isSaved && savedRestaurant?.id !== null && savedRestaurant?.id !== undefined) {
        await request(`/restaurants/saved/${savedRestaurant.id}`, {
          method: 'DELETE',
          auth,
        });
        setSavedRestaurants(current =>
          current.filter(saved => getRestaurantKey(saved) !== getRestaurantKey(restaurant)),
        );
        setRestaurants(current =>
          current.map(item =>
            getRestaurantKey(item) === getRestaurantKey(restaurant)
              ? {...item, saved: false}
              : item,
          ),
        );
        setSelectedRestaurant(current =>
          current && getRestaurantKey(current) === getRestaurantKey(restaurant)
            ? {...current, saved: false}
            : current,
        );
        setMessage({tone: 'success', text: '저장을 취소했습니다.'});
        return;
      }

      const saved = await request<Restaurant>('/restaurants/saved', {
        method: 'POST',
        auth,
        body: toSaveRestaurantBody(restaurant),
      });
      setSavedRestaurants(current => [
        saved,
        ...current.filter(item => getRestaurantKey(item) !== getRestaurantKey(saved)),
      ]);
      setRestaurants([]);
      setSelectedRestaurant(null);
      setMessage({tone: 'success', text: '맛집을 저장했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '저장 상태 변경에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const openCommunity = async () => {
    setSelectedRestaurant(null);
    setSelectedCommunityPost(null);
    setPostWriting(false);
    setPostDraftRestaurant(null);
    setActivePanel('community');
    await loadCommunityPosts();
  };

  const openSearch = async () => {
    setSelectedRestaurant(null);
    setSelectedCommunityPost(null);
    setPostWriting(false);
    setPostDraftRestaurant(null);
    setPostPlaceQuery('');
    setPostPlaceResults([]);
    setCommunityComments([]);
    setCommentContent('');
    setActivePanel('search');
    await Promise.all([loadFriendRequests(), loadFriends()]);
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

  const loadCommunityPosts = async () => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const data = await request<CommunityPost[]>('/community/posts', {auth});
      setCommunityPosts(data);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? '커뮤니티 게시글을 불러왔습니다.'
            : '아직 커뮤니티 게시글이 없습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '커뮤니티 조회에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCommunityComments = async (postId: number) => {
    if (!auth) {
      return;
    }

    try {
      const data = await request<CommunityComment[]>(
        `/community/posts/${postId}/comments`,
        {auth},
      );
      setCommunityComments(data);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '댓글 조회에 실패했습니다.'),
      });
    }
  };

  const selectCommunityPost = async (post: CommunityPost | null) => {
    setSelectedCommunityPost(post);
    setPostWriting(false);
    setPostDraftRestaurant(null);
    setCommentContent('');

    if (post) {
      await loadCommunityComments(post.id);
      return;
    }

    setCommunityComments([]);
  };

  const startCommunityPost = () => {
    setSelectedCommunityPost(null);
    setPostWriting(true);
    setPostDraftRestaurant(null);
    setPostPlaceQuery('');
    setPostPlaceResults([]);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
    setCommunityComments([]);
    setCommentContent('');
    setActivePanel('community');
  };

  const cancelCommunityPost = () => {
    setPostWriting(false);
    setPostDraftRestaurant(null);
    setPostPlaceQuery('');
    setPostPlaceResults([]);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
  };

  const searchCommunityPostPlaces = async () => {
    if (!auth || !postPlaceQuery.trim()) {
      setMessage({tone: 'error', text: '장소 검색어를 입력해 주세요.'});
      return;
    }

    setLoading(true);
    setMessage({tone: 'info', text: '후기를 남길 장소를 검색하는 중입니다.'});

    try {
      const data = await request<Restaurant[]>(
        `/restaurants/search?query=${encodeURIComponent(postPlaceQuery.trim())}`,
        {auth},
      );
      setPostPlaceResults(data);
      setMessage({
        tone: 'success',
        text:
          data.length > 0
            ? `${data.length}개의 장소를 찾았습니다.`
            : '장소 검색 결과가 없습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '장소 검색에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const selectCommunityPostPlace = (restaurant: Restaurant) => {
    setPostDraftRestaurant(restaurant);
    setPostPlaceResults([]);
    setPostPlaceQuery(restaurant.name);
    setMessage({tone: 'success', text: '장소를 선택했습니다.'});
  };

  const createCommunityPost = async () => {
    if (!auth || !postDraftRestaurant) {
      setMessage({tone: 'error', text: '후기를 남길 장소를 선택해 주세요.'});
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      setMessage({tone: 'error', text: '제목과 내용을 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const created = await request<CommunityPost>('/community/posts', {
        method: 'POST',
        auth,
        body: {
          title: postTitle.trim(),
          content: postContent.trim(),
          imageUrl: postImageUrl.trim() || undefined,
          restaurant: toSaveRestaurantBody(postDraftRestaurant),
        },
      });
      setCommunityPosts(current => [
        created,
        ...current.filter(post => post.id !== created.id),
      ]);
      setSelectedCommunityPost(created);
      setPostWriting(false);
      setPostDraftRestaurant(null);
      setPostPlaceQuery('');
      setPostPlaceResults([]);
      setPostTitle('');
      setPostContent('');
      setPostImageUrl('');
      setCommunityComments([]);
      setCommentContent('');
      setSelectedRestaurant(null);
      setMessage({tone: 'success', text: '커뮤니티 게시글을 작성했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '게시글 작성에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCommunityRestaurant = async (post: CommunityPost) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const saved = await request<Restaurant>(
        `/community/posts/${post.id}/save`,
        {
          method: 'POST',
          auth,
        },
      );
      setSavedRestaurants(current => [
        saved,
        ...current.filter(item => getRestaurantKey(item) !== getRestaurantKey(saved)),
      ]);
      setRestaurants(current =>
        current.map(item =>
          getRestaurantKey(item) === getRestaurantKey(saved)
            ? {...item, id: saved.id, saved: true}
            : item,
        ),
      );
      setCommunityPosts(current =>
        current.map(item =>
          item.id === post.id
            ? {...item, restaurant: {...item.restaurant, id: saved.id, saved: true}}
            : item,
        ),
      );
      setSelectedCommunityPost(current =>
        current?.id === post.id
          ? {...current, restaurant: {...current.restaurant, id: saved.id, saved: true}}
          : current,
      );
      setMessage({tone: 'success', text: '게시글의 맛집을 저장했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '게시글 맛집 저장에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCommunityRecommendation = async (post: CommunityPost) => {
    if (!auth) {
      return;
    }

    setLoading(true);
    try {
      const updated = await request<CommunityPost>(
        `/community/posts/${post.id}/recommend`,
        {
          method: 'POST',
          auth,
        },
      );
      setCommunityPosts(current =>
        current.map(item => (item.id === updated.id ? updated : item)),
      );
      setSelectedCommunityPost(current =>
        current?.id === updated.id ? updated : current,
      );
      setMessage({
        tone: 'success',
        text: updated.recommended ? '게시글을 추천했습니다.' : '추천을 취소했습니다.',
      });
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '추천 상태 변경에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  const createCommunityComment = async () => {
    if (!auth || !selectedCommunityPost) {
      return;
    }

    if (!commentContent.trim()) {
      setMessage({tone: 'error', text: '댓글 내용을 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const created = await request<CommunityComment>(
        `/community/posts/${selectedCommunityPost.id}/comments`,
        {
          method: 'POST',
          auth,
          body: {content: commentContent.trim()},
        },
      );
      setCommunityComments(current => [...current, created]);
      setCommunityPosts(current =>
        current.map(post =>
          post.id === selectedCommunityPost.id
            ? {...post, commentCount: post.commentCount + 1}
            : post,
        ),
      );
      setSelectedCommunityPost(current =>
        current ? {...current, commentCount: current.commentCount + 1} : current,
      );
      setCommentContent('');
      setMessage({tone: 'success', text: '댓글을 작성했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '댓글 작성에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {auth ? (
        <MapHome
          query={query}
          message={message}
          loading={loading}
          restaurants={visibleRestaurants}
          savedRestaurants={savedRestaurants}
          selectedRestaurant={selectedRestaurant}
          communityPosts={communityPosts}
          selectedCommunityPost={selectedCommunityPost}
          postDraftRestaurant={postDraftRestaurant}
          postWriting={postWriting}
          postPlaceQuery={postPlaceQuery}
          postPlaceResults={postPlaceResults}
          postTitle={postTitle}
          postContent={postContent}
          postImageUrl={postImageUrl}
          communityComments={communityComments}
          commentContent={commentContent}
          userSearchQuery={userSearchQuery}
          searchedUsers={searchedUsers}
          friendRequests={friendRequests}
          friends={friends}
          selectedFriend={selectedFriend}
          friendRestaurants={friendRestaurants}
          savedIdSet={savedIdSet}
          activePanel={activePanel}
          userId={auth.userId}
          currentPassword={currentPassword}
          newPassword={newPassword}
          onChangeQuery={setQuery}
          onSearch={searchRestaurants}
          onSelectRestaurant={restaurant => {
            setActivePanel('map');
            setSelectedRestaurant(restaurant);
          }}
          onToggleSaved={toggleSaved}
          onOpenMap={() => {
            setSelectedCommunityPost(null);
            setPostWriting(false);
            setPostDraftRestaurant(null);
            setPostPlaceQuery('');
            setPostPlaceResults([]);
            setCommunityComments([]);
            setCommentContent('');
            setActivePanel('map');
          }}
          onOpenCommunity={openCommunity}
          onOpenSearch={openSearch}
          onSearchUsers={searchUsers}
          onRequestFriend={requestFriend}
          onAcceptFriendRequest={acceptFriendRequest}
          onRejectFriendRequest={rejectFriendRequest}
          onSelectFriend={selectFriend}
          onChangeUserSearchQuery={setUserSearchQuery}
          onSelectCommunityPost={selectCommunityPost}
          onSaveCommunityRestaurant={saveCommunityRestaurant}
          onToggleCommunityRecommendation={toggleCommunityRecommendation}
          onStartCommunityPost={startCommunityPost}
          onCancelCommunityPost={cancelCommunityPost}
          onSearchCommunityPostPlaces={searchCommunityPostPlaces}
          onSelectCommunityPostPlace={selectCommunityPostPlace}
          onCreateCommunityPost={createCommunityPost}
          onChangePostPlaceQuery={setPostPlaceQuery}
          onChangePostTitle={setPostTitle}
          onChangePostContent={setPostContent}
          onChangePostImageUrl={setPostImageUrl}
          onCreateCommunityComment={createCommunityComment}
          onChangeCommentContent={setCommentContent}
          onCloseDetail={() => setSelectedRestaurant(null)}
          onOpenMyPage={() => {
            setSelectedRestaurant(null);
            setSelectedCommunityPost(null);
            setPostWriting(false);
            setPostDraftRestaurant(null);
            setPostPlaceQuery('');
            setPostPlaceResults([]);
            setCommunityComments([]);
            setCommentContent('');
            setSelectedFriend(null);
            setFriendRestaurants([]);
            setActivePanel('mypage');
          }}
          onChangeCurrentPassword={setCurrentPassword}
          onChangeNewPassword={setNewPassword}
          onChangePassword={changePassword}
          onLogout={logout}
          onDeleteUser={deleteUser}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>FoodMap MVP</Text>
            <Text style={styles.title}>Natural Taste</Text>
            <Text style={styles.description}>
              맛집을 검색하고, 마음에 드는 장소를 내 목록에 저장하세요.
            </Text>
          </View>

          <MessageBox message={message} loading={loading} />
          <AuthPanel
            mode={authMode}
            email={email}
            password={password}
            name={name}
            loading={loading}
            onChangeMode={setAuthMode}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onChangeName={setName}
            onSubmit={submitAuth}
          />
        </ScrollView>
      )}
    </View>
  );
}

export default App;
