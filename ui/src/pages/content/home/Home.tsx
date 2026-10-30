import { Grid, Container, Title, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import HomeLineChart from './charts/HomeLineChart';
import HomeDonutBudgetChart from './charts/HomeDonutBudgetChart';
import AddTransaction from './forms/AddTransaction';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import { useState } from 'react';

export default function Home() {
  const { t, i18n } = useTranslation();
  const { userTags } = useUserDataContext();
  const [updateCharts, setUpdateCharts] = useState<boolean>(false);

  // e.g. "October 2026" (en) / "Octubre de 2026" (es)
  const monthAndYear = new Date().toLocaleDateString(i18n.resolvedLanguage, {
    month: 'long',
    year: 'numeric',
  });
  const formattedMonthAndYear =
    monthAndYear.charAt(0).toUpperCase() + monthAndYear.slice(1);

  return (
    <Container fluid>
      <Title order={1}>{t('home.title')}</Title>
      <Text size="lg" c="dimmed" mb="lg">
        {formattedMonthAndYear}
      </Text>

      {/* Charts Row */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <HomeLineChart updateChart={updateCharts} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <HomeDonutBudgetChart updateChart={updateCharts} />
        </Grid.Col>
      </Grid>

      {/* Forms Row */}
      <Grid>
        <Grid.Col span={12}>
          <AddTransaction
            tagsDto={userTags}
            setUpdateCharts={setUpdateCharts}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
