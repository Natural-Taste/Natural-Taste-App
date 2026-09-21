import {API_BASE_URL} from '../constants';
import type {AuthResponse, ImageUploadResponse, UploadImageFile} from '../types';

let unauthorizedHandler: (() => void) | null = null;

export class ApiError extends Error {
  constructor(public status: number) {
    super(`요청 실패 (${status})`);
  }
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function request<T = void>(
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
    if (response.status === 401 && options.auth) {
      unauthorizedHandler?.();
    }
    throw new ApiError(response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function uploadImage(
  file: UploadImageFile,
  auth: AuthResponse,
): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type,
    name: file.fileName,
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/images`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `${auth.tokenType} ${auth.accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }
    throw new ApiError(response.status);
  }

  const data = (await response.json()) as ImageUploadResponse;
  return {
    imageUrl: data.imageUrl.startsWith('/')
      ? `${API_BASE_URL}${data.imageUrl}`
      : data.imageUrl,
  };
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof TypeError) {
    return `${fallback} 백엔드 연결을 확인해 주세요.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
