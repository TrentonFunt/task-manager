import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Firestore mocks
const mockCollection = vi.fn<(dbArg: unknown, name: string) => unknown>(() => ({ __type: 'collectionRef' }));
const mockWhere = vi.fn<(field: string, op: unknown, value: unknown) => unknown>(() => ({ __type: 'whereClause' }));
const mockQuery = vi.fn<(c: unknown, w?: unknown) => unknown>(() => ({ __type: 'queryRef' }));
const mockOnSnapshot = vi.fn<
  (q: unknown, next: (snap: unknown) => void, error?: (e: unknown) => void) => () => void
>();
const mockAddDoc = vi.fn<(coll: unknown, data: unknown) => Promise<unknown>>();
const mockUpdateDoc = vi.fn<(docRef: unknown, data: unknown) => Promise<unknown>>();
const mockDeleteDoc = vi.fn<(docRef: unknown) => Promise<unknown>>();
const mockDoc = vi.fn<(dbArg: unknown, name: string, id: string) => unknown>(() => ({ __type: 'docRef' }));

vi.mock('firebase/firestore', () => ({
  collection: (dbArg: unknown, name: string) => mockCollection(dbArg, name),
  where: (field: string, op: unknown, value: unknown) => mockWhere(field, op, value),
  query: (c: unknown, w?: unknown) => mockQuery(c, w),
  onSnapshot: (
    q: unknown,
    next: (snap: unknown) => void,
    error?: (e: unknown) => void,
  ) => mockOnSnapshot(q, next, error),
  addDoc: (coll: unknown, data: unknown) => mockAddDoc(coll, data),
  updateDoc: (docRef: unknown, data: unknown) => mockUpdateDoc(docRef, data),
  deleteDoc: (docRef: unknown) => mockDeleteDoc(docRef),
  doc: (dbArg: unknown, name: string, id: string) => mockDoc(dbArg, name, id),
}));

vi.mock('../firebase/config', () => ({
  db: {},
}));

const mockUseAuth = vi.fn();
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

import { useTasks } from '../hooks/useTasks';

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty tasks and loading=false when no user', () => {
    mockUseAuth.mockReturnValue({ user: null });

    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(mockOnSnapshot).not.toHaveBeenCalled();
  });

  it('subscribes to user tasks and sets tasks from snapshot', () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' } });

    const unsubscribe = vi.fn();
    const mockSnapshot = {
      docs: [
        {
          id: 't1',
          data: () => ({
            title: 'Task A',
            description: 'Desc',
            category: 'General',
            priority: 'medium',
            dueDate: '2025-01-01',
            completed: false,
          }),
        },
      ],
    };

    mockOnSnapshot.mockImplementation((_q: unknown, next: (snap: unknown) => void) => {
      next(mockSnapshot);
      return unsubscribe;
    });

    const { result } = renderHook(() => useTasks());
    expect(mockCollection).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toEqual(
      expect.objectContaining({ id: 't1', title: 'Task A', completed: false }),
    );
  });

  it('sets error when snapshot listener errors', () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' } });
    const unsubscribe = vi.fn();

    mockOnSnapshot.mockImplementation(
      (_q: unknown, _next: (snap: unknown) => void, error?: (e: unknown) => void) => {
        error?.(new Error('boom'));
        return unsubscribe;
      },
    );

    const { result } = renderHook(() => useTasks());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load tasks. Please refresh the page.');
    expect(result.current.tasks).toEqual([]);
  });

  it('addTask throws if user not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { result } = renderHook(() => useTasks());
    await expect(
      act(async () => {
        await result.current.addTask({
          title: 'X',
          description: 'Y',
          category: 'General',
          priority: 'low',
          dueDate: '2025-01-01',
        });
      }),
    ).rejects.toThrow('User not authenticated');
  });

  it('addTask writes new task with defaults and userId', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' } });
    mockAddDoc.mockResolvedValue({});

    const { result } = renderHook(() => useTasks());
    await act(async () => {
      await result.current.addTask({
        title: 'New',
        description: 'D',
        category: 'General',
        priority: 'high',
        dueDate: '2025-02-02',
      });
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload).toEqual(
      expect.objectContaining({
        title: 'New',
        description: 'D',
        category: 'General',
        priority: 'high',
        dueDate: '2025-02-02',
        completed: false,
        userId: 'u1',
      }),
    );
  });

  it('updateTask and toggleTaskCompletion call updateDoc with correct refs', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' } });
    mockUpdateDoc.mockResolvedValue({});

    const { result } = renderHook(() => useTasks());
    await act(async () => {
      await result.current.updateTask('t1', { title: 'Edited' });
      await result.current.toggleTaskCompletion('t1', true);
    });

    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'tasks', 't1');
    // Two updates: one for updateTask and one for toggleTaskCompletion
    expect(mockUpdateDoc).toHaveBeenCalledTimes(2);
    expect(mockUpdateDoc.mock.calls[0][1]).toEqual(expect.objectContaining({ title: 'Edited' }));
    expect(mockUpdateDoc.mock.calls[1][1]).toEqual(expect.objectContaining({ completed: true }));
  });

  it('deleteTask calls deleteDoc with correct ref', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' } });
    mockDeleteDoc.mockResolvedValue({});

    const { result } = renderHook(() => useTasks());
    await act(async () => {
      await result.current.deleteTask('t1');
    });

    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'tasks', 't1');
    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});
