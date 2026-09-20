import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import {KAKAO_JAVASCRIPT_KEY} from './src/config/env.generated';

type AuthMode = 'login' | 'signup';
type ActivePanel = 'map' | 'community' | 'mypage';

type AuthResponse = {
  userId: number;
  accessToken: string;
  tokenType: string;
};

type Restaurant = {
  id: number | null;
  provider?: string;
  providerPlaceId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
  phone?: string;
  placeUrl?: string;
  saved?: boolean;
};

type CommunityPost = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  restaurant: Restaurant;
  commentCount: number;
  recommendationCount: number;
  recommended: boolean;
  createdAt: string;
  updatedAt: string;
};

type CommunityComment = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
};

type Message = {
  tone: 'info' | 'error' | 'success';
  text: string;
};

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
const KAKAO_MAP_BASE_URL = 'https://localhost';
const KAKAO_MAP_DOMAIN_ERROR =
  '카카오 Developers > 앱 > 플랫폼 키 > JavaScript key > JavaScript SDK domain에 https://localhost를 등록해 주세요.';

const emptyMessage: Message = {
  tone: 'info',
  text: '백엔드가 꺼져 있어도 화면은 그대로 확인할 수 있습니다.',
};

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

function MapHome({
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
        onOpenMyPage={onOpenMyPage}
      />
    </View>
  );
}

function MapRestaurantSheet({
  title,
  emptyText,
  restaurants,
  savedIdSet,
  loading,
  onSelectRestaurant,
  onToggleSaved,
}: {
  title: string;
  emptyText: string;
  restaurants: Restaurant[];
  savedIdSet: Set<number>;
  loading: boolean;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
}) {
  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{title}</Text>
        <Text style={styles.sheetCount}>{restaurants.length}곳</Text>
      </View>
      {restaurants.length === 0 ? (
        <Text style={styles.sheetEmptyText}>{emptyText}</Text>
      ) : (
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetList}
          showsVerticalScrollIndicator={false}>
          {restaurants.map(restaurant => {
            const saved =
              restaurant.saved ||
              (restaurant.id !== null && savedIdSet.has(restaurant.id));

            return (
              <Pressable
                key={getRestaurantKey(restaurant)}
                style={({pressed}) => [
                  styles.sheetRestaurant,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => onSelectRestaurant(restaurant)}>
                <View style={styles.restaurantTextGroup}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
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
                    loading ? styles.disabled : null,
                  ]}
                  onPress={() => onToggleSaved(restaurant)}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.sheetSaveButtonText,
                      saved ? styles.sheetSaveButtonActiveText : null,
                    ]}>
                    {saved ? '저장됨' : '저장'}
                  </Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
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
  onOpenMyPage,
}: {
  activePanel: ActivePanel;
  loading: boolean;
  onOpenMap: () => void;
  onOpenCommunity: () => void;
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

function CommunitySheet({
  posts,
  selectedPost,
  draftRestaurant,
  writing,
  placeQuery,
  placeResults,
  title,
  content,
  imageUrl,
  comments,
  commentContent,
  savedRestaurants,
  loading,
  onSelectPost,
  onSaveRestaurant,
  onToggleRecommendation,
  onStartPost,
  onCancelPost,
  onSearchPlaces,
  onSelectPlace,
  onCreatePost,
  onChangePlaceQuery,
  onChangeTitle,
  onChangeContent,
  onChangeImageUrl,
  onCreateComment,
  onChangeCommentContent,
  onClose,
  showHandle = true,
}: {
  posts: CommunityPost[];
  selectedPost: CommunityPost | null;
  draftRestaurant: Restaurant | null;
  writing: boolean;
  placeQuery: string;
  placeResults: Restaurant[];
  title: string;
  content: string;
  imageUrl: string;
  comments: CommunityComment[];
  commentContent: string;
  savedRestaurants: Restaurant[];
  loading: boolean;
  onSelectPost: (post: CommunityPost) => void;
  onSaveRestaurant: (post: CommunityPost) => void;
  onToggleRecommendation: (post: CommunityPost) => void;
  onStartPost: () => void;
  onCancelPost: () => void;
  onSearchPlaces: () => void;
  onSelectPlace: (restaurant: Restaurant) => void;
  onCreatePost: () => void;
  onChangePlaceQuery: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeImageUrl: (value: string) => void;
  onCreateComment: () => void;
  onChangeCommentContent: (value: string) => void;
  onClose: () => void;
  showHandle?: boolean;
}) {
  if (writing) {
    return (
      <ScrollView
        style={styles.communityWriteScroll}
        contentContainerStyle={styles.communityWriteContent}
        showsVerticalScrollIndicator>
        <View>
          {showHandle ? <View style={styles.sheetHandle} /> : null}
          <View style={styles.detailTopRow}>
            <View style={styles.restaurantTextGroup}>
              <Text style={styles.sheetTitle}>게시글 작성</Text>
              <Text style={styles.restaurantMeta}>
                장소를 선택하고 후기를 남겨주세요.
              </Text>
            </View>
            <Pressable
              style={({pressed}) => [
                styles.closeButton,
                pressed ? styles.pressed : null,
              ]}
              onPress={onCancelPost}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>
          <Field label="장소">
            <View style={styles.inlineSearchRow}>
              <TextInput
                style={[styles.input, styles.inlineSearchInput]}
                placeholder="장소명, 지역, 음식 검색"
                value={placeQuery}
                onChangeText={onChangePlaceQuery}
                returnKeyType="search"
                onSubmitEditing={onSearchPlaces}
              />
              <Pressable
                style={({pressed}) => [
                  styles.inlineSearchButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={onSearchPlaces}
                disabled={loading}>
                <Text style={styles.inlineSearchButtonText}>검색</Text>
              </Pressable>
            </View>
          </Field>
          {draftRestaurant ? (
            <View style={styles.selectedPlaceBox}>
              <Text style={styles.restaurantName}>{draftRestaurant.name}</Text>
              <Text style={styles.restaurantMeta} numberOfLines={1}>
                {draftRestaurant.category || '카테고리 미정'}
              </Text>
              <Text style={styles.restaurantAddress} numberOfLines={1}>
                {draftRestaurant.address}
              </Text>
            </View>
          ) : null}
          <View style={styles.savedPlaceSection}>
            <Text style={styles.savedPlaceTitle}>내 맛집 리스트</Text>
            {savedRestaurants.length > 0 ? (
              <ScrollView
                style={styles.savedPlaceScroll}
                contentContainerStyle={styles.savedPlaceList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={savedRestaurants.length > 3}>
                {savedRestaurants.map(restaurant => {
                  const selected =
                    draftRestaurant &&
                    getRestaurantKey(draftRestaurant) === getRestaurantKey(restaurant);

                  return (
                    <Pressable
                      key={getRestaurantKey(restaurant)}
                      style={({pressed}) => [
                        styles.placeResultItem,
                        selected ? styles.placeResultItemActive : null,
                        pressed ? styles.pressed : null,
                      ]}
                      onPress={() => onSelectPlace(restaurant)}>
                      <View style={styles.restaurantTextGroup}>
                        <Text style={styles.restaurantName} numberOfLines={1}>
                          {restaurant.name}
                        </Text>
                        <Text style={styles.restaurantAddress} numberOfLines={1}>
                          {restaurant.address}
                        </Text>
                      </View>
                      <Text style={styles.placeSelectText}>
                        {selected ? '선택됨' : '선택'}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.savedPlaceEmpty}>
                저장한 맛집이 없으면 장소를 검색해 선택해 주세요.
              </Text>
            )}
          </View>
          {placeResults.length > 0 ? (
            <View style={styles.placeResultList}>
              {placeResults.map(restaurant => {
                const selected =
                  draftRestaurant &&
                  getRestaurantKey(draftRestaurant) === getRestaurantKey(restaurant);

                return (
                  <Pressable
                    key={getRestaurantKey(restaurant)}
                    style={({pressed}) => [
                      styles.placeResultItem,
                      selected ? styles.placeResultItemActive : null,
                      pressed ? styles.pressed : null,
                    ]}
                    onPress={() => onSelectPlace(restaurant)}>
                    <View style={styles.restaurantTextGroup}>
                      <Text style={styles.restaurantName} numberOfLines={1}>
                        {restaurant.name}
                      </Text>
                      <Text style={styles.restaurantAddress} numberOfLines={1}>
                        {restaurant.address}
                      </Text>
                    </View>
                    <Text style={styles.placeSelectText}>
                      {selected ? '선택됨' : '선택'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <Field label="제목">
            <TextInput
              style={styles.input}
              placeholder="게시글 제목"
              value={title}
              onChangeText={onChangeTitle}
            />
          </Field>
          <Field label="사진 URL">
            <TextInput
              style={styles.input}
              placeholder="https://example.com/photo.jpg"
              value={imageUrl}
              onChangeText={onChangeImageUrl}
              autoCapitalize="none"
            />
          </Field>
          <Field label="내용">
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="맛집을 추천하는 이유"
              value={content}
              onChangeText={onChangeContent}
              multiline
            />
          </Field>
          <PrimaryButton
            label="게시글 작성"
            onPress={onCreatePost}
            disabled={loading}
          />
        </View>
      </ScrollView>
    );
  }

  if (selectedPost) {
    const saved = Boolean(findSavedRestaurant(selectedPost.restaurant, savedRestaurants));

    return (
      <ScrollView
        style={styles.communityWriteScroll}
        contentContainerStyle={styles.communityWriteContent}
        showsVerticalScrollIndicator>
        <View>
          {showHandle ? <View style={styles.sheetHandle} /> : null}
          <View style={styles.detailTopRow}>
            <View style={styles.restaurantTextGroup}>
              <Text style={styles.detailName}>{selectedPost.title}</Text>
              <Text style={styles.restaurantMeta}>
                작성자 {selectedPost.authorId} · {formatDate(selectedPost.createdAt)}
              </Text>
            </View>
            <Pressable
              style={({pressed}) => [
                styles.closeButton,
                pressed ? styles.pressed : null,
              ]}
              onPress={onClose}>
              <Text style={styles.closeButtonText}>목록</Text>
            </Pressable>
          </View>
          {selectedPost.imageUrl ? (
            <Image
              source={{uri: selectedPost.imageUrl}}
              style={styles.postImage}
              resizeMode="cover"
            />
          ) : null}
          <Text style={styles.postContent}>{selectedPost.content}</Text>
          <View style={styles.postRestaurantBox}>
            <Text style={styles.restaurantName}>{selectedPost.restaurant.name}</Text>
            <Text style={styles.restaurantMeta}>
              {selectedPost.restaurant.category || '카테고리 미정'}
            </Text>
            <Text style={styles.restaurantAddress}>
              {selectedPost.restaurant.address}
            </Text>
          </View>
          <View style={styles.postActionRow}>
            <Pressable
              style={({pressed}) => [
                styles.recommendButton,
                selectedPost.recommended ? styles.recommendButtonActive : null,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={() => onToggleRecommendation(selectedPost)}
              disabled={loading}>
              <Text
                style={[
                  styles.recommendButtonText,
                  selectedPost.recommended ? styles.recommendButtonActiveText : null,
                ]}>
                추천 {selectedPost.recommendationCount}
              </Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.recommendButton,
                saved ? styles.recommendButtonActive : null,
                pressed ? styles.pressed : null,
                loading || saved ? styles.disabled : null,
              ]}
              onPress={() => onSaveRestaurant(selectedPost)}
              disabled={loading || saved}>
              <Text
                style={[
                  styles.recommendButtonText,
                  saved ? styles.recommendButtonActiveText : null,
                ]}>
                {saved ? '저장됨' : '장소 저장'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.commentSection}>
            <Text style={styles.savedPlaceTitle}>댓글 {selectedPost.commentCount}</Text>
            {comments.length > 0 ? (
              <View style={styles.commentList}>
                {comments.map(comment => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Text style={styles.restaurantMeta}>
                      작성자 {comment.authorId} · {formatDate(comment.createdAt)}
                    </Text>
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.savedPlaceEmpty}>아직 댓글이 없습니다.</Text>
            )}
            <View style={styles.commentInputRow}>
              <TextInput
                style={[styles.input, styles.commentInput]}
                placeholder="댓글 작성"
                value={commentContent}
                onChangeText={onChangeCommentContent}
              />
              <Pressable
                style={({pressed}) => [
                  styles.inlineSearchButton,
                  pressed ? styles.pressed : null,
                  loading ? styles.disabled : null,
                ]}
                onPress={onCreateComment}
                disabled={loading}>
                <Text style={styles.inlineSearchButtonText}>등록</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View>
      {showHandle ? <View style={styles.sheetHandle} /> : null}
      <View style={styles.sheetHeader}>
        <View>
          <Text style={styles.sheetTitle}>커뮤니티</Text>
          <Text style={styles.sheetCount}>{posts.length}개</Text>
        </View>
        <Pressable
          style={({pressed}) => [
            styles.writeButton,
            pressed ? styles.pressed : null,
            loading ? styles.disabled : null,
          ]}
          onPress={onStartPost}
          disabled={loading}>
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </Pressable>
      </View>
      {posts.length === 0 ? (
        <Text style={styles.sheetEmptyText}>
          글쓰기를 눌러 장소에 대한 후기를 남겨보세요.
        </Text>
      ) : (
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetList}
          showsVerticalScrollIndicator={false}>
          {posts.map(post => {
            const saved = Boolean(findSavedRestaurant(post.restaurant, savedRestaurants));

            return (
              <Pressable
                key={post.id}
                style={({pressed}) => [
                  styles.communityPost,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => onSelectPost(post)}>
                <View style={styles.restaurantTextGroup}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {post.title}
                  </Text>
                  <Text style={styles.restaurantMeta} numberOfLines={1}>
                    {post.restaurant.name}
                  </Text>
                  <Text style={styles.restaurantAddress} numberOfLines={1}>
                    {post.restaurant.address}
                  </Text>
                  <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                  <Text style={styles.postDate}>
                    추천 {post.recommendationCount} · 댓글 {post.commentCount}
                  </Text>
                </View>
                <Pressable
                  style={({pressed}) => [
                    styles.sheetSaveButton,
                    saved ? styles.sheetSaveButtonActive : null,
                    pressed ? styles.pressed : null,
                    loading || saved ? styles.disabled : null,
                  ]}
                  onPress={() => onSaveRestaurant(post)}
                  disabled={loading || saved}>
                  <Text
                    style={[
                      styles.sheetSaveButtonText,
                      saved ? styles.sheetSaveButtonActiveText : null,
                    ]}>
                    {saved ? '저장됨' : '저장'}
                  </Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

function MapRestaurantDetail({
  restaurant,
  saved,
  loading,
  onToggleSaved,
  onClose,
}: {
  restaurant: Restaurant;
  saved: boolean;
  loading: boolean;
  onToggleSaved: (restaurant: Restaurant) => void;
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.detailTopRow}>
        <View style={styles.restaurantTextGroup}>
          <Text style={styles.detailName}>{restaurant.name}</Text>
          <Text style={styles.restaurantMeta}>
            {restaurant.category || '카테고리 미정'}
          </Text>
        </View>
        <Pressable
          style={({pressed}) => [
            styles.closeButton,
            pressed ? styles.pressed : null,
          ]}
          onPress={onClose}>
          <Text style={styles.closeButtonText}>닫기</Text>
        </Pressable>
      </View>
      <Text style={styles.detailLine}>{restaurant.address}</Text>
      {restaurant.phone ? (
        <Text style={styles.detailLine}>전화 {restaurant.phone}</Text>
      ) : null}
      {restaurant.placeUrl ? (
        <Text style={styles.detailLine}>장소 URL {restaurant.placeUrl}</Text>
      ) : null}
      <PrimaryButton
        label={saved ? '저장 취소' : '맛집 저장'}
        onPress={() => onToggleSaved(restaurant)}
        disabled={loading}
      />
    </View>
  );
}

function MapAccountSheet({
  userId,
  currentPassword,
  newPassword,
  loading,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangePassword,
  onLogout,
  onDeleteUser,
  onClose,
  showHandle = true,
}: {
  userId: number;
  currentPassword: string;
  newPassword: string;
  loading: boolean;
  onChangeCurrentPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onDeleteUser: () => void;
  onClose?: () => void;
  showHandle?: boolean;
}) {
  return (
    <View>
      {showHandle ? <View style={styles.sheetHandle} /> : null}
      <View style={styles.detailTopRow}>
        <View style={styles.restaurantTextGroup}>
          <Text style={styles.sheetTitle}>회원 정보</Text>
          <Text style={styles.restaurantMeta}>회원 번호 {userId}</Text>
        </View>
        {onClose ? (
          <Pressable
            style={({pressed}) => [
              styles.closeButton,
              pressed ? styles.pressed : null,
            ]}
            onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        ) : null}
      </View>
      <Field label="현재 비밀번호">
        <TextInput
          style={styles.input}
          placeholder="현재 비밀번호"
          value={currentPassword}
          onChangeText={onChangeCurrentPassword}
          secureTextEntry
        />
      </Field>
      <Field label="새 비밀번호">
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호"
          value={newPassword}
          onChangeText={onChangeNewPassword}
          secureTextEntry
        />
      </Field>
      <View style={styles.accountActionGrid}>
        <PrimaryButton
          label="비밀번호 수정"
          onPress={onChangePassword}
          disabled={loading}
        />
        <View style={styles.accountSecondaryRow}>
          <Pressable
            style={({pressed}) => [
              styles.accountSecondaryButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={onLogout}
            disabled={loading}>
            <Text style={styles.accountSecondaryButtonText}>로그아웃</Text>
          </Pressable>
          <Pressable
            style={({pressed}) => [
              styles.accountDangerButton,
              pressed ? styles.pressed : null,
              loading ? styles.disabled : null,
            ]}
            onPress={onDeleteUser}
            disabled={loading}>
            <Text style={styles.accountDangerButtonText}>회원탈퇴</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AuthPanel({
  mode,
  email,
  password,
  name,
  loading,
  onChangeMode,
  onChangeEmail,
  onChangePassword,
  onChangeName,
  onSubmit,
}: {
  mode: AuthMode;
  email: string;
  password: string;
  name: string;
  loading: boolean;
  onChangeMode: (mode: AuthMode) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeName: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.segmentedControl}>
        <TabButton
          label="로그인"
          active={mode === 'login'}
          onPress={() => onChangeMode('login')}
        />
        <TabButton
          label="회원가입"
          active={mode === 'signup'}
          onPress={() => onChangeMode('signup')}
        />
      </View>
      {mode === 'signup' ? (
        <Field label="이름">
          <TextInput
            style={styles.input}
            placeholder="이름"
            value={name}
            onChangeText={onChangeName}
          />
        </Field>
      ) : null}
      <Field label="이메일">
        <TextInput
          style={styles.input}
          placeholder="foodmap@example.com"
          value={email}
          onChangeText={onChangeEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </Field>
      <Field label="비밀번호">
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={onChangePassword}
          secureTextEntry
        />
      </Field>
      <PrimaryButton
        label={mode === 'login' ? '로그인' : '회원가입'}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  );
}

function MapPreview({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}: {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}) {
  const [mapError, setMapError] = useState('');
  const mapHtml = useMemo(
    () => createKakaoMapHtml(restaurants, selectedRestaurant),
    [restaurants, selectedRestaurant],
  );

  return (
    <View style={styles.mapCard}>
      <View style={styles.mapCanvas}>
        {!KAKAO_JAVASCRIPT_KEY ? (
          <Text style={styles.emptyText}>App/.env에 KAKAO_JAVASCRIPT_KEY를 넣어주세요.</Text>
        ) : mapError ? (
          <Text style={styles.emptyText}>{mapError}</Text>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{html: mapHtml, baseUrl: KAKAO_MAP_BASE_URL}}
            javaScriptEnabled
            domStorageEnabled
            scrollEnabled={false}
            containerStyle={styles.mapWebView}
            style={styles.mapWebViewContent}
            onLoadStart={() => setMapError('')}
            onError={() =>
              setMapError('카카오 지도 WebView를 불러오지 못했습니다.')
            }
            onHttpError={() =>
              setMapError(KAKAO_MAP_DOMAIN_ERROR)
            }
            onMessage={event => {
              if (event.nativeEvent.data.startsWith('error:')) {
                setMapError(event.nativeEvent.data.replace('error:', ''));
                return;
              }

              const index = Number(event.nativeEvent.data);
              const restaurant = restaurants[index];
              if (restaurant) {
                onSelectRestaurant(restaurant);
              }
            }}
          />
        )}
      </View>
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function MessageBox({message, loading}: {message: Message; loading: boolean}) {
  return (
    <View
      style={[
        styles.messageBox,
        message.tone === 'error' ? styles.messageError : null,
        message.tone === 'success' ? styles.messageSuccess : null,
      ]}>
      {loading ? <ActivityIndicator color="#49624A" /> : null}
      <Text style={styles.messageText}>{message.text}</Text>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.tabButton,
        active ? styles.tabButtonActive : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}>
      <Text style={[styles.tabButtonText, active ? styles.tabButtonTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.primaryButton,
        pressed ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

async function request<T = void>(
  path: string,
  options: {
    method?: string;
    auth?: AuthResponse;
    body?: Record<string, unknown>;
  } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.auth
        ? {Authorization: `${options.auth.tokenType} ${options.auth.accessToken}`}
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`요청 실패 (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof TypeError) {
    return `${fallback} 백엔드 연결을 확인해 주세요.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getRestaurantKey(restaurant: Restaurant) {
  if (restaurant.provider && restaurant.providerPlaceId) {
    return `${restaurant.provider}:${restaurant.providerPlaceId}`;
  }

  return `id:${restaurant.id ?? restaurant.name}`;
}

function findSavedRestaurant(
  restaurant: Restaurant,
  savedRestaurants: Restaurant[],
) {
  const restaurantKey = getRestaurantKey(restaurant);

  return savedRestaurants.find(savedRestaurant => {
    if (
      restaurant.id !== null &&
      savedRestaurant.id !== null &&
      restaurant.id === savedRestaurant.id
    ) {
      return true;
    }

    return getRestaurantKey(savedRestaurant) === restaurantKey;
  });
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

function toSaveRestaurantBody(restaurant: Restaurant) {
  return {
    provider: restaurant.provider ?? 'KAKAO',
    providerPlaceId: restaurant.providerPlaceId ?? String(restaurant.id),
    name: restaurant.name,
    address: restaurant.address,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    category: restaurant.category,
    phone: restaurant.phone,
    placeUrl: restaurant.placeUrl,
  };
}

function createKakaoMapHtml(
  restaurants: Restaurant[],
  selectedRestaurant: Restaurant | null,
) {
  const markers = restaurants.slice(0, 30).map((restaurant, index) => ({
    index,
    name: restaurant.name,
    address: restaurant.address,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    selected: selectedRestaurant
      ? getRestaurantKey(restaurant) === getRestaurantKey(selectedRestaurant)
      : index === 0,
  }));
  const firstRestaurant = selectedRestaurant ?? restaurants[0];
  const latitude = firstRestaurant?.latitude ?? 37.5665;
  const longitude = firstRestaurant?.longitude ?? 126.978;

  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>
      html, body, #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      .label {
        min-width: 28px;
        height: 28px;
        padding: 0 8px;
        border: 2px solid #fff;
        border-radius: 16px;
        background: #49624A;
        color: #fff;
        font: 800 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 28px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
        transform: translate(-50%, -100%);
        white-space: nowrap;
      }
      .label.selected {
        background: #23251F;
      }
      .message {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #505449;
        background: #DDE7D7;
        font: 700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.5;
        text-align: center;
      }
    </style>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${escapeHtml(KAKAO_JAVASCRIPT_KEY)}&autoload=false"></script>
  </head>
  <body>
    <div id="map"><div class="message">카카오 지도를 불러오는 중입니다.</div></div>
    <script>
      const markers = ${JSON.stringify(markers)};
      let loaded = false;

      function showError(message) {
        document.getElementById('map').innerHTML = '<div class="message">' + message + '</div>';
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('error:' + message);
        }
      }

      if (!window.kakao || !window.kakao.maps) {
        showError('${KAKAO_MAP_DOMAIN_ERROR}');
      } else {
        setTimeout(function () {
          if (!loaded) {
            showError('${KAKAO_MAP_DOMAIN_ERROR}');
          }
        }, 4000);

        kakao.maps.load(function () {
          try {
            loaded = true;
            const center = new kakao.maps.LatLng(${latitude}, ${longitude});
            const map = new kakao.maps.Map(document.getElementById('map'), {
              center,
              level: 4
            });
            const bounds = new kakao.maps.LatLngBounds();

            markers.forEach(function (item) {
              const position = new kakao.maps.LatLng(item.latitude, item.longitude);
              bounds.extend(position);

              const element = document.createElement('button');
              element.className = 'label' + (item.selected ? ' selected' : '');
              element.type = 'button';
              element.textContent = String(item.index + 1);
              element.onclick = function () {
                window.ReactNativeWebView.postMessage(String(item.index));
              };

              new kakao.maps.CustomOverlay({
                position,
                content: element,
                yAnchor: 1
              }).setMap(map);
            });

            if (markers.length > 1) {
              map.setBounds(bounds);
            }
          } catch (error) {
            showError('${KAKAO_MAP_DOMAIN_ERROR}');
          }
        });
      }
    </script>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3EA',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 18,
    paddingTop: 24,
  },
  eyebrow: {
    color: '#49624A',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  title: {
    color: '#23251F',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 8,
  },
  description: {
    color: '#676B5E',
    fontSize: 16,
    lineHeight: 23,
  },
  screenStack: {
    gap: 14,
  },
  mapHome: {
    backgroundColor: '#F5F3EA',
    flex: 1,
  },
  tabScreen: {
    backgroundColor: '#F5F3EA',
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 58 : 28,
    paddingBottom: Platform.OS === 'ios' ? 104 : 92,
  },
  tabScreenHeader: {
    marginBottom: 14,
  },
  tabScreenTitle: {
    color: '#23251F',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 12,
  },
  mapTopPanel: {
    left: 16,
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 58 : 28,
  },
  mapBrandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mapEyebrow: {
    color: '#49624A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  mapTitle: {
    color: '#23251F',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
  },
  mapSearchBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    shadowColor: '#3B3528',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  mapSearchInput: {
    color: '#23251F',
    flex: 1,
    fontSize: 16,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  mapSearchButton: {
    alignItems: 'center',
    backgroundColor: '#23251F',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 16,
  },
  mapSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  mapStatus: {
    alignItems: 'center',
    backgroundColor: 'rgba(236, 231, 217, 0.94)',
    borderColor: '#DDD6C4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mapStatusText: {
    color: '#3F4438',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E0D5',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 26 : 18,
    position: 'absolute',
    right: 0,
    shadowColor: '#3B3528',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.12,
    shadowRadius: 26,
  },
  bottomSheetAboveTabs: {
    bottom: Platform.OS === 'ios' ? 88 : 76,
  },
  bottomTabBar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E0D5',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    left: 0,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    position: 'absolute',
    right: 0,
    shadowColor: '#3B3528',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.08,
    shadowRadius: 18,
  },
  bottomTabButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 8,
  },
  bottomTabButtonActive: {
    backgroundColor: '#EEF4EC',
  },
  bottomTabIndicator: {
    backgroundColor: 'transparent',
    borderRadius: 2,
    height: 3,
    width: 24,
  },
  bottomTabIndicatorActive: {
    backgroundColor: '#49624A',
  },
  bottomTabButtonText: {
    color: '#676B5E',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomTabButtonTextActive: {
    color: '#23251F',
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#D8D2C2',
    borderRadius: 2,
    height: 4,
    marginBottom: 14,
    width: 42,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    color: '#23251F',
    fontSize: 20,
    fontWeight: '900',
  },
  sheetCount: {
    color: '#49624A',
    fontSize: 13,
    fontWeight: '800',
  },
  sheetScroll: {
    maxHeight: 260,
  },
  sheetList: {
    gap: 10,
    paddingBottom: 4,
  },
  sheetRestaurant: {
    alignItems: 'center',
    backgroundColor: '#FCFBF7',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  communityPost: {
    alignItems: 'center',
    backgroundColor: '#FCFBF7',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  communityWriteScroll: {
    maxHeight: '100%',
  },
  communityWriteContent: {
    paddingBottom: 36,
  },
  inlineSearchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  inlineSearchInput: {
    flex: 1,
  },
  inlineSearchButton: {
    alignItems: 'center',
    backgroundColor: '#23251F',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inlineSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  selectedPlaceBox: {
    backgroundColor: '#EEF4EC',
    borderColor: '#C8D7C3',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    marginBottom: 14,
    padding: 12,
  },
  savedPlaceSection: {
    marginBottom: 14,
  },
  savedPlaceTitle: {
    color: '#505449',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  savedPlaceList: {
    gap: 10,
  },
  savedPlaceScroll: {
    maxHeight: 260,
  },
  savedPlaceEmpty: {
    color: '#777B6E',
    fontSize: 13,
    lineHeight: 19,
  },
  placeResultList: {
    gap: 10,
    marginBottom: 14,
  },
  placeResultItem: {
    alignItems: 'center',
    backgroundColor: '#FCFBF7',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  placeResultItemActive: {
    borderColor: '#49624A',
  },
  placeSelectText: {
    color: '#49624A',
    fontSize: 12,
    fontWeight: '900',
  },
  writeButton: {
    alignItems: 'center',
    backgroundColor: '#49624A',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 14,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  sheetSaveButton: {
    alignItems: 'center',
    borderColor: '#C9C2B0',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  sheetSaveButtonActive: {
    backgroundColor: '#49624A',
    borderColor: '#49624A',
  },
  sheetSaveButtonText: {
    color: '#49624A',
    fontSize: 12,
    fontWeight: '900',
  },
  sheetSaveButtonActiveText: {
    color: '#FFFFFF',
  },
  sheetEmptyText: {
    color: '#777B6E',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 22,
    textAlign: 'center',
  },
  detailTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    borderColor: '#C9C2B0',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  closeButtonText: {
    color: '#505449',
    fontSize: 12,
    fontWeight: '900',
  },
  accountActionGrid: {
    gap: 10,
    marginTop: 4,
  },
  accountSecondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  accountSecondaryButton: {
    alignItems: 'center',
    borderColor: '#C9C2B0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  accountSecondaryButtonText: {
    color: '#49624A',
    fontSize: 14,
    fontWeight: '900',
  },
  accountDangerButton: {
    alignItems: 'center',
    borderColor: '#D9A09A',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  accountDangerButtonText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#3B3528',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  sectionTitle: {
    color: '#23251F',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 14,
  },
  field: {
    gap: 7,
    marginBottom: 14,
  },
  label: {
    color: '#505449',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FCFBF7',
    borderColor: '#D8D2C2',
    borderRadius: 8,
    borderWidth: 1,
    color: '#23251F',
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  contentInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  segmentedControl: {
    backgroundColor: '#F1EDE2',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 7,
    flex: 1,
    paddingVertical: 11,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    color: '#676B5E',
    fontSize: 15,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#23251F',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#49624A',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#C9C2B0',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryButtonActive: {
    backgroundColor: '#49624A',
    borderColor: '#49624A',
  },
  secondaryButtonText: {
    color: '#49624A',
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryButtonActiveText: {
    color: '#FFFFFF',
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: '#C9C2B0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  secondaryActionDanger: {
    borderColor: '#D9A09A',
  },
  secondaryActionText: {
    color: '#49624A',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionDangerText: {
    color: '#B42318',
  },
  actionRow: {
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    alignItems: 'center',
    backgroundColor: '#23251F',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  messageBox: {
    alignItems: 'center',
    backgroundColor: '#ECE7D9',
    borderColor: '#DDD6C4',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    padding: 13,
  },
  messageError: {
    backgroundColor: '#FEF3F2',
    borderColor: '#F5C5C0',
  },
  messageSuccess: {
    backgroundColor: '#EEF4EC',
    borderColor: '#C8D7C3',
  },
  messageText: {
    color: '#3F4438',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  mapCard: {
    backgroundColor: '#DDE7D7',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mapHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  mapHint: {
    color: '#777B6E',
    fontSize: 13,
    marginBottom: 14,
  },
  mapCanvas: {
    alignItems: 'center',
    backgroundColor: '#DDE7D7',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  mapWebView: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mapWebViewContent: {
    flex: 1,
  },
  listStack: {
    gap: 10,
  },
  restaurantItem: {
    alignItems: 'center',
    backgroundColor: '#FCFBF7',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 13,
  },
  restaurantItemActive: {
    borderColor: '#49624A',
  },
  restaurantTextGroup: {
    flex: 1,
    gap: 4,
  },
  restaurantName: {
    color: '#23251F',
    fontSize: 16,
    fontWeight: '800',
  },
  restaurantMeta: {
    color: '#49624A',
    fontSize: 13,
    fontWeight: '700',
  },
  restaurantAddress: {
    color: '#676B5E',
    fontSize: 13,
    lineHeight: 18,
  },
  postDate: {
    color: '#8A877C',
    fontSize: 12,
    fontWeight: '700',
  },
  detailName: {
    color: '#23251F',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  detailLine: {
    color: '#505449',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
  postContent: {
    color: '#3F4438',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  postImage: {
    backgroundColor: '#EEF4EC',
    borderRadius: 8,
    height: 180,
    marginBottom: 14,
    width: '100%',
  },
  postRestaurantBox: {
    backgroundColor: '#FCFBF7',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    marginBottom: 12,
    padding: 12,
  },
  postActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  recommendButton: {
    alignItems: 'center',
    borderColor: '#C9C2B0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  recommendButtonActive: {
    backgroundColor: '#49624A',
    borderColor: '#49624A',
  },
  recommendButtonText: {
    color: '#49624A',
    fontSize: 14,
    fontWeight: '900',
  },
  recommendButtonActiveText: {
    color: '#FFFFFF',
  },
  commentSection: {
    borderTopColor: '#E4E0D5',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  commentList: {
    gap: 10,
    marginBottom: 12,
  },
  commentItem: {
    backgroundColor: '#FCFBF7',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 10,
  },
  commentContent: {
    color: '#3F4438',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  commentInput: {
    flex: 1,
  },
  accountText: {
    color: '#505449',
    fontSize: 15,
    marginBottom: 16,
  },
  emptyText: {
    color: '#777B6E',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.76,
    transform: [{scale: 0.99}],
  },
  disabled: {
    opacity: 0.5,
  },
});

export default App;
