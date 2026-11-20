export type UserRole = 
  | 'OWNER'
  | 'TECHNICIAN'
  | 'WORKSHOP_ADMIN'
  | 'DEALER_ADMIN'
  | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
