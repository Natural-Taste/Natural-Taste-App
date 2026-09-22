import type {Restaurant} from '../types';
import {formatRestaurantDistance} from './restaurants';

const restaurant: Restaurant = {
  id: 1,
  name: '테스트 식당',
  address: '서울시 중구',
  latitude: 37.5665,
  longitude: 126.978,
};

describe('formatRestaurantDistance', () => {
  it('formats a nearby restaurant in meters', () => {
    expect(
      formatRestaurantDistance(restaurant, {
        latitude: 37.5665,
        longitude: 126.977,
      }),
    ).toBe('88m');
  });

  it('formats a distant restaurant in kilometers', () => {
    expect(
      formatRestaurantDistance(restaurant, {
        latitude: 37.5665,
        longitude: 126.966,
      }),
    ).toBe('1.1km');
  });

  it('returns null when user location is missing', () => {
    expect(formatRestaurantDistance(restaurant, null)).toBeNull();
  });
});
