import { Button, Flex, Header as MantineHeader } from '@mantine/core';
import { FC } from 'react';
import { useUser } from '@/lib/user';

export const Header: FC = () => {
  const { openOAuth, user, logout } = useUser();

  return (
    <MantineHeader height={60}>
      <Flex align="center" h="100%" px="sm">
        <Button ml="auto" onClick={user ? logout : openOAuth} variant="outline">
          {user ? 'Logout' : 'Login'}
        </Button>
      </Flex>
    </MantineHeader>
  );
};
