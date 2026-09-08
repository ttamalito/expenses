import { Grid, Container, Title, Text } from '@mantine/core';
import HomeLineChart from './charts/HomeLineChart';
import HomeDonutBudgetChart from './charts/HomeDonutBudgetChart';
import AddTransaction from './forms/AddTransaction';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import { useState } from 'react';
import getCurrentMonthAndYear from '../../../utils/getCurrentMonthAndYear.ts';

export default function Home() {
  const { userTags } = useUserDataContext();
  const [updateCharts, setUpdateCharts] = useState<boolean>(false);
  return (
    <Container fluid>
      <Title order={1}>Dashboard</Title>
      <Text size="lg" c="dimmed" mb="lg">
        {getCurrentMonthAndYear()}
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
