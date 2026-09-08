import {
  ActionIcon,
  Box,
  Divider,
  Group,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useLocation, useNavigate } from 'react-router';
import { routes } from '@routes';
import {
  IconCash,
  IconLayoutDashboard,
  IconChartBar,
  IconWallet,
  IconUser,
  IconLogout,
  IconSun,
  IconMoonStars,
} from '@tabler/icons-react';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import styles from './SideBar.module.css';

interface SideBarProps {
  onLogout?: () => void;
}

export default function SideBar({ onLogout }: SideBarProps) {
  const { userData } = useUserDataContext();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior if no handler is provided
      console.log('Logout clicked');
      // Navigate to login page as fallback
      navigate(routes.login.index);
    }
  };

  const initial = userData?.username?.charAt(0).toUpperCase() ?? '?';

  const navItems = [
    {
      icon: <IconLayoutDashboard size={18} />,
      label: 'Dashboard',
      path: routes.content.home,
    },
    {
      icon: <IconChartBar size={18} />,
      label: 'Statistics',
      path: routes.content.statistics.index,
    },
    {
      icon: <IconWallet size={18} />,
      label: 'Budget',
      path: routes.content.budget,
    },
    {
      icon: <IconUser size={18} />,
      label: 'Profile',
      path: routes.content.profile,
    },
  ];

  return (
    <Box
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: theme.other.sideBarBackground,
        borderRight: `0.5px solid ${theme.other.borderColor}`,
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* Logo */}
      <Group
        gap={8}
        wrap="nowrap"
        className={styles.logoRow}
        style={{ padding: '4px 6px', marginBottom: 20, cursor: 'pointer' }}
        onClick={() => {
          return navigate(routes.content.home);
        }}
      >
        <IconCash size={20} color={theme.colors.teal[6]} />
        <Text fw={500} size="sm" c={theme.other.textColor}>
          Expenses
        </Text>
      </Group>

      {/* Navigation */}
      <Stack gap={4}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={active}
              onClick={() => {
                return navigate(item.path);
              }}
            />
          );
        })}
      </Stack>

      {/* Spacer pushes the footer to the bottom */}
      <Box style={{ flex: 1 }} />

      {/* Footer: avatar + username + theme toggle + logout */}
      <Divider color={theme.other.borderColor} mb="sm" mt="sm" />
      <Group justify="space-between" wrap="nowrap" px={6}>
        <Group gap={8} wrap="nowrap">
          <Box
            style={{
              width: 28,
              height: 28,
              flexShrink: 0,
              borderRadius: '50%',
              backgroundColor: theme.colors.teal[2],
              color: theme.colors.teal[8],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {initial}
          </Box>
          <Text size="sm" c={theme.other.textSecondary} truncate>
            {userData?.username}
          </Text>
        </Group>
        <Group gap={2} wrap="nowrap">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => {
              return toggleColorScheme();
            }}
            title={
              colorScheme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
          >
            {colorScheme === 'dark' ? (
              <IconSun size={16} />
            ) : (
              <IconMoonStars size={16} />
            )}
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handleLogout}
            title="Logout"
          >
            <IconLogout size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Box>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <Group
      gap={10}
      wrap="nowrap"
      onClick={onClick}
      className={
        active ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
      }
      style={{
        padding: '8px 10px',
        borderRadius: 'var(--mantine-radius-md)',
        cursor: 'pointer',
      }}
    >
      {icon}
      <Text size="sm" style={{ color: 'inherit', fontWeight: 'inherit' }}>
        {label}
      </Text>
    </Group>
  );
}
