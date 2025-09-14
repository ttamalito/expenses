import { useEffect, useState, useCallback } from 'react';
import { DonutChart } from '@mantine/charts';
import { Paper, Title, Text, Box, Loader, Center, Group } from '@mantine/core';
import { useGetTotalSpentMonthly } from '@requests/expensesRequests';
import { useGetBudget } from '@requests/budgetRequests';

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
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budget, setBudget] = useState(0);

  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getBudget] = useGetBudget();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

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
      const budgetAmount = totalBudget;
      setBudget(budgetAmount);

      // Calculate remaining budget (or overspent amount)
      const remaining = Math.max(0, budgetAmount - spent);
      const overspent = spent > budgetAmount ? spent - budgetAmount : 0;

      const newChartData: ChartData[] = [];

      if (spent <= budgetAmount) {
        // If within budget
        newChartData.push({
          name: 'Spent',
          value: spent,
          color: 'blue',
        });
        newChartData.push({
          name: 'Remaining',
          value: remaining,
          color: 'teal',
        });
      } else {
        // If over budget
        newChartData.push({
          name: 'Budget',
          value: budgetAmount,
          color: 'red',
        });
        newChartData.push({
          name: 'Overspent',
          value: overspent,
          color: 'orange',
        });
      }

      setChartData(newChartData);
    } catch (err) {
      setError('Failed to load budget data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [updateChart]);

  if (loading) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Title order={3} mb="md">
          Monthly Budget
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
          Monthly Budget
        </Title>
        <Center style={{ height: 300 }}>
          <Text c="red">{error}</Text>
        </Center>
      </Paper>
    );
  }

  const percentSpent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
  const isOverBudget = totalSpent > budget;

  return (
    <Paper p="md" radius="md" withBorder>
      <Title order={3} mb="md">
        Monthly Budget
      </Title>
      <Group justify="space-between" mb="md">
        <Text>Spent: ${totalSpent.toFixed(2)}</Text>
        <Text>Budget: ${budget.toFixed(2)}</Text>
        <Text c={isOverBudget ? 'red' : 'green'}>
          {isOverBudget ? 'Over budget: ' : 'Remaining: '}
          {Math.abs(budget - totalSpent).toFixed(2)} ({percentSpent}%)
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
