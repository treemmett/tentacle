import {
  Badge,
  DefaultMantineColor,
  Group,
  Navbar as MantineNavbar,
  Text,
  ThemeIcon,
  UnstyledButton,
  createStyles,
} from '@mantine/core';
import { IconTargetArrow } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';

interface MainLinkProps {
  badge?: string;
  color: DefaultMantineColor;
  href: string;
  icon?: React.ReactNode;
  label: string;
}

const useStyles = createStyles((theme, { asPath, href }: { asPath?: string; href?: string }) => {
  const backgroundColor =
    theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0];

  return {
    button: {
      '&:hover': {
        backgroundColor,
      },
      backgroundColor: asPath && href && asPath === href ? backgroundColor : undefined,
      borderRadius: theme.radius.sm,
      display: 'block',
      padding: theme.spacing.xs,
      width: '100%',
    },
  };
});

const MainLink = ({ badge, color, href, icon, label }: MainLinkProps) => {
  const { asPath } = useRouter();
  const { classes } = useStyles({ asPath, href });

  return (
    <UnstyledButton className={classes.button} component={Link} href={href}>
      <Group>
        {icon && (
          <ThemeIcon color={color} variant="light">
            {icon}
          </ThemeIcon>
        )}

        <Text size="sm">{label}</Text>

        {badge && (
          <Badge color={color} ml="auto">
            {badge}
          </Badge>
        )}
      </Group>
    </UnstyledButton>
  );
};

export const Navbar: FC = () => (
  <MantineNavbar hiddenBreakpoint="sm" pt="xs" px="xs" width={{ base: 200 }}>
    <MantineNavbar.Section>
      <MainLink
        color="blue"
        href="/triggers"
        icon={<IconTargetArrow size="1rem" />}
        label="Triggers"
      />
    </MantineNavbar.Section>
  </MantineNavbar>
);
