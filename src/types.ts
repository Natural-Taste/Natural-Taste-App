export type AuthMode = 'login' | 'signup';
export type ActivePanel = 'map' | 'community' | 'search' | 'mypage';

export type AuthResponse = {
  userId: number;
  accessToken: string;
  tokenType: string;
};

export type UserProfile = {
  id: number;
  email: string;
  name: string;
};

export type Restaurant = {
  id: number | null;
  provider?: string;
  providerPlaceId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
  phone?: string;
  placeUrl?: string;
  saved?: boolean;
  memo?: string | null;
};

export type CommunityPost = {
  id: number;
  authorId: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  restaurant: Restaurant;
  commentCount: number;
  recommendationCount: number;
  recommended: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CommunityComment = {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export type ImageUploadResponse = {
  imageUrl: string;
};

export type UploadImageFile = {
  uri: string;
  type: string;
  fileName: string;
};

export type FriendUser = {
  id: number;
  email: string;
  name: string;
  relationshipStatus: 'NONE' | 'FRIEND' | 'SENT_REQUEST' | 'RECEIVED_REQUEST';
};

export type FriendRequest = {
  id: number;
  requester: FriendUser;
  receiver?: FriendUser | null;
  createdAt: string;
};

export type Message = {
  tone: 'info' | 'error' | 'success';
  text: string;
};
