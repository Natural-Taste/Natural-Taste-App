import {useState} from 'react';
import {useCommunityFeature} from './useCommunityFeature';
import {useFriendFeature} from './useFriendFeature';
import {useRestaurantFeature} from './useRestaurantFeature';
import {useColorScheme} from 'react-native';
import {request, getErrorMessage} from '../api/client';
import {emptyMessage} from '../constants';
import type {
  ActivePanel,
  AuthMode,
  AuthResponse,
  Message,
  Restaurant,
} from '../types';

export function useFoodMapApp() {

  const isDarkMode = useColorScheme() === 'dark';
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>('map');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(emptyMessage);

  const {
    query,
    savedRestaurants,
    selectedRestaurant,
    savedIdSet,
    visibleRestaurants,
    setQuery,
    setRestaurants,
    setSavedRestaurants,
    setSelectedRestaurant,
    resetRestaurants,
    searchRestaurants,
    loadSavedRestaurants,
    toggleSaved,
  } = useRestaurantFeature({auth, setLoading, setMessage});

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
    postDraftRestaurant,
    postPlaceQuery,
    postPlaceResults,
    postTitle,
    postContent,
    postImageUrl,
    communityComments,
    commentContent,
    setSelectedCommunityPost,
    setPostWriting,
    setPostDraftRestaurant,
    setPostPlaceQuery,
    setPostTitle,
    setPostContent,
    setPostImageUrl,
    setCommentContent,
    resetCommunityState,
    resetCommunitySelection,
    loadCommunityPosts,
    selectCommunityPost,
    startCommunityPost,
    cancelCommunityPost,
    searchCommunityPostPlaces,
    selectCommunityPostPlace,
    createCommunityPost,
    saveCommunityRestaurant,
    toggleCommunityRecommendation,
    createCommunityComment,
  } = useCommunityFeature({
    auth,
    setLoading,
    setMessage,
    setSelectedRestaurant,
    setRestaurants,
    setSavedRestaurants,
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
      resetRestaurants();
      setActivePanel('map');
      resetCommunityState();
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
      resetRestaurants();
      setActivePanel('map');
      resetCommunityState();
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
    setActivePanel('map');
    setSelectedRestaurant(restaurant);
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
      sentFriendRequests,
      friends,
      selectedFriend,
      friendRestaurants,
      savedIdSet,
      activePanel,
      userId: auth?.userId ?? 0,
      currentPassword,
      newPassword,
      onChangeQuery: setQuery,
      onSearch: searchRestaurants,
      onSelectRestaurant: selectRestaurant,
      onToggleSaved: toggleSaved,
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
      onStartCommunityPost: startCommunityPost,
      onCancelCommunityPost: cancelCommunityPost,
      onSearchCommunityPostPlaces: searchCommunityPostPlaces,
      onSelectCommunityPostPlace: selectCommunityPostPlace,
      onCreateCommunityPost: createCommunityPost,
      onChangePostPlaceQuery: setPostPlaceQuery,
      onChangePostTitle: setPostTitle,
      onChangePostContent: setPostContent,
      onChangePostImageUrl: setPostImageUrl,
      onCreateCommunityComment: createCommunityComment,
      onChangeCommentContent: setCommentContent,
      onCloseDetail: () => setSelectedRestaurant(null),
      onOpenMyPage: openMyPage,
      onChangeCurrentPassword: setCurrentPassword,
      onChangeNewPassword: setNewPassword,
      onChangePassword: changePassword,
      onLogout: logout,
      onDeleteUser: deleteUser,
    },
    message,
    loading,
  };
}
