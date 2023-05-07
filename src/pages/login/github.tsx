import { Center, Loader } from '@mantine/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const GitHubLogin: NextPage = () => {
  const { query } = useRouter();

  useEffect(() => {
    if (query.code) {
      fetch('/api/login/oauth/github', {
        body: JSON.stringify({ code: query.code }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
        .then((r) => r.json())
        .then((user) => {
          console.log(user);
        });
    }
  }, [query.code]);

  return (
    <Center h="100dvh">
      <Loader />
    </Center>
  );
};

export default GitHubLogin;
