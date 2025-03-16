import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';
import { User } from '@shared/schema';
import { api } from '@/lib/api';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<User>('/api/user');
        setUser(response.data);
      } catch (err) {
        // If the error is 401, the user is not authenticated
        if (err.response?.status === 401) {
          setUser(null);
          return;
        }
        
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
        toast({
          title: 'Error',
          description: 'Failed to fetch user data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [toast]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<User>('/api/login', {
        username,
        password,
      });
      setUser(response.data);
      toast({
        title: 'Success',
        description: 'Successfully logged in',
        variant: 'default',
      });
    } catch (err) {
      let errorMessage = 'Failed to login';
      if (err.response) {
        errorMessage = err.response.data || errorMessage;
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post('/api/logout');
      setUser(null);
      // Clear query cache on logout to avoid showing stale data
      queryClient.clear();
      toast({
        title: 'Success',
        description: 'Successfully logged out',
        variant: 'default',
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to logout'));
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout, clearError }}>
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