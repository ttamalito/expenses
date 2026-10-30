import {
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {
  IconArrowRight,
  IconChartPie,
  IconCoin,
  IconReportMoney,
  IconUser,
} from '@tabler/icons-react';
import classes from './ExpensesLandingPage.module.css';
import { useNavigate } from 'react-router';
import { routes } from '@routes';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher.tsx';

/**
 * Landing page for the Expenses application
 * Displays information about the application and provides login/signup options
 */
function ExpensesLandingPage() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Container size="xl">
      {/* Header with login/signup buttons */}
      <Group className={classes.headerButtons}>
        <LanguageSwitcher />
        <Button
          variant="subtle"
          className={classes.navButton}
          onClick={() => {
            return navigate(routes.documentation.index);
          }}
        >
          {t('landingPage.documentation')}
        </Button>
        <Button
          variant="subtle"
          className={classes.navButton}
          onClick={() => {
            return navigate(routes.login.index);
          }}
        >
          {t('landingPage.login')}
        </Button>
        <Button
          variant="filled"
          className={classes.navButton}
          onClick={() => {
            return navigate(routes.register.index);
          }}
        >
          {t('landingPage.signUp')}
        </Button>
      </Group>

      {/* Hero section */}
      <div className={classes.hero}>
        <Title className={classes.title}>Manage Your Finances with Ease</Title>
        <Text className={classes.subtitle} c="dimmed">
          Track expenses, monitor income, and take control of your financial
          future
        </Text>
        <Button
          size="lg"
          leftSection={<IconArrowRight />}
          onClick={() => {
            return navigate(routes.register.index);
          }}
        >
          Get Started
        </Button>
      </div>

      {/* Features section */}
      <Grid gutter="xl" mt={50}>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconCoin size={40} color={theme.colors.blue[6]} />
            <Text className={classes.featureTitle}>Track Expenses</Text>
            <Text className={classes.featureDescription}>
              Easily record and categorize your daily expenses to understand
              where your money goes.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconReportMoney size={40} color={theme.colors.green[6]} />
            <Text className={classes.featureTitle}>Monitor Income</Text>
            <Text className={classes.featureDescription}>
              Keep track of all your income sources and see your earnings over
              time.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconChartPie size={40} color={theme.colors.violet[6]} />
            <Text className={classes.featureTitle}>Visualize Data</Text>
            <Text className={classes.featureDescription}>
              View detailed charts and statistics to gain insights into your
              financial habits.
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconUser size={40} color={theme.colors.orange[6]} />
            <Text className={classes.featureTitle}>Personalized Budget</Text>
            <Text className={classes.featureDescription}>
              Create custom budgets tailored to your financial goals and
              lifestyle.
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Call to action */}
      <Paper shadow="md" p="xl" radius="md" withBorder mt={50} ta="center">
        <Title order={2} mb="md">
          Ready to take control of your finances?
        </Title>
        <Text size="lg" mb="xl">
          Join thousands of users who have improved their financial well-being
          with our platform.
        </Text>
        <Group justify="center">
          <Button
            size="lg"
            onClick={() => {
              return navigate(routes.documentation.index);
            }}
            variant="light"
          >
            View Documentation
          </Button>
          <Button
            size="lg"
            onClick={() => {
              return navigate(routes.login.index);
            }}
            variant="outline"
          >
            {t('landingPage.login')}
          </Button>
          <Button
            size="lg"
            onClick={() => {
              return navigate(routes.register.index);
            }}
          >
            {t('landingPage.createAccount')}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default ExpensesLandingPage;
