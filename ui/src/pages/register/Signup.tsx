import {
  Anchor,
  Button,
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
import classes from './Signup.module.css';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useForm } from '@mantine/form';
import { ICreateUserDto, IUserLoginRequest } from '@clients';
import { useDisclosure } from '@mantine/hooks';
import { routes } from '@routes';
import { usePostSignup } from '../../hooks/requests/authRequests.ts';
import { useTranslation } from 'react-i18next';

/**
 * Signup page to be used in register
 * Handles the registration process and redirects to the content page
 * @constructor
 */
function Signup() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { onLogin } = useAuth();
  const [visible, { open, close }] = useDisclosure(false);
  const [signupRequest] = usePostSignup();

  const formHook = useForm<ICreateUserDto>({
    name: 'signupForm',
    mode: 'uncontrolled',
    validate: {
      username: (value) => {
        if (!value) {
          return t('signup.validation.usernameRequired');
        }
        return value.trim().length < 3
          ? t('signup.validation.usernameLength')
          : null;
      },
      email: (value) => {
        if (!value) {
          return t('signup.validation.emailRequired');
        }
        return /^\S+@\S+$/.test(value)
          ? null
          : t('signup.validation.emailInvalid');
      },
      password: (value) => {
        if (!value) {
          return t('signup.validation.passwordRequired');
        }
        return value.trim().length < 6
          ? t('signup.validation.passwordLength')
          : null;
      },
      confirmPassword: (value, values) => {
        if (!value) {
          return t('signup.validation.confirmRequired');
        }
        return value !== values.password
          ? t('signup.validation.passwordsMismatch')
          : null;
      },
    },
  });

  const handleSignup = async (values: ICreateUserDto) => {
    try {
      open(); // Show loading overlay
      const response = await signupRequest(values);

      if (response?.status === 200 || response?.status === 201) {
        // If signup was successful, login the user
        const loginData: IUserLoginRequest = {
          email: values.email,
          password: values.password,
        };

        onLogin(loginData)
          .then((response) => {
            close(); // Hide loading overlay
            if (response) {
              navigate(response);
            }
          })
          .catch((error: string) => {
            close(); // Hide loading overlay
            console.error('Login error after signup:', error);
            // Navigate to login page if auto-login fails
            navigate(routes.login.index);
          });
      }
    } catch (error: any) {
      close(); // Hide loading overlay
      if (error.response?.data?.message) {
        formHook.setErrors({
          username: error.response.data.message.includes('username')
            ? error.response.data.message
            : undefined,
          email: error.response.data.message.includes('email')
            ? error.response.data.message
            : undefined,
          password: error.response.data.message.includes('password')
            ? error.response.data.message
            : undefined,
        });
      } else {
        console.error('Signup error:', error);
      }
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        {t('signup.title')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {t('signup.haveAccount')}{' '}
        <Anchor
          onClick={() => {
            navigate(routes.login.index);
          }}
          size="sm"
          component="button"
        >
          {t('signup.loginInstead')}
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
          {t('signup.goHome')}
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <LoadingOverlay
          visible={visible}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: theme.other.yoloPurple }}
        />
        <form onSubmit={formHook.onSubmit(handleSignup)}>
          <TextInput
            label={t('signup.username')}
            placeholder={t('signup.usernamePlaceholder')}
            required
            key={formHook.key('username')}
            {...formHook.getInputProps('username')}
          />
          <TextInput
            label={t('signup.email')}
            placeholder={t('signup.emailPlaceholder')}
            required
            mt="md"
            key={formHook.key('email')}
            {...formHook.getInputProps('email')}
          />
          <PasswordInput
            label={t('signup.password')}
            placeholder={t('signup.passwordPlaceholder')}
            required
            mt="md"
            key={formHook.key('password')}
            {...formHook.getInputProps('password')}
          />
          <PasswordInput
            label={t('signup.confirmPassword')}
            placeholder={t('signup.confirmPasswordPlaceholder')}
            required
            mt="md"
            key={formHook.key('confirmPassword')}
            {...formHook.getInputProps('confirmPassword')}
          />

          <Group justify="flex-end" mt="md">
            <Button
              onClick={() => {
                navigate(routes.login.index);
              }}
              variant="subtle"
            >
              {t('signup.alreadyHaveAccount')}
            </Button>
          </Group>

          <Button
            fullWidth
            mt="xl"
            type="submit"
            leftSection={<IconArrowRight />}
          >
            {t('signup.submit')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default Signup;
