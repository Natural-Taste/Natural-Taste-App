import React, {useMemo, useState} from 'react';
import {Text, View} from 'react-native';
import WebView from 'react-native-webview';
import {KAKAO_JAVASCRIPT_KEY} from '../config/env.generated';
import {KAKAO_MAP_BASE_URL, KAKAO_MAP_DOMAIN_ERROR} from '../constants';
import {createKakaoMapHtml} from '../map/createKakaoMapHtml';
import {styles} from '../styles';
import type {Restaurant} from '../types';

export function MapPreview({
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
