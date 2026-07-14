import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, clearStoredAuthToken, getStoredAuthToken, setStoredAuthToken } from '../utils/api';
import { getStoredAdminToken } from '../utils/adminAuth';

export interface AuthUser {
  id?: string;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
  role?: 'admin' | 'customer';
}

interface AuthPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  users: AuthUser[];
  isAuthenticated: boolean;
  register: (payload: AuthPayload) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<AuthUser>) => Promise<void>;
}

const USERS_KEY = 'oilmartpro_users';
const ACTIVE_USER_KEY = 'oilmartpro_active_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isActive = true;

    const syncLegacyUsers = async () => {
      const savedUsers = localStorage.getItem(USERS_KEY);
      if (!savedUsers) return;

      const parsedUsers: Array<AuthUser & { password?: string }> = JSON.parse(savedUsers);

      for (const legacyUser of parsedUsers) {
        if (!legacyUser.password) continue;

        try {
          await apiRequest<{ user: AuthUser; token: string }>('/auth/register', {
            method: 'POST',
            body: {
              firstName: legacyUser.firstName,
              lastName: legacyUser.lastName,
              email: legacyUser.email,
              phone: legacyUser.phone,
              company: legacyUser.company,
              password: legacyUser.password,
              avatar: legacyUser.avatar ?? '',
            },
          });
        } catch {
          // Ignore duplicates during one-time migration.
        }
      }
    };

    const hydrate = async () => {
      try {
        await syncLegacyUsers();
        const adminToken = getStoredAdminToken();
        const fetchedUsers = adminToken
          ? await apiRequest<AuthUser[]>('/users', { auth: true, token: adminToken })
          : [];

        if (!isActive) return;
        setUsers(fetchedUsers.filter((item) => item.role !== 'admin'));

        const token = getStoredAuthToken();

        if (token) {
          const me = await apiRequest<{ user: AuthUser }>('/auth/me', { auth: true });
          if (!isActive) return;
          setUser(me.user);
          return;
        }

        const activeUserEmail = localStorage.getItem(ACTIVE_USER_KEY);
        const legacyUsers: Array<AuthUser & { password?: string }> = savedUsers ? JSON.parse(savedUsers) : [];
        const legacyUser = activeUserEmail
          ? legacyUsers.find((item) => item.email === activeUserEmail && item.password)
          : null;

        if (legacyUser?.password) {
          const loginResponse = await apiRequest<{ user: AuthUser; token: string }>('/auth/login', {
            method: 'POST',
            body: {
              email: legacyUser.email,
              password: legacyUser.password,
            },
          });

          if (!isActive) return;
          setStoredAuthToken(loginResponse.token);
          setUser(loginResponse.user);
        }
      } catch {
        clearStoredAuthToken();
      } finally {
        localStorage.removeItem(USERS_KEY);
      }
    };

    const savedUsers = localStorage.getItem(USERS_KEY);
    void hydrate();

    return () => {
      isActive = false;
    };
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    users,
    isAuthenticated: Boolean(user),
    register: async (payload) => {
      try {
        const response = await apiRequest<{ user: AuthUser; token: string }>('/auth/register', {
          method: 'POST',
          body: payload,
        });

        setStoredAuthToken(response.token);
        setUser(response.user);
        if (response.user.role !== 'admin') {
          setUsers((prev) => [...prev.filter((item) => item.email !== response.user.email), response.user]);
        }
        localStorage.setItem(ACTIVE_USER_KEY, response.user.email);

        return { success: true, message: 'Your account has been created successfully.' };
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Unable to create account.' };
      }
    },
    login: async (email, password) => {
      try {
        const response = await apiRequest<{ user: AuthUser; token: string }>('/auth/login', {
          method: 'POST',
          body: { email, password },
        });

        setStoredAuthToken(response.token);
        setUser(response.user);
        if (response.user.role !== 'admin') {
          setUsers((prev) => [...prev.filter((item) => item.email !== response.user.email), response.user]);
        }
        localStorage.setItem(ACTIVE_USER_KEY, response.user.email);

        return { success: true, message: 'Signed in successfully.' };
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Invalid email or password.' };
      }
    },
    logout: async () => {
      try {
        await apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST', auth: true });
      } catch {
        // Continue local logout even if the server token has already expired.
      }

      setUser(null);
      clearStoredAuthToken();
      localStorage.removeItem(ACTIVE_USER_KEY);
    },
    updateProfile: async (payload) => {
      if (!user?.id) return;

      const updatedUser = await apiRequest<AuthUser>(`/users/${user.id}`, {
        method: 'PATCH',
        body: payload,
        auth: true,
      });

      setUser(updatedUser);
      if (updatedUser.role !== 'admin') {
        setUsers((prev) => prev.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      }
      localStorage.setItem(ACTIVE_USER_KEY, updatedUser.email);
    },
  }), [user, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
