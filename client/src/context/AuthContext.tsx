import { createContext, useContext, useState, useEffect } from 'react';
import type { StudentUser, OfficerUser, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: StudentUser | OfficerUser | null;
  role: UserRole | null;
  token: string | null;
  loading: boolean;
  loginStudent: (regNo: string, pass: string) => Promise<void>;
  loginOfficer: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateStudentInContext: (updatedFields: Partial<StudentUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentUser | OfficerUser | null>(() => {
    const cached = localStorage.getItem('user');
    return cached ? JSON.parse(cached) : null;
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    return (localStorage.getItem('role') as UserRole) || null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const refreshUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
        setRole(res.role);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('role', res.role);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginStudent = async (registrationNumber: string, pass: string) => {
    const res = await api.loginStudent({ registrationNumber, password: pass });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      setRole('student');
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('role', 'student');
    }
  };

  const loginOfficer = async (email: string, pass: string) => {
    const res = await api.loginOfficer({ email, password: pass });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      setRole('placement_officer');
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('role', 'placement_officer');
    }
  };

  const updateStudentInContext = (updatedFields: Partial<StudentUser>) => {
    if (user && role === 'student') {
      const updated = { ...user, ...updatedFields } as StudentUser;
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        loginStudent,
        loginOfficer,
        logout,
        refreshUser,
        updateStudentInContext,
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
