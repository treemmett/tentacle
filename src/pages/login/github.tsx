import { Center, Loader } from '@mantine/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { api } from '@/utils/apiClient';

const GitHubLogin: NextPage = () => {
  const { query } = useRouter();

  useEffect(() => {
    if (query.code) {
      api<{ token: string }>('POST', '/login/oauth/github', { code: query.code }).then(
        ({ token }) => {
          localStorage.setItem('accessToken', token);
          window.close();
        }
      );
    }
  }, [query.code]);

  return (
    <Center h="100dvh">
      <Loader />
    </Center>
  );
};

export default GitHubLogin;
