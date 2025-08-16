import { Group, Box, Image, Grid, useMantineTheme, Text } from '@mantine/core';
import { Outlet, useNavigate } from 'react-router';
import { routes } from '@routes';
import { useGetUserData } from '@requests/userRequests.ts';
import { useEffect } from 'react';
import { IGetUserDto } from '@clients';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import useErrorHandling from '@hooks/useErrorHandling.tsx';
import SideBar from './SideBar';
import { notifications } from '@mantine/notifications';
import { useGetTagsForUser } from '@requests/tagRequests.ts';

export default function ExpensesLayout() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const [getTagsForUser] = useGetTagsForUser();
  const { setUserData, setUserTags } = useUserDataContext();
  const [getUser] = useGetUserData();
  const { handleError } = useErrorHandling();

  useEffect(() => {
    getUser()
      .then((response) => {
        const userData: IGetUserDto | undefined = response?.data;
        if (userData) {
          setUserData(userData);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        handleError('Error fetching user data: E-101');
      });
  }, []);

  useEffect(() => {
    getTagsForUser()
      .then((response) => {
        if (response?.data) {
          setUserTags(response.data);
        }
      })
      .catch(() => {
        notifications.show({
          title: 'Error',
          message: 'Error Fetching Tags',
          color: 'red',
        });
      });
  }, []);

  return (
    <Box
      bg={theme.colors.gray[2]}
      style={{
        minHeight: '100vh',
      }}
    >
      <Group
        bg={'white'}
        h={75}
        //className={classes.index}
        style={{
          borderBottom: `1px solid #EEE`, // Media query : minwidth: 992px
          position: 'fixed',
          top: 0,
          width: '100%',
        }}
      >
        <Image
          alt="logo"
          src={'/money_svg.svg'}
          width={171}
          height={74}
          style={{
            position: 'relative',
          }}
          onClick={() => {
            navigate(routes.content.home);
          }}
        />
      </Group>
      <Box
        style={{
          //minHeight: '100vh',
          padding: '1.25rem 1.25rem 0 1.25rem',
          marginTop: 75, // position: relative - makes the z-index higher than the header
          // position: 'relative',
          // 'z-index': 0,
          // backgroundColor: theme.colors.violet[0],
          //float: 'left',
        }}
      >
        <Box
          style={{
            marginTop: 0,
            minHeight: 600,
            padding: 0,
            marginRight: '-15',
            marginLeft: '-15', // DOnt know if they are necessary
          }}
        >
          <Grid
            //bg={'blue'}
            // overflow={'hidden'}
            //justify={'flex-end'}
            // gutter={{ base: 10, xs: 'md', md: 'xl', xl: 50 }}
            //visibleFrom={'md'}
            gutter={0}
            style={{
              //float: 'left',
              paddingRight: '15',
              paddingLeft: '15',
              //maxWidth: '100%',
            }}
            columns={50}
            // grow
          >
            <Grid.Col span={'content'}>
              <SideBar />
            </Grid.Col>
            <Grid.Col
              span={40} // TODO: Find a solution to not loose those 15-20 px
              //bg={'violet'}
            >
              <Outlet />
            </Grid.Col>
          </Grid>
        </Box>
        <Group id={'footer'}>
          <Text>© 2025 Expenses Manager All rights reserved.</Text>
        </Group>
      </Box>
    </Box>
  );
}
