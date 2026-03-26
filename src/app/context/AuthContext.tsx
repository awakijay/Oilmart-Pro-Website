import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  avatar?: string;
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
  users: Omit<AuthUser, 'password'>[];
  isAuthenticated: boolean;
  register: (payload: AuthPayload) => { success: boolean; message: string };
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (payload: Partial<AuthUser>) => void;
}

const USERS_KEY = 'oilmartpro_users';
const ACTIVE_USER_KEY = 'oilmartpro_active_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_KEY);
    const activeUserEmail = localStorage.getItem(ACTIVE_USER_KEY);
    const parsedUsers: AuthUser[] = savedUsers ? JSON.parse(savedUsers) : [];

    setUsers(parsedUsers);

    if (activeUserEmail) {
      const activeUser = parsedUsers.find((item) => item.email === activeUserEmail) ?? null;
      setUser(activeUser);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    users: users.map(({ password: _password, ...safeUser }) => safeUser),
    isAuthenticated: Boolean(user),
    register: (payload) => {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const alreadyExists = users.some((item) => item.email.toLowerCase() === normalizedEmail);

      if (alreadyExists) {
        return { success: false, message: 'An account with this email already exists.' };
      }

      const nextUser: AuthUser = {
        ...payload,
        email: normalizedEmail,
      };

      setUsers((prev) => [...prev, nextUser]);
      setUser(nextUser);
      localStorage.setItem(ACTIVE_USER_KEY, normalizedEmail);
      return { success: true, message: 'Your account has been created successfully.' };
    },
    login: (email, password) => {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = users.find(
        (item) => item.email.toLowerCase() === normalizedEmail && item.password === password,
      );

      if (!existingUser) {
        return { success: false, message: 'Invalid email or password.' };
      }

      setUser(existingUser);
      localStorage.setItem(ACTIVE_USER_KEY, existingUser.email);
      return { success: true, message: 'Signed in successfully.' };
    },
    logout: () => {
      setUser(null);
      localStorage.removeItem(ACTIVE_USER_KEY);
    },
    updateProfile: (payload) => {
      if (!user) return;

      const updatedUser = { ...user, ...payload };
      setUser(updatedUser);
      setUsers((prev) =>
        prev.map((item) => (item.email === user.email ? updatedUser : item)),
      );
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
