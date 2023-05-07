import { Button, Flex, Header as MantineHeader } from '@mantine/core';
import { FC, useCallback } from 'react';
import { PublicConfig } from '@/utils/publicConfig';

export const Header: FC = () => {
  const openOAuth = useCallback(() => {
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
      }
    });
  }, []);

  return (
    <MantineHeader height={60}>
      <Flex align="center" h="100%" px="sm">
        <Button ml="auto" onClick={openOAuth} variant="outline">
          Login
        </Button>
      </Flex>
    </MantineHeader>
  );
};
