import type {Restaurant} from '../types';

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
