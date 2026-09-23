import type {Restaurant} from '../types';
import {formatRestaurantDistance, formatRestaurantReview} from './restaurants';

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

describe('formatRestaurantReview', () => {
  it('formats saved restaurant review fields', () => {
    expect(
      formatRestaurantReview({
        id: 1,
        name: '초밥집',
        address: '서울시 강남구',
        latitude: 37.5,
        longitude: 127,
        rating: 5,
        tags: '혼밥, 재방문',
        revisit: true,
      }),
    ).toBe('평가 5점 · 혼밥, 재방문 · 재방문 의사 있음');
  });

  it('returns null without review fields', () => {
    expect(
      formatRestaurantReview({
        id: 1,
        name: '초밥집',
        address: '서울시 강남구',
        latitude: 37.5,
        longitude: 127,
      }),
    ).toBeNull();
  });
});
