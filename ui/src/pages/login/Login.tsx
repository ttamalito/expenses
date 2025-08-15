import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  LoadingOverlay,
  useMantineTheme,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import classes from './Login.module.css';
import { useNavigate } from 'react-router';
import { useAuth } from '@hooks/useAuth.tsx';
import { useForm } from '@mantine/form';
import { IUserLoginRequest } from '@clients';
import { useDisclosure } from '@mantine/hooks';
import { routes } from '@routes';

/**
 * Login page to be used in home/login
 * Handles the login process and redirects to the content page
 * @constructor
 */
function Login() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { onLogin } = useAuth();
  const [visible, { open, close }] = useDisclosure(false);
  const formHook = useForm<IUserLoginRequest>({
    name: 'loginForm',
    mode: 'uncontrolled',
    validate: {
      // userName: (value) => {
      //   if (!value) {
      //     return 'loginPage.userNameError';
      //   }
      //   return value.trim().length < 1 ? 'loginPage.userNameError' : null;
      // },
      // password: (value) => {
      //   if (!value) {
      //     return 'loginPage.passwordLengthError';
      //   }
      //   return value.trim().length < 1 ? 'loginPage.passwordLengthError' : null;
      // },
    },
    transformValues: (values) => {
      const isEmail = values.email?.includes('@');
      if (!isEmail) {
        values.username = values.email;
      }
      return values;
    },
  });

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Login
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account yet?{' '}
        <Anchor
          onClick={() => {
            navigate(routes.register.index);
          }}
          size="sm"
          component="button"
        >
          Register
        </Anchor>
      </Text>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        <Anchor
          onClick={() => {
            navigate(routes.home.index);
          }}
          size="sm"
          component="button"
        >
          Go back home
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <LoadingOverlay
          visible={visible}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: theme.other.yoloPurple }}
        />
        <form
          onSubmit={formHook.onSubmit((values) => {
            console.log('Clicked');
            open(); // Show loading overlay
            onLogin(values)
              .then((response) => {
                //formHook.reset();
                close(); // Hide loading overlay
                if (response) {
                  navigate(response);
                }
              })
              .catch((error: string) => {
                close(); // Hide loading overlay
                if (error.includes('ñ')) {
                  formHook.setFieldError('password', error);
                } else {
                  formHook.setFieldError('userName', error);
                }
              });
          })}
        >
          <TextInput
            label="Username or Email"
            placeholder="Enter your username or email"
            required
            key={formHook.key('email')}
            {...formHook.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            required
            mt="md"
            key={formHook.key('password')}
            {...formHook.getInputProps('password')}
          />
          <Group justify="space-between" mt="lg">
            <Checkbox
              label="Remember me"
              key={formHook.key('rememberMe')}
              {...formHook.getInputProps('rememberMe', { type: 'checkbox' })}
            />
            <Anchor
              component={'a'}
              size="sm"
              onClick={(event) => {
                event.preventDefault();
                //navigate(routes.home.forgotPassword);
              }}
            >
              Forgot password?
            </Anchor>
          </Group>
          <Button
            fullWidth
            mt="xl"
            type={'submit'}
            leftSection={<IconArrowRight />}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Login;
