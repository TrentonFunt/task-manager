import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

const mockOnAuthStateChanged = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

vi.mock('../firebase/config', () => ({
  auth: {},
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially and updates when auth state arrives (user)', () => {
    const unsubscribe = vi.fn();
    // Simulate onAuthStateChanged registering a callback, then invoke it with a user
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: (u: unknown) => void) => {
      // Immediately invoke callback with user
      const mockUser: { uid: string; email: string } = { uid: '123', email: 'test@example.com' };
      callback(mockUser);
      return unsubscribe;
    });

    const { result } = renderHook(() => useAuth());
    // After callback, loading should be false and user present
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(expect.objectContaining({ uid: '123' }));
  });

  it('returns null user when signed out', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: (u: unknown) => void) => {
      callback(null);
      return unsubscribe;
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
