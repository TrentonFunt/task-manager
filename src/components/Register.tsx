import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Link, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-linear-to-br from-purple-500 to-pink-600'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded-lg shadow-2xl w-full max-w-md'
        aria-label='Registration form'
      >
        <h2 className='text-3xl font-bold mb-6 text-center text-gray-800'>Register</h2>
        {error && (
          <div 
            className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'
            role='alert'
            aria-live='polite'
          >
            {error}
          </div>
        )}
        {success && (
          <div 
            className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'
            role='status'
            aria-live='polite'
          >
            {success}
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
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500'
            required
            disabled={loading}
            aria-required='true'
            autoComplete='email'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='password' className='block text-gray-700 text-sm font-bold mb-2'>
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500'
            required
            disabled={loading}
            aria-required='true'
            autoComplete='new-password'
            aria-describedby='password-requirements'
          />
          <p id='password-requirements' className='text-xs text-gray-500 mt-1'>
            Password must be at least 6 characters
          </p>
        </div>
        <div className='mb-6'>
          <label htmlFor='confirmPassword' className='block text-gray-700 text-sm font-bold mb-2'>
            Confirm Password
          </label>
          <input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500'
            required
            disabled={loading}
            aria-required='true'
            autoComplete='new-password'
          />
        </div>
        <div className='mb-6'>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            aria-busy={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </div>
        <div className='text-center'>
          <p className='text-gray-600'>
            Already have an account?{' '}
            <Link 
              to='/login' 
              className='text-purple-500 hover:text-purple-700 font-semibold'
              aria-label='Navigate to login page'
            >
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
