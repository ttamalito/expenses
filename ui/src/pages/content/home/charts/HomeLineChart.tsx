import { useEffect, useState, useCallback } from 'react';
import { LineChart } from '@mantine/charts';
import { Paper, Title, Text, Box, Loader, Center } from '@mantine/core';
import { useGetTotalSpentMonthly } from '@requests/expensesRequests';
import { useGetTotalEarnedMonth } from '@requests/incomesRequests';

interface ChartData extends Record<string, any> {
  month: string;
  spent: number;
  earned: number;
}

interface HomeLineChartProps {
  updateChart: boolean;
}

export default function HomeLineChart({ updateChart }: HomeLineChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getTotalEarnedMonth] = useGetTotalEarnedMonth();

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentYear = new Date().getFullYear();
      const newChartData: ChartData[] = [];

      // Initialize data structure with all months
      for (let i = 0; i < 12; i++) {
        newChartData.push({
          month: monthNames[i],
          spent: 0,
          earned: 0,
        });
      }

      // Fetch spent data for each month
      for (let month = 1; month <= 12; month++) {
        const spentResponse = await getTotalSpentMonthly(month, currentYear);
        if (spentResponse?.data) {
          newChartData[month - 1].spent = parseFloat(
            spentResponse.data.totalSpent,
          );
        }
      }

      // Fetch earned data for each month
      for (let month = 1; month <= 12; month++) {
        const earnedResponse = await getTotalEarnedMonth(month, currentYear);
        if (earnedResponse?.data) {
          newChartData[month - 1].earned = parseFloat(
            earnedResponse.data.total,
          );
        }
      }

      setChartData(newChartData);
    } catch (err) {
      setError('Failed to load chart data');
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
          Monthly Expenses & Income
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
          Monthly Expenses & Income
        </Title>
        <Center style={{ height: 300 }}>
          <Text c="red">{error}</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Title order={3} mb="md">
        Monthly Expenses & Income
      </Title>
      <Box h={300}>
        <LineChart
          // one of the props HAS to be a percentage string
          h={'100%'}
          data={chartData}
          dataKey="month"
          series={[
            { name: 'spent', color: 'red' },
            { name: 'earned', color: 'green' },
          ]}
          curveType="linear"
          withLegend
          legendProps={{ verticalAlign: 'bottom', height: 40 }}
        />
      </Box>
    </Paper>
  );
}
