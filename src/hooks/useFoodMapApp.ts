import {useEffect, useRef, useState} from 'react';
import {useCommunityFeature} from './useCommunityFeature';
import {useFriendFeature} from './useFriendFeature';
import {useRestaurantFeature} from './useRestaurantFeature';
import {useColorScheme} from 'react-native';
import {request, getErrorMessage, setUnauthorizedHandler} from '../api/client';
import {clearStoredAuth, loadStoredAuth, saveStoredAuth} from '../authStorage';
import {emptyMessage} from '../constants';
import {findSavedRestaurant} from '../utils/restaurants';
import type {
  ActivePanel,
  AuthMode,
  AuthResponse,
  Message,
  Restaurant,
  UserProfile,
} from '../types';

export function useFoodMapApp() {

  const isDarkMode = useColorScheme() === 'dark';
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileNameDraft, setProfileNameDraft] = useState('');
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>('map');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(emptyMessage);
  const loadSavedRestaurantsRef = useRef<(authOverride?: AuthResponse) => Promise<void>>(async () => {});
  const loadMyProfileRef = useRef<(authOverride?: AuthResponse) => Promise<void>>(async () => {});

  const {
    query,
    savedRestaurants,
    selectedRestaurant,
    restaurantMemo,
    savedIdSet,
    visibleRestaurants,
    setQuery,
    setRestaurants,
    setSavedRestaurants,
    setSelectedRestaurant,
    setRestaurantMemo,
    resetRestaurants,
    searchRestaurants,
    loadSavedRestaurants,
    toggleSaved,
    updateSavedRestaurantMemo,
  } = useRestaurantFeature({auth, setLoading, setMessage});

  loadSavedRestaurantsRef.current = loadSavedRestaurants;

  const {
    userSearchQuery,
    searchedUsers,
    friendRequests,
    sentFriendRequests,
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
    loadSentFriendRequests,
    loadFriends,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelSentFriendRequest,
    deleteFriend,
    selectFriend,
  } = useFriendFeature({auth, setLoading, setMessage});


  const {
    communityPosts,
    selectedCommunityPost,
    postWriting,
    postEditing,
    postDraftRestaurant,
    postPlaceQuery,
    postPlaceResults,
    postTitle,
    postContent,
    postImageUrl,
    communityComments,
    commentContent,
    editingCommentId,
    editingCommentContent,
    setSelectedCommunityPost,
    setPostWriting,
    setPostDraftRestaurant,
    setPostPlaceQuery,
    setPostTitle,
    setPostContent,
    setPostImageUrl,
    setCommentContent,
    setEditingCommentContent,
    resetCommunityState,
    resetCommunitySelection,
    loadCommunityPosts,
    selectCommunityPost,
    startCommunityPost,
    cancelCommunityPost,
    searchCommunityPostPlaces,
    selectCommunityPostPlace,
    createCommunityPost,
    startEditCommunityPost,
    cancelEditCommunityPost,
    updateCommunityPost,
    saveCommunityRestaurant,
    toggleCommunityRecommendation,
    createCommunityComment,
    startEditCommunityComment,
    cancelEditCommunityComment,
    updateCommunityComment,
    deleteCommunityPost,
    deleteCommunityComment,
  } = useCommunityFeature({
    auth,
    setLoading,
    setMessage,
    setSelectedRestaurant,
    setRestaurants,
    setSavedRestaurants,
  });

  const clearSession = async (messageOverride?: Message) => {
    await clearStoredAuth();
    setAuth(null);
    setProfileName('');
    setProfileNameDraft('');
    resetRestaurants();
    setActivePanel('map');
    resetCommunityState();
    resetFriendState();
    if (messageOverride) {
      setMessage(messageOverride);
    }
  };

  useEffect(() => {
    let active = true;

    const restoreAuth = async () => {
      setLoading(true);
      try {
        const storedAuth = await loadStoredAuth();
        if (!active || !storedAuth) {
          return;
        }

        setAuth(storedAuth);
        await loadSavedRestaurantsRef.current(storedAuth);
        await loadMyProfileRef.current(storedAuth);
      } catch {
        await clearStoredAuth();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreAuth();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession({
        tone: 'error',
        text: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
      });
    });

    return () => setUnauthorizedHandler(null);
  });

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
      await saveStoredAuth(data);
      await loadMyProfile(data);
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
      await clearSession({tone: 'success', text: '로그아웃되었습니다.'});
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

  const loadMyProfile = async (authOverride?: AuthResponse) => {
    const activeAuth = authOverride ?? auth;
    if (!activeAuth) {
      return;
    }

    try {
      const profile = await request<UserProfile>('/users/me', {auth: activeAuth});
      setProfileName(profile.name);
      setProfileNameDraft(profile.name);
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '회원 정보 조회에 실패했습니다.'),
      });
    }
  };

  loadMyProfileRef.current = loadMyProfile;

  const updateMyProfile = async () => {
    if (!auth) {
      return;
    }

    if (!profileNameDraft.trim()) {
      setMessage({tone: 'error', text: '이름을 입력해 주세요.'});
      return;
    }

    setLoading(true);
    try {
      const profile = await request<UserProfile>('/users/me', {
        method: 'PATCH',
        auth,
        body: {name: profileNameDraft.trim()},
      });
      setProfileName(profile.name);
      setProfileNameDraft(profile.name);
      setMessage({tone: 'success', text: '프로필 이름이 수정되었습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '프로필 수정에 실패했습니다.'),
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
      await clearSession({tone: 'success', text: '회원탈퇴가 완료되었습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '회원탈퇴에 실패했습니다.'),
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
    resetCommunitySelection();
    setActivePanel('search');
    await Promise.all([loadFriendRequests(), loadSentFriendRequests(), loadFriends()]);
  };

  const selectRestaurant = (restaurant: Restaurant) => {
    const savedRestaurant = findSavedRestaurant(restaurant, savedRestaurants);
    setActivePanel('map');
    setSelectedRestaurant(savedRestaurant ?? restaurant);
    setRestaurantMemo((savedRestaurant ?? restaurant).memo ?? '');
  };

  const openMap = () => {
    resetCommunitySelection();
    setActivePanel('map');
  };

  const openMyPage = () => {
    setSelectedRestaurant(null);
    resetCommunitySelection();
    setSelectedFriend(null);
    setFriendRestaurants([]);
    setActivePanel('mypage');
    loadMyProfile();
  };

  return {
    auth,
    isDarkMode,
    authPanelProps: {
      mode: authMode,
      email,
      password,
      name,
      loading,
      onChangeMode: setAuthMode,
      onChangeEmail: setEmail,
      onChangePassword: setPassword,
      onChangeName: setName,
      onSubmit: submitAuth,
    },
    mapHomeProps: {
      query,
      message,
      loading,
      restaurants: visibleRestaurants,
      savedRestaurants,
      selectedRestaurant,
      restaurantMemo,
      communityPosts,
      selectedCommunityPost,
      postDraftRestaurant,
      postWriting,
      postEditing,
      postPlaceQuery,
      postPlaceResults,
      postTitle,
      postContent,
      postImageUrl,
      communityComments,
      commentContent,
      editingCommentId,
      editingCommentContent,
      userSearchQuery,
      searchedUsers,
      friendRequests,
      sentFriendRequests,
      friends,
      selectedFriend,
      friendRestaurants,
      savedIdSet,
      activePanel,
      userId: auth?.userId ?? 0,
      currentPassword,
      newPassword,
      profileName,
      profileNameDraft,
      onChangeQuery: setQuery,
      onSearch: searchRestaurants,
      onSelectRestaurant: selectRestaurant,
      onToggleSaved: toggleSaved,
      onChangeRestaurantMemo: setRestaurantMemo,
      onUpdateRestaurantMemo: updateSavedRestaurantMemo,
      onOpenMap: openMap,
      onOpenCommunity: openCommunity,
      onOpenSearch: openSearch,
      onSearchUsers: searchUsers,
      onRequestFriend: requestFriend,
      onAcceptFriendRequest: acceptFriendRequest,
      onRejectFriendRequest: rejectFriendRequest,
      onCancelSentFriendRequest: cancelSentFriendRequest,
      onDeleteFriend: deleteFriend,
      onSelectFriend: selectFriend,
      onChangeUserSearchQuery: setUserSearchQuery,
      onSelectCommunityPost: selectCommunityPost,
      onSaveCommunityRestaurant: saveCommunityRestaurant,
      onToggleCommunityRecommendation: toggleCommunityRecommendation,
      onDeleteCommunityPost: deleteCommunityPost,
      onStartCommunityPost: startCommunityPost,
      onCancelCommunityPost: cancelCommunityPost,
      onSearchCommunityPostPlaces: searchCommunityPostPlaces,
      onSelectCommunityPostPlace: selectCommunityPostPlace,
      onCreateCommunityPost: createCommunityPost,
      onStartEditCommunityPost: startEditCommunityPost,
      onCancelEditCommunityPost: cancelEditCommunityPost,
      onUpdateCommunityPost: updateCommunityPost,
      onChangePostPlaceQuery: setPostPlaceQuery,
      onChangePostTitle: setPostTitle,
      onChangePostContent: setPostContent,
      onChangePostImageUrl: setPostImageUrl,
      onCreateCommunityComment: createCommunityComment,
      onStartEditCommunityComment: startEditCommunityComment,
      onCancelEditCommunityComment: cancelEditCommunityComment,
      onUpdateCommunityComment: updateCommunityComment,
      onDeleteCommunityComment: deleteCommunityComment,
      onChangeCommentContent: setCommentContent,
      onChangeEditingCommentContent: setEditingCommentContent,
      onCloseDetail: () => setSelectedRestaurant(null),
      onOpenMyPage: openMyPage,
      onChangeCurrentPassword: setCurrentPassword,
      onChangeNewPassword: setNewPassword,
      onChangePassword: changePassword,
      onChangeProfileName: setProfileNameDraft,
      onUpdateProfile: updateMyProfile,
      onLogout: logout,
      onDeleteUser: deleteUser,
    },
    message,
    loading,
  };
}
