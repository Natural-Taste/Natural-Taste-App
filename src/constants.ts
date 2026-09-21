import {Platform} from 'react-native';
import type {Message} from './types';

export const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const KAKAO_MAP_BASE_URL = 'https://localhost';
export const KAKAO_MAP_DOMAIN_ERROR =
  '카카오 Developers > 앱 > 플랫폼 키 > JavaScript key > JavaScript SDK domain에 https://localhost를 등록해 주세요.';

export const emptyMessage: Message = {
  tone: 'info',
  text: '백엔드가 꺼져 있어도 화면은 그대로 확인할 수 있습니다.',
};
