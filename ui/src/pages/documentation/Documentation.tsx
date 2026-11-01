import {
  Button,
  Container,
  Group,
  List,
  Paper,
  Text,
  Title,
  Accordion,
  Divider,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconChartPie,
  IconCoin,
  IconReportMoney,
  IconUser,
  IconSettings,
} from '@tabler/icons-react';
import classes from './Documentation.module.css';
import { useNavigate } from 'react-router';
import { routes } from '@routes';
import { useTranslation } from 'react-i18next';

/**
 * Documentation page for the Expenses application
 * Provides detailed documentation on how to use the application
 */
function Documentation() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  /**
   * Renders a translated array (stored as a JSON array in the translation file)
   * as a Mantine List
   */
  const renderList = (key: string) => {
    const items = t(key, { returnObjects: true }) as unknown as string[];
    return (
      <List withPadding>
        {items.map((item, index) => {
          return <List.Item key={index}>{item}</List.Item>;
        })}
      </List>
    );
  };

  const gettingStartedSteps = t('documentation.gettingStarted.steps', {
    returnObjects: true,
  }) as unknown as string[];

  return (
    <Container size="xl">
      {/* Header with back button */}
      <Group className={classes.headerButtons}>
        <Button
          variant="subtle"
          className={classes.navButton}
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => {
            return navigate(routes.home.index);
          }}
        >
          {t('documentation.backToHome')}
        </Button>
      </Group>

      {/* Hero section */}
      <div>
        <Title className={classes.title}>{t('documentation.title')}</Title>
        <Text className={classes.subtitle} c="dimmed">
          {t('documentation.subtitle')}
        </Text>
      </div>

      {/* Introduction */}
      <Paper shadow="md" p="xl" radius="md" withBorder mt={30}>
        <Text>{t('documentation.intro')}</Text>
      </Paper>

      {/* Getting Started */}
      <Title order={2} className={classes.sectionTitle}>
        {t('documentation.gettingStarted.title')}
      </Title>
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Text mb="md">{t('documentation.gettingStarted.intro')}</Text>

        {gettingStartedSteps.map((step, index) => {
          return (
            <div key={index} className={classes.instructionStep}>
              <Text>
                <span className={classes.stepNumber}>{index + 1}.</span> {step}
              </Text>
            </div>
          );
        })}
      </Paper>

      {/* Main Features */}
      <Title order={2} className={classes.sectionTitle}>
        {t('documentation.mainFeatures')}
      </Title>

      <Accordion>
        {/* Tracking Expenses */}
        <Accordion.Item value="expenses">
          <Accordion.Control icon={<IconCoin size={20} />}>
            <Text className={classes.featureTitle}>
              {t('documentation.features.expenses.title')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text className={classes.featureDescription}>
              {t('documentation.features.expenses.description')}
            </Text>

            <Title order={4} mt="md">
              {t('documentation.features.expenses.addTitle')}
            </Title>
            {renderList('documentation.features.expenses.addSteps')}

            <Title order={4} mt="md">
              {t('documentation.features.expenses.manageTitle')}
            </Title>
            {renderList('documentation.features.expenses.manageSteps')}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Monitoring Income */}
        <Accordion.Item value="income">
          <Accordion.Control icon={<IconReportMoney size={20} />}>
            <Text className={classes.featureTitle}>
              {t('documentation.features.income.title')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text className={classes.featureDescription}>
              {t('documentation.features.income.description')}
            </Text>

            <Title order={4} mt="md">
              {t('documentation.features.income.addTitle')}
            </Title>
            {renderList('documentation.features.income.addSteps')}

            <Title order={4} mt="md">
              {t('documentation.features.income.manageTitle')}
            </Title>
            {renderList('documentation.features.income.manageSteps')}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Visualizing Data */}
        <Accordion.Item value="statistics">
          <Accordion.Control icon={<IconChartPie size={20} />}>
            <Text className={classes.featureTitle}>
              {t('documentation.features.statistics.title')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text className={classes.featureDescription}>
              {t('documentation.features.statistics.description')}
            </Text>

            <Title order={4} mt="md">
              {t('documentation.features.statistics.viewTitle')}
            </Title>
            {renderList('documentation.features.statistics.viewSteps')}

            <Title order={4} mt="md">
              {t('documentation.features.statistics.viewsTitle')}
            </Title>
            {renderList('documentation.features.statistics.viewsSteps')}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Budget Management */}
        <Accordion.Item value="budget">
          <Accordion.Control icon={<IconUser size={20} />}>
            <Text className={classes.featureTitle}>
              {t('documentation.features.budget.title')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text className={classes.featureDescription}>
              {t('documentation.features.budget.description')}
            </Text>

            <Title order={4} mt="md">
              {t('documentation.features.budget.setupTitle')}
            </Title>
            {renderList('documentation.features.budget.setupSteps')}

            <Title order={4} mt="md">
              {t('documentation.features.budget.monitorTitle')}
            </Title>
            {renderList('documentation.features.budget.monitorSteps')}
          </Accordion.Panel>
        </Accordion.Item>

        {/* Profile Management */}
        <Accordion.Item value="profile">
          <Accordion.Control icon={<IconSettings size={20} />}>
            <Text className={classes.featureTitle}>
              {t('documentation.features.profile.title')}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text className={classes.featureDescription}>
              {t('documentation.features.profile.description')}
            </Text>

            <Title order={4} mt="md">
              {t('documentation.features.profile.updateTitle')}
            </Title>
            {renderList('documentation.features.profile.updateSteps')}

            <Title order={4} mt="md">
              {t('documentation.features.profile.manageTitle')}
            </Title>
            {renderList('documentation.features.profile.manageSteps')}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Tips and Best Practices */}
      <Title order={2} className={classes.sectionTitle}>
        {t('documentation.tips.title')}
      </Title>
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <List>
          <List.Item>
            <Text fw={500}>{t('documentation.tips.regularUpdates.title')}</Text>
            <Text>{t('documentation.tips.regularUpdates.text')}</Text>
          </List.Item>
          <Divider my="sm" />

          <List.Item>
            <Text fw={500}>
              {t('documentation.tips.detailedDescriptions.title')}
            </Text>
            <Text>{t('documentation.tips.detailedDescriptions.text')}</Text>
          </List.Item>
          <Divider my="sm" />

          <List.Item>
            <Text fw={500}>{t('documentation.tips.useCategories.title')}</Text>
            <Text>{t('documentation.tips.useCategories.text')}</Text>
          </List.Item>
          <Divider my="sm" />

          <List.Item>
            <Text fw={500}>
              {t('documentation.tips.reviewStatistics.title')}
            </Text>
            <Text>{t('documentation.tips.reviewStatistics.text')}</Text>
          </List.Item>
          <Divider my="sm" />

          <List.Item>
            <Text fw={500}>
              {t('documentation.tips.realisticBudgets.title')}
            </Text>
            <Text>{t('documentation.tips.realisticBudgets.text')}</Text>
          </List.Item>
        </List>
      </Paper>

      {/* Call to action */}
      <Paper shadow="md" p="xl" radius="md" withBorder mt={50} ta="center">
        <Title order={2} mb="md">
          {t('documentation.cta.title')}
        </Title>
        <Text size="lg" mb="xl">
          {t('documentation.cta.subtitle')}
        </Text>
        <Group justify="center">
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

export default Documentation;
