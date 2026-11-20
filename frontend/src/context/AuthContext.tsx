import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, LoginCredentials, RegisterCredentials } from '../types/auth';
import { authService } from '../services/authService';
import { getAuthToken } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        setUser(res.user);
        setToken(storedToken);
      } catch (err) {
        console.warn('Session verification failed, falling back to local session or clearing');
        // If it's a demo token
        const demoUser = localStorage.getItem('engrain_demo_user');
        if (demoUser) {
          try {
            setUser(JSON.parse(demoUser));
          } catch {
            authService.logout();
            setUser(null);
            setToken(null);
          }
        } else {
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.removeItem('engrain_demo_user');
    } catch (err: any) {
      // If network error / backend offline and mock fallback enabled, allow local demo login
      if (err.code === 'NETWORK_ERROR' && import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true') {
        const isWorkshop = credentials.email.includes('taller') || credentials.email.includes('workshop');
        const mockUser: User = {
          id: isWorkshop ? 'usr-workshop-demo' : 'usr-owner-demo',
          name: isWorkshop ? 'Roberto Taller (Demo)' : 'Carlos Propietario (Demo)',
          email: credentials.email,
          role: isWorkshop ? 'WORKSHOP_ADMIN' : 'OWNER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockToken = 'demo-jwt-token-engrain';
        localStorage.setItem('engrain_demo_user', JSON.stringify(mockUser));
        authService.logout();
        localStorage.setItem('engrain_token', mockToken);
        setUser(mockUser);
        setToken(mockToken);
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.register(credentials);
      setUser(res.user);
      setToken(res.accessToken);
      localStorage.removeItem('engrain_demo_user');
    } catch (err: any) {
      if (err.code === 'NETWORK_ERROR' && import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true') {
        const mockUser: User = {
          id: `usr-reg-${Date.now()}`,
          name: credentials.name,
          email: credentials.email,
          role: credentials.role || 'OWNER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockToken = 'demo-jwt-token-engrain';
        localStorage.setItem('engrain_demo_user', JSON.stringify(mockUser));
        localStorage.setItem('engrain_token', mockToken);
        setUser(mockUser);
        setToken(mockToken);
        return;
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('engrain_demo_user');
    setUser(null);
    setToken(null);
  }, []);

  const switchDemoRole = useCallback((role: UserRole) => {
    const isOwner = role === 'OWNER';
    const mockUser: User = {
      id: isOwner ? 'usr-owner-demo' : 'usr-workshop-demo',
      name: isOwner ? 'Carlos Propietario (Demo)' : 'Roberto Mecánico (Demo)',
      email: isOwner ? 'propietario@engrain.io' : 'taller@engrain.io',
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockToken = 'demo-jwt-token-engrain';
    localStorage.setItem('engrain_demo_user', JSON.stringify(mockUser));
    localStorage.setItem('engrain_token', mockToken);
    setUser(mockUser);
    setToken(mockToken);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
