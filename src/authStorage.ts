import AsyncStorage from '@react-native-async-storage/async-storage';
import type {AuthResponse} from './types';

const AUTH_STORAGE_KEY = 'foodmap.auth';

export async function loadStoredAuth() {
  const value = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!value) {
    return null;
  }

  const auth = JSON.parse(value) as Partial<AuthResponse>;
  if (
    typeof auth.userId !== 'number' ||
    typeof auth.accessToken !== 'string' ||
    typeof auth.tokenType !== 'string'
  ) {
    return null;
  }

  return auth as AuthResponse;
}

export async function saveStoredAuth(auth: AuthResponse) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export async function clearStoredAuth() {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
}
