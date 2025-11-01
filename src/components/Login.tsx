import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        // Make error messages more user-friendly
        let errorMessage = err.message;
        if (errorMessage.includes('invalid-credential') || errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please try again later.';
        }
        setError(errorMessage);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-blue-500 to-purple-600'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded-lg shadow-2xl w-full max-w-md'
        aria-label='Login form'
      >
        <div className='text-center mb-6'>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>Task Manager</h1>
          <p className='text-gray-600 text-sm'>Organize your tasks efficiently</p>
        </div>
        <h2 className='text-3xl font-bold mb-6 text-center text-gray-800'>Login</h2>
        {error && (
          <div 
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'
            role='alert'
            aria-live='polite'
          >
            {error}
          </div>
        )}
        <div className='mb-4'>
          <label htmlFor='email' className='block text-gray-700 text-sm font-bold mb-2'>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
            disabled={loading}
            aria-required='true'
            autoComplete='email'
          />
        </div>
        <div className='mb-6'>
          <label htmlFor='password' className='block text-gray-700 text-sm font-bold mb-2'>
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
            disabled={loading}
            aria-required='true'
            autoComplete='current-password'
          />
        </div>
        <div className='mb-6'>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            aria-busy={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
        <div className='text-center'>
          <p className='text-gray-600'>
            Don't have an account?{' '}
            <Link 
              to='/register' 
              className='text-blue-500 hover:text-blue-700 font-semibold'
              aria-label='Navigate to registration page'
            >
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
