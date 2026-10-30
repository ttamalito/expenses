import { useEffect, useState, useCallback, useMemo } from 'react';
import { LineChart } from '@mantine/charts';
import { Paper, Title, Text, Box, Loader, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useGetTotalSpentMonthly } from '@requests/expensesRequests';
import { useGetTotalEarnedMonth } from '@requests/incomesRequests';

interface MonthlyValues {
  spent: number;
  earned: number;
}

interface HomeLineChartProps {
  updateChart: boolean;
}

export default function HomeLineChart({ updateChart }: HomeLineChartProps) {
  const { t, i18n } = useTranslation();
  const [values, setValues] = useState<MonthlyValues[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getTotalEarnedMonth] = useGetTotalEarnedMonth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const currentYear = new Date().getFullYear();
      const newValues: MonthlyValues[] = [];

      // Initialize data structure with all months
      for (let i = 0; i < 12; i++) {
        newValues.push({ spent: 0, earned: 0 });
      }

      // Fetch spent data for each month
      for (let month = 1; month <= 12; month++) {
        const spentResponse = await getTotalSpentMonthly(month, currentYear);
        if (spentResponse?.data) {
          newValues[month - 1].spent = parseFloat(
            spentResponse.data.totalSpent,
          );
        }
      }

      // Fetch earned data for each month
      for (let month = 1; month <= 12; month++) {
        const earnedResponse = await getTotalEarnedMonth(month, currentYear);
        if (earnedResponse?.data) {
          newValues[month - 1].earned = parseFloat(earnedResponse.data.total);
        }
      }

      setValues(newValues);
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

  // Month labels depend on the active language, so they are built at render time
  const chartData = useMemo(() => {
    return values.map((value, index) => {
      const label = new Date(2000, index, 1).toLocaleDateString(
        i18n.resolvedLanguage,
        { month: 'short' },
      );
      return {
        month: label.charAt(0).toUpperCase() + label.slice(1),
        spent: value.spent,
        earned: value.earned,
      };
    });
  }, [values, i18n.resolvedLanguage]);

  if (loading) {
    return (
      <Paper p="md" radius="md" withBorder>
        <Title order={3} mb="md">
          {t('home.lineChart.title')}
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
          {t('home.lineChart.title')}
        </Title>
        <Center style={{ height: 300 }}>
          <Text c="red">{t('home.lineChart.error')}</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <Title order={3} mb="md">
        {t('home.lineChart.title')}
      </Title>
      <Box h={300}>
        <LineChart
          // one of the props HAS to be a percentage string
          h={'100%'}
          data={chartData}
          dataKey="month"
          series={[
            {
              name: 'spent',
              label: t('home.lineChart.spent'),
              color: 'red.6',
            },
            {
              name: 'earned',
              label: t('home.lineChart.earned'),
              color: 'teal.6',
            },
          ]}
          curveType="linear"
          withLegend
          legendProps={{ verticalAlign: 'bottom', height: 40 }}
        />
      </Box>
    </Paper>
  );
}
