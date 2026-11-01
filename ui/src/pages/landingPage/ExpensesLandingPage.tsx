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
        <Title className={classes.title}>{t('landingPage.title')}</Title>
        <Text className={classes.subtitle} c="dimmed">
          {t('landingPage.subtitle')}
        </Text>
        <Button
          size="lg"
          leftSection={<IconArrowRight />}
          onClick={() => {
            return navigate(routes.register.index);
          }}
        >
          {t('landingPage.getStarted')}
        </Button>
      </div>

      {/* Features section */}
      <Grid gutter="xl" mt={50}>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconCoin size={40} color={theme.colors.blue[6]} />
            <Text className={classes.featureTitle}>
              {t('landingPage.features.trackExpenses.title')}
            </Text>
            <Text className={classes.featureDescription}>
              {t('landingPage.features.trackExpenses.description')}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconReportMoney size={40} color={theme.colors.green[6]} />
            <Text className={classes.featureTitle}>
              {t('landingPage.features.monitorIncome.title')}
            </Text>
            <Text className={classes.featureDescription}>
              {t('landingPage.features.monitorIncome.description')}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconChartPie size={40} color={theme.colors.violet[6]} />
            <Text className={classes.featureTitle}>
              {t('landingPage.features.visualizeData.title')}
            </Text>
            <Text className={classes.featureDescription}>
              {t('landingPage.features.visualizeData.description')}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <IconUser size={40} color={theme.colors.orange[6]} />
            <Text className={classes.featureTitle}>
              {t('landingPage.features.personalizedBudget.title')}
            </Text>
            <Text className={classes.featureDescription}>
              {t('landingPage.features.personalizedBudget.description')}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Call to action */}
      <Paper shadow="md" p="xl" radius="md" withBorder mt={50} ta="center">
        <Title order={2} mb="md">
          {t('landingPage.cta.title')}
        </Title>
        <Text size="lg" mb="xl">
          {t('landingPage.cta.subtitle')}
        </Text>
        <Group justify="center">
          <Button
            size="lg"
            onClick={() => {
              return navigate(routes.documentation.index);
            }}
            variant="light"
          >
            {t('landingPage.cta.viewDocumentation')}
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
