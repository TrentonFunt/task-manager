import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component for route protection
 * Prevents unauthorized access to protected pages
 * Shows loading spinner while checking authentication state
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-100' role='status' aria-live='polite'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4' aria-hidden='true'></div>
          <p className='text-xl text-gray-700'>Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
