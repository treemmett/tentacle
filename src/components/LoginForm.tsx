import { Button, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconBrandGithub } from '@tabler/icons-react';
import { FC, useEffect } from 'react';
import { useUser } from '@/lib/user';

export const LoginForm: FC<ContextModalProps> = ({ context, id }) => {
  const { loggedIn, openOAuth } = useUser();

  useEffect(() => {
    if (loggedIn) {
      context.closeModal(id);
    }
  }, [context, id, loggedIn]);

  return (
    <Stack>
      <Button onClick={openOAuth} type="button" w="100%">
        <IconBrandGithub stroke={2} />
        <Text ml="sm">Login with GitHub</Text>
      </Button>
    </Stack>
  );
};
