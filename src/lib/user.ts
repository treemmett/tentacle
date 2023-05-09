import { useCallback } from 'react';
import useSWR from 'swr';
import { User } from '@/entities/User';
import { api } from '@/utils/apiClient';
import { USER } from '@/utils/cacheKeys';

export function useUser() {
  const { data: user, mutate } = useSWR<User, never, typeof USER>(USER, () => api('GET', '/user'));

  const checkToken = useCallback(() => {
    mutate();
  }, [mutate]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    mutate();
  }, [mutate]);

  return {
    checkToken,
    loggedIn: !!user,
    logout,
    user,
  };
}
