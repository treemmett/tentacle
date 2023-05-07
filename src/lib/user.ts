import { useCallback } from 'react';
import useSWR from 'swr';
import { USER } from '@/utils/cacheKeys';

export function useUser() {
  const { data, mutate } = useSWR<boolean, never, typeof USER>(
    USER,
    () => !!localStorage.getItem('accessToken')
  );

  const checkToken = useCallback(() => {
    mutate(() => !!localStorage.getItem('accessToken'));
  }, [mutate]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    mutate(false);
  }, [mutate]);

  return {
    checkToken,
    loggedIn: data || false,
    logout,
  };
}
