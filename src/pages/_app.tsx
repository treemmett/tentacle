import {
  AppShell,
  Center,
  ColorScheme,
  ColorSchemeProvider,
  Loader,
  MantineProvider,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Navbar } from '@/components/Navbar';
import { emotionCache } from '@/utils/emotion';

const DynamicLoginForm = dynamic(() => import('@/components/LoginForm').then((m) => m.LoginForm), {
  loading: () => (
    <Center>
      <Loader />
    </Center>
  ),
});

const modals = {
  login: DynamicLoginForm as FC,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(preferredColorScheme);
  const { asPath } = useRouter();

  const toggleColorScheme = useCallback(
    (value: ColorScheme) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark')),
    [colorScheme]
  );

  useEffect(() => {
    setColorScheme(preferredColorScheme);
  }, [preferredColorScheme]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        emotionCache={emotionCache}
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <ModalsProvider modals={modals}>
          <Notifications position="bottom-center" />
          <AppShell header={<Header />} hidden={!!asPath.match(/(^\/login)/)} navbar={<Navbar />}>
            <Component {...pageProps} />
          </AppShell>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default MyApp;
