import { Center, Loader } from '@mantine/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { api } from '@/utils/apiClient';

const GitHubLogin: NextPage = () => {
  const { query } = useRouter();

  useEffect(() => {
    if (query.code) {
      api('POST', '/login/oauth/vercel', { code: query.code }).then(() => {
        window.location.href = query.next as string;
      });
    }
  }, [query.code, query.next]);

  return (
    <Center h="100dvh">
      <Loader />
    </Center>
  );
};

export default GitHubLogin;
