import { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Title,
  Grid,
  Paper,
  Text,
  Avatar,
  Group,
  TextInput,
  Button,
  NativeSelect,
  Box,
  FileInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { IUpdateUserDto } from '@clients';
import { usePostUpdate, useGetUserData } from '@requests/userRequests.ts';
import { useGetAllCurrencies } from '@requests/currencyRequests.ts';
import ExpenseCategoryTable from './ExpenseCategoryTable';
import IncomeCategoryTable from './IncomeCategoryTable';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import useErrorHandling from '@hooks/useErrorHandling.tsx';
import TagsTable from './TagsTable.tsx';

export default function Profile() {
  const { t } = useTranslation();
  const { userData, setUserData } = useUserDataContext();
  const { handleError } = useErrorHandling();
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [getUserData] = useGetUserData(); // no username
  const [updateUser] = usePostUpdate();
  const [getAllCurrencies] = useGetAllCurrencies();

  const form = useForm<IUpdateUserDto>({
    mode: 'uncontrolled',
  });

  const fetchUser = useCallback(() => {
    try {
      // Assuming we can get the current user's username from somewhere
      // This might need to be adjusted based on your authentication system
      if (userData) {
        form.initialize({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          currencyId: userData.currencyId || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, [userData]);

  const fetchCurrencies = async () => {
    try {
      const response = await getAllCurrencies();
      if (response?.data) {
        setCurrencies(response.data);
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCurrencies();
  }, [userData, fetchUser]);

  const handleUpdateProfile = async (values: IUpdateUserDto) => {
    try {
      const username = userData?.username;
      if (username) {
        await updateUser(username, values);
        fetchUser(); // Refresh user data
        // update the userData context
        getUserData() // TODO: make updateUser return the updated user
          .then((response) => {
            setUserData(response?.data);
          })
          .catch((error) => {
            console.error('Error updating user data:', error);
            handleError(t('profile.notifications.fetchUserFailed'));
          });
        notifications.show({
          title: t('tables.common.successTitle'),
          message: t('profile.notifications.updated'),
          color: 'green',
        });
      } else {
        notifications.show({
          title: t('tables.common.errorTitle'),
          message: t('profile.notifications.missingUsername'), // missing username in userData
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      notifications.show({
        title: t('tables.common.errorTitle'),
        message: t('profile.notifications.updateFailed'),
        color: 'red',
      });
    }
  };

  const handleProfilePictureChange = (file: File | null) => {
    if (file) {
      setProfilePicture(file);
      // Here you would typically upload the file to your server
      // This would require an additional endpoint and hook
      console.log('Profile picture changed:', file);
    }
  };

  return (
    <Container fluid>
      <Title order={1} mb="xl">
        {t('profile.title')}
      </Title>

      {/* User Profile Box */}
      <Paper shadow="xs" p="md" mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar
                size={150}
                radius={75}
                src={
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : userData?.profilePicture
                }
                mb="md"
              />
              <FileInput
                accept="image/*"
                placeholder={t('profile.changePicture')}
                onChange={handleProfilePictureChange}
              />
            </Box>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Box>
              <Text size="xl" fw={700} mb="xs">
                {userData?.username}
              </Text>
              <Text c="dimmed" mb="md">
                {userData?.email}
              </Text>

              <form onSubmit={form.onSubmit(handleUpdateProfile)}>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label={t('profile.fields.firstName')}
                      placeholder={t('profile.fields.firstNamePlaceholder')}
                      {...form.getInputProps('firstName')}
                      mb="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <TextInput
                      label={t('profile.fields.lastName')}
                      placeholder={t('profile.fields.lastNamePlaceholder')}
                      {...form.getInputProps('lastName')}
                      mb="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <NativeSelect
                      label={t('profile.fields.currency')}
                      //placeholder="Select currency"
                      data={currencies.map((currency) => {
                        return {
                          value: currency.id.toString(),
                          label: `${currency.name} (${currency.symbol})`,
                        };
                      })}
                      {...form.getInputProps('currencyId')}
                      mb="md"
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group justify="flex-end">
                      <Tooltip
                        label={t('profile.tooltips.cannotUpdate')}
                        disabled={userData !== undefined}
                        color="teal"
                        withArrow
                        position="top"
                      >
                        <Button disabled={userData === undefined} type="submit">
                          {t('profile.buttons.save')}
                        </Button>
                      </Tooltip>
                    </Group>
                  </Grid.Col>
                </Grid>
              </form>
            </Box>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Expense Categories Box */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={2} mb="md">
          {t('profile.sections.expenseCategories')}
        </Title>
        <ExpenseCategoryTable />
      </Paper>

      {/* Income Categories Box */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={2} mb="md">
          {t('profile.sections.incomeCategories')}
        </Title>
        <IncomeCategoryTable />
      </Paper>

      {/* Tags Box */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={2} mb="md">
          {t('profile.sections.tags')}
        </Title>
        <TagsTable />
      </Paper>
    </Container>
  );
}
