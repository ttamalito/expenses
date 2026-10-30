import { useEffect, useState, useCallback, useMemo } from 'react';
import { DonutChart } from '@mantine/charts';
import { Paper, Title, Text, Box, Loader, Center, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useGetTotalSpentMonthly } from '@requests/expensesRequests';
import { useGetBudget } from '@requests/budgetRequests';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface HomeDonutBudgetChartProps {
  updateChart: boolean;
}

export default function HomeDonutBudgetChart({
  updateChart,
}: HomeDonutBudgetChartProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budget, setBudget] = useState(0);

  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getBudget] = useGetBudget();

  const { userData } = useUserDataContext();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = currentDate.getFullYear();

      // Fetch total spent for current month
      const spentResponse = await getTotalSpentMonthly(
        currentMonth,
        currentYear,
      );
      const spent = spentResponse?.data
        ? parseFloat(spentResponse.data.totalSpent)
        : 0;
      setTotalSpent(spent);

      // Fetch budget
      const budgetResponse = await getBudget();
      const budgets: any[] = budgetResponse?.data.budget;
      console.log(budgetResponse);
      const totalBudget: number = budgets.reduce(
        (accumulator, currentValue) => {
          return accumulator + currentValue.budget;
        },
        0,
      );
      setBudget(totalBudget);
    } catch (err) {
      setError(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [updateChart]);

  // Slice names depend on the active language, so they are built at render time
  const chartData = useMemo<ChartData[]>(() => {
    if (totalSpent <= budget) {
      // Within budget
      return [
        {
          name: t('home.budgetChart.slices.spent'),
          value: totalSpent,
          color: 'blue.6',
        },
        {
          name: t('home.budgetChart.slices.remaining'),
          value: Math.max(0, budget - totalSpent),
          color: 'teal.6',
        },
      ];
    }
    // Over budget
    return [
      {
        name: t('home.budgetChart.slices.budget'),
        value: budget,
        color: 'red.6',
      },
      {
        name: t('home.budgetChart.slices.overspent'),
        value: totalSpent - budget,
        color: 'amber.6',
      },
    ];
  }, [totalSpent, budget, t]);

  if (loading) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Title order={3} mb="md">
          {t('home.budgetChart.title')}
        </Title>
        <Center style={{ height: 300 }}>
          <Loader />
        </Center>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Title order={3} mb="md">
          {t('home.budgetChart.title')}
        </Title>
        <Center style={{ height: 300 }}>
          <Text c="red">{t('home.budgetChart.error')}</Text>
        </Center>
      </Paper>
    );
  }

  const percentSpent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
  const isOverBudget = totalSpent > budget;
  const symbol = userData?.currency?.symbol ?? '';
  const difference = Math.abs(budget - totalSpent).toFixed(2);

  return (
    <Paper p="md" radius="md" withBorder>
      <Title order={3} mb="md">
        {t('home.budgetChart.title')}
      </Title>
      <Group justify="space-between" mb="md">
        <Text>
          {t('home.budgetChart.spentAmount', {
            symbol,
            amount: totalSpent.toFixed(2),
          })}
        </Text>
        <Text>
          {t('home.budgetChart.budgetAmount', {
            symbol,
            amount: budget.toFixed(2),
          })}
        </Text>
        <Text c={isOverBudget ? 'red' : 'green'}>
          {isOverBudget
            ? t('home.budgetChart.overBudgetAmount', {
                amount: difference,
                percent: percentSpent,
              })
            : t('home.budgetChart.remainingAmount', {
                amount: difference,
                percent: percentSpent,
              })}
        </Text>
      </Group>
      <Box style={{ height: 250 }}>
        <DonutChart
          // one of the props HAS to be a percentage string
          h={'100%'}
          ml={100}
          data={chartData}
          withLabels
          //labelsPosition="inside"
          labelsType="percent"
          thickness={30}
          //size={150}
        />
      </Box>
    </Paper>
  );
}
