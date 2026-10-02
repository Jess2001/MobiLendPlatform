import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, type User, ApiError } from '../lib/api';
import { tokenStorage } from '../lib/tokenStorage';

interface AuthContextValue {
  user: User | null;
  // true while the initial session-restore check (GET /auth/me/) is running
  isLoading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<User>;
  register: (payload: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
  }) => Promise<User>;
  logout: () => void;
  // Called after a successful OTP verify to update the cached user in place
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On first load, if we have a token, confirm it's still valid and
    // fetch the current user rather than trusting stale localStorage.
    const access = tokenStorage.getAccess();
    if (!access) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => setUserState(u))
      .catch(() => {
        tokenStorage.clear();
        setUserState(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    const res = await authApi.login({ email_or_phone: emailOrPhone, password });
    tokenStorage.set(res.tokens.access, res.tokens.refresh);
    setUserState(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (payload: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      password: string;
    }) => {
      const res = await authApi.register(payload);
      tokenStorage.set(res.tokens.access, res.tokens.refresh);
      setUserState(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUserState(null);
  }, []);

  const setUser = useCallback((u: User) => setUserState(u), []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { ApiError };
