import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/config';

/**
 * Custom hook to manage Firebase authentication state
 * 
 * @returns {Object} Authentication state
 * @returns {User | null} user - The currently authenticated user or null
 * @returns {boolean} loading - True while checking authentication status
 * 
 * @example
 * const { user, loading } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) return <Navigate to="/login" />;
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    // Automatically updates when user logs in/out
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return { user, loading };
};
