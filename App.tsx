import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
  const [accountOpen, setAccountOpen] = useState(false);
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
      setAccountOpen(false);
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
      setAccountOpen(false);
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
      setAccountOpen(false);
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
      setRestaurants(current =>
        current.map(item =>
          getRestaurantKey(item) === getRestaurantKey(saved)
            ? {...item, id: saved.id, saved: true}
            : item,
        ),
      );
      setSelectedRestaurant(current =>
        current && getRestaurantKey(current) === getRestaurantKey(saved)
          ? {...current, id: saved.id, saved: true}
          : current,
      );
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
          savedIdSet={savedIdSet}
          accountOpen={accountOpen}
          userId={auth.userId}
          currentPassword={currentPassword}
          newPassword={newPassword}
          onChangeQuery={setQuery}
          onSearch={searchRestaurants}
          onSelectRestaurant={setSelectedRestaurant}
          onToggleSaved={toggleSaved}
          onCloseDetail={() => setSelectedRestaurant(null)}
          onOpenAccount={() => {
            setSelectedRestaurant(null);
            setAccountOpen(true);
          }}
          onCloseAccount={() => setAccountOpen(false)}
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
  savedIdSet,
  accountOpen,
  userId,
  currentPassword,
  newPassword,
  onChangeQuery,
  onSearch,
  onSelectRestaurant,
  onToggleSaved,
  onCloseDetail,
  onOpenAccount,
  onCloseAccount,
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
  savedIdSet: Set<number>;
  accountOpen: boolean;
  userId: number;
  currentPassword: string;
  newPassword: string;
  onChangeQuery: (value: string) => void;
  onSearch: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleSaved: (restaurant: Restaurant) => void;
  onCloseDetail: () => void;
  onOpenAccount: () => void;
  onCloseAccount: () => void;
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
          <View style={styles.mapHeaderActions}>
            <Pressable
              style={({pressed}) => [
                styles.logoutButton,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={onOpenAccount}
              disabled={loading}>
              <Text style={styles.logoutButtonText}>계정</Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.logoutButton,
                pressed ? styles.pressed : null,
                loading ? styles.disabled : null,
              ]}
              onPress={onLogout}
              disabled={loading}>
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </Pressable>
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

      <View style={[styles.bottomSheet, {maxHeight: Math.max(230, height * 0.42)}]}>
        {accountOpen ? (
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
            onClose={onCloseAccount}
          />
        ) : selectedRestaurant ? (
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
  onClose: () => void;
}) {
  return (
    <View>
      <View style={styles.sheetHandle} />
      <View style={styles.detailTopRow}>
        <View style={styles.restaurantTextGroup}>
          <Text style={styles.sheetTitle}>회원 정보</Text>
          <Text style={styles.restaurantMeta}>회원 번호 {userId}</Text>
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
  mapHeaderActions: {
    flexDirection: 'row',
    gap: 8,
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
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: '#E4E0D5',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  logoutButtonText: {
    color: '#505449',
    fontSize: 12,
    fontWeight: '800',
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
