import { Button, Flex, Header as MantineHeader } from '@mantine/core';
import { FC } from 'react';
import { useUser } from '@/lib/user';

export const Header: FC = () => {
  const { openOAuth, loggedIn, logout } = useUser();

  return (
    <MantineHeader height={60}>
      <Flex align="center" h="100%" px="sm">
        <Button ml="auto" onClick={loggedIn ? logout : openOAuth} variant="outline">
          {loggedIn ? 'Logout' : 'Login'}
        </Button>
      </Flex>
    </MantineHeader>
  );
};
