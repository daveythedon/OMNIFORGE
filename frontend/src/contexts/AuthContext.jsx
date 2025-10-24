/**
 * Authentication Context using Clerk
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);

          // Connect socket
          socketService.connect(response.data.id);
          socketService.joinCompany(response.data.id);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
      setLoading(false);
    };

    fetchUser();

    // Cleanup
    return () => {
      socketService.disconnect();
    };
  }, [isLoaded, isSignedIn]);

  const updateUser = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        clerkUser,
        loading,
        isSignedIn,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
