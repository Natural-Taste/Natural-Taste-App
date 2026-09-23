import type {Restaurant, UserLocation} from '../types';

const EARTH_RADIUS_METERS = 6371000;

export function getRestaurantKey(restaurant: Restaurant) {
  if (restaurant.provider && restaurant.providerPlaceId) {
    return `${restaurant.provider}:${restaurant.providerPlaceId}`;
  }

  return `id:${restaurant.id ?? restaurant.name}`;
}

export function findSavedRestaurant(
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
export function toSaveRestaurantBody(restaurant: Restaurant) {
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

export function formatRestaurantDistance(
  restaurant: Restaurant,
  userLocation: UserLocation | null,
) {
  if (
    !userLocation ||
    !isFiniteCoordinate(userLocation.latitude) ||
    !isFiniteCoordinate(userLocation.longitude) ||
    !isFiniteCoordinate(restaurant.latitude) ||
    !isFiniteCoordinate(restaurant.longitude)
  ) {
    return null;
  }

  const distanceMeters = getDistanceMeters(userLocation, {
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
  });

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function formatRestaurantReview(restaurant: Restaurant) {
  const parts = [];

  if (restaurant.rating) {
    parts.push(`평가 ${restaurant.rating}점`);
  }
  if (restaurant.tags) {
    parts.push(restaurant.tags);
  }
  if (restaurant.revisit !== null && restaurant.revisit !== undefined) {
    parts.push(restaurant.revisit ? '재방문 의사 있음' : '재방문 의사 없음');
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

function getDistanceMeters(from: UserLocation, to: UserLocation) {
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  return (
    EARTH_RADIUS_METERS *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function isFiniteCoordinate(value: number) {
  return Number.isFinite(value);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
