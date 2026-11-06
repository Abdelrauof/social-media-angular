export interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  gender?: 'male' | 'female';
  dateOfBirth?: string;
  photo?: string;
  cover?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface LoginPayload {
  login?: string;
  email?: string;
  password?: string;
}

export interface SignupPayload {
  name: string;
  username?: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  password: string;
  rePassword: string;
}

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
}

