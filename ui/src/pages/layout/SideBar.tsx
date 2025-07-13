import {
  Box,
  Divider,
  Group,
  Image,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useNavigate } from 'react-router';
import { routes } from '@routes';
import {
  IconHome,
  IconChartBar,
  IconWallet,
  IconUser,
  IconLogout,
} from '@tabler/icons-react';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface SideBarProps {
  profilePictureUrl?: string;
  onLogout?: () => void;
}

export default function SideBar({
  profilePictureUrl = '/avatar.png',
  onLogout,
}: SideBarProps) {
  const { userData } = useUserDataContext();
  const navigate = useNavigate();
  const theme = useMantineTheme();

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

  return (
    <Box
      style={{
        height: '100%',
        width: 250,
        backgroundColor: 'white',
        padding: '1rem',
        borderRight: `1px solid ${theme.colors.gray[3]}`,
      }}
    >
      <Stack gap="md">
        {/* Profile Picture */}
        <Group justify="center">
          <Image
            src={profilePictureUrl}
            alt="Profile"
            width={100}
            height={100}
            radius={50}
            fallbackSrc="/tamalito.jpg"
          />
        </Group>

        {/* User Name */}
        <Text fw={500} ta={'center'}>
          {userData?.username}
        </Text>

        <Divider />

        {/* Navigation Options */}
        <NavItem
          icon={<IconHome size={20} />}
          label="Home"
          onClick={() => {
            return navigate(routes.content.home);
          }}
        />
        <NavItem
          icon={<IconChartBar size={20} />}
          label="Statistics"
          onClick={() => {
            return navigate(routes.content.statistics.index);
          }}
        />
        <NavItem
          icon={<IconWallet size={20} />}
          label="Budget"
          onClick={() => {
            return navigate(routes.content.budget);
          }}
        />
        <NavItem
          icon={<IconUser size={20} />}
          label="Profile"
          onClick={() => {
            return navigate(routes.content.profile);
          }}
        />

        <Divider />

        {/* Logout Option */}
        <NavItem
          icon={<IconLogout size={20} />}
          label="Logout"
          onClick={handleLogout}
        />
      </Stack>
    </Box>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavItem({ icon, label, onClick }: NavItemProps) {
  return (
    <Group
      gap="sm"
      style={{
        padding: '0.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '#f5f5f5',
        },
      }}
      onClick={onClick}
    >
      {icon}
      <Text>{label}</Text>
    </Group>
  );
}
