import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { User } from '@/entities/User';
import { api } from '@/utils/apiClient';
import { USER } from '@/utils/cacheKeys';
import { PublicConfig } from '@/utils/publicConfig';

export function useUser() {
  const { data: user, mutate } = useSWR(USER, () => {
    if (!localStorage.getItem('accessToken')) return undefined;
    return api<User>('GET', '/user');
  });

  const checkToken = useCallback(() => {
    mutate();
  }, [mutate]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    mutate();
  }, [mutate]);

  const [loggingIn, setLoggingIn] = useState(false);

  const openOAuth = useCallback(() => {
    setLoggingIn(true);

    const popup = window.open(
      `https://github.com/login/oauth/authorize?client_id=${PublicConfig.GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );

    if (!popup) {
      throw new Error('Popup blocked');
    }

    const intervalId = setInterval(async () => {
      if (popup.closed) {
        clearInterval(intervalId);
        checkToken();
        setLoggingIn(false);
      }
    });
  }, [checkToken]);

  return {
    checkToken,
    loggingIn,
    logout,
    openOAuth,
    user,
  };
}
