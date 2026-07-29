export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUser extends AuthTokens {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}
