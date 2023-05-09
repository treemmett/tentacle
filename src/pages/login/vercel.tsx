import { Center, Loader } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from '@/lib/user';
import { api } from '@/utils/apiClient';

const GitHubLogin: NextPage = () => {
  const { query } = useRouter();
  const { loggedIn } = useUser();

  useEffect(() => {
    if (query.code && loggedIn) {
      api('POST', '/login/oauth/vercel', { code: query.code }).then(() => {
        window.location.href = query.next as string;
      });
    }
  }, [loggedIn, query.code, query.next]);

  useEffect(() => {
    if (!loggedIn) {
      openContextModal({
        closeOnClickOutside: false,
        closeOnEscape: false,
        innerProps: {},
        modal: 'login',
        title: 'Welcome! Login to get started',
        withCloseButton: false,
      });
    }
  }, [loggedIn]);

  return (
    <Center h="100dvh">
      <Loader />
    </Center>
  );
};

export default GitHubLogin;
