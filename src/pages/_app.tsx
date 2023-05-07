import { AppShell, ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { emotionCache } from '@/utils/emotion';

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
        <Notifications position="bottom-center" />
        <AppShell header={<Header />} hidden={!!asPath.match(/(^\/login)/)}>
          <Component {...pageProps} />
        </AppShell>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default MyApp;
