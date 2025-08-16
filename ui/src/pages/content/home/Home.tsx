import { Grid, Container, Title } from '@mantine/core';
import HomeLineChart from './charts/HomeLineChart';
import HomeDonutBudgetChart from './charts/HomeDonutBudgetChart';
import AddExpense from './forms/AddExpense';
import AddIncome from './forms/AddIncome';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

export default function Home() {
  const { userTags } = useUserDataContext();
  return (
    <Container fluid>
      <Title order={1} mb="xl">
        Dashboard
      </Title>

      {/* Charts Row */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <HomeLineChart />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <HomeDonutBudgetChart />
        </Grid.Col>
      </Grid>

      {/* Forms Row */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <AddExpense tagsDto={userTags} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <AddIncome tagsDto={userTags} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}
