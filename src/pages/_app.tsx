import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { AppProps } from 'next/app';

import { FC, useCallback, useEffect, useState } from 'react';
import { emotionCache } from '@/utils/emotion';

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(preferredColorScheme);

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
        <Component {...pageProps} />
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default MyApp;
