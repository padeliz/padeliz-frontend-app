import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { googleAuth, GoogleUser } from '@/services/auth/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthContextType {
  isAuthenticated: boolean;
  googleAuth: {
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
  };
  user: GoogleUser | null;
  loading: boolean;
  signIn: (user: GoogleUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@auth_user';

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [, response, promptAsync] = googleAuth.useGoogleAuth();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    // Log full response for debugging
    console.log('Full auth response:', JSON.stringify(response, null, 2));

    if (response?.type === 'success') {
      handleAuthResponse();
    }
  }, [response]);

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user, loading });
  }, [isAuthenticated, user, loading]);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = useCallback(async (googleUser: GoogleUser) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(googleUser));
      setUser(googleUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const handleAuthResponse = useCallback(async () => {
    try {
      console.log('Handling auth response:', JSON.stringify(response, null, 2));
      if (response?.type === 'success') {
        // Try both token types
        const token = response.params?.id_token || response.params?.access_token;
        if (token) {
          console.log('Got token:', token.substring(0, 10) + '...');
          const userInfo = await googleAuth.getUserInfo(token);
          await signIn(userInfo);
        } else {
          console.error('No token found in response');
        }
      }
    } catch (error) {
      console.error('Auth response error:', error);
    }
  }, [response, signIn]);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    isAuthenticated,
    googleAuth: {
      signIn: async () => {
        await promptAsync();
      },
      signOut
    },
    user,
    loading,
    signIn,
    signOut,
  }), [isAuthenticated, user, loading, signIn, signOut, promptAsync]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
