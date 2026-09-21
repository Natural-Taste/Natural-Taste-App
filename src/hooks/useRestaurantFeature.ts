import {useMemo, useState} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {request, getErrorMessage} from '../api/client';
import type {AuthResponse, Message, Restaurant, UserLocation} from '../types';
import {findSavedRestaurant, getRestaurantKey, toSaveRestaurantBody} from '../utils/restaurants';

type UseRestaurantFeatureParams = {
  auth: AuthResponse | null;
  setLoading: (loading: boolean) => void;
  setMessage: (message: Message) => void;
};

export function useRestaurantFeature({auth, setLoading, setMessage}: UseRestaurantFeatureParams) {
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantMemo, setRestaurantMemo] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

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

  const resetRestaurants = () => {
    setRestaurants([]);
    setSavedRestaurants([]);
    setSelectedRestaurant(null);
    setRestaurantMemo('');
    setUserLocation(null);
  };

  const loadUserLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setMessage({tone: 'error', text: '위치 권한이 필요합니다.'});
        return;
      }
    }

    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setMessage({tone: 'success', text: '현재 위치를 확인했습니다.'});
        setLoading(false);
      },
      () => {
        setMessage({tone: 'error', text: '현재 위치를 확인할 수 없습니다.'});
        setLoading(false);
      },
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 60000},
    );
  };

  const searchRestaurants = async () => {
    if (!auth || !query.trim()) {
      setMessage({tone: 'error', text: '검색어를 입력해 주세요.'});
      return;
    }

    setLoading(true);
    setMessage({tone: 'info', text: '맛집을 검색하는 중입니다.'});

    try {
      const params = new URLSearchParams({query: query.trim()});
      if (userLocation) {
        params.set('x', String(userLocation.longitude));
        params.set('y', String(userLocation.latitude));
      }
      const data = await request<Restaurant[]>(
        `/restaurants/search?${params.toString()}`,
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
        setRestaurantMemo('');
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

  const updateSavedRestaurantMemo = async (restaurant: Restaurant) => {
    if (!auth || restaurant.id === null) {
      return;
    }

    setLoading(true);
    try {
      const updated = await request<Restaurant>(
        `/restaurants/saved/${restaurant.id}/memo`,
        {
          method: 'PATCH',
          auth,
          body: {memo: restaurantMemo.trim() || null},
        },
      );
      setSavedRestaurants(current =>
        current.map(item =>
          item.id === updated.id ? {...item, memo: updated.memo} : item,
        ),
      );
      setRestaurants(current =>
        current.map(item =>
          item.id === updated.id ? {...item, memo: updated.memo, saved: true} : item,
        ),
      );
      setSelectedRestaurant(current =>
        current?.id === updated.id ? {...current, memo: updated.memo, saved: true} : current,
      );
      setRestaurantMemo(updated.memo ?? '');
      setMessage({tone: 'success', text: '맛집 메모를 저장했습니다.'});
    } catch (error) {
      setMessage({
        tone: 'error',
        text: getErrorMessage(error, '맛집 메모 저장에 실패했습니다.'),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    restaurants,
    savedRestaurants,
    selectedRestaurant,
    restaurantMemo,
    userLocation,
    savedIdSet,
    visibleRestaurants,
    setQuery,
    setRestaurants,
    setSavedRestaurants,
    setSelectedRestaurant,
    setRestaurantMemo,
    resetRestaurants,
    loadUserLocation,
    searchRestaurants,
    loadSavedRestaurants,
    toggleSaved,
    updateSavedRestaurantMemo,
  };
}
