import {KAKAO_JAVASCRIPT_KEY} from '../config/env.generated';
import {KAKAO_MAP_DOMAIN_ERROR} from '../constants';
import type {Restaurant} from '../types';
import {getRestaurantKey} from '../utils/restaurants';

export function createKakaoMapHtml(
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
