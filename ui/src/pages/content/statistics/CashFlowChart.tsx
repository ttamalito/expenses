import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Title,
  Text,
  Group,
  NumberInput,
  Button,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useGetTotalSpentMonthly } from '@requests/expensesRequests.ts';
import {
  useGetTotalEarnedMonth,
  useGetEarnedYearMonthly,
} from '@requests/incomesRequests.ts';
import { notifications } from '@mantine/notifications';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface CashFlowData {
  monthIndex: number; // 1-12
  inflow: number;
  outflow: number;
  netFlow: number;
}

const CashFlowChart: React.FC = () => {
  const { t } = useTranslation();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);

  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getTotalEarnedMonth] = useGetTotalEarnedMonth();
  const [getEarnedYearMonthly] = useGetEarnedYearMonthly();

  const { userData } = useUserDataContext();

  // Translate the month labels at render time so a language switch
  // updates the chart without refetching
  const chartData = useMemo(() => {
    return cashFlowData.map((entry) => {
      return {
        ...entry,
        month: t(`statistics.months.short.${entry.monthIndex}`),
      };
    });
  }, [cashFlowData, t]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get monthly income data for the year
      const earnedResponse = await getEarnedYearMonthly(year);
      let monthlyIncome: number[] = [];

      if (earnedResponse?.data && earnedResponse.data.totals) {
        monthlyIncome = earnedResponse.data.totals.map((total: string) => {
          return parseFloat(total);
        });
      } else {
        // Fallback: fetch each month individually
        monthlyIncome = await Promise.all(
          Array.from({ length: 12 }, async (_, i) => {
            const month = i + 1;
            const response = await getTotalEarnedMonth(month, year);
            return response?.data?.total || 0;
          }),
        );
      }

      // Get monthly expense data for the year
      const monthlyExpenses = await Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const month = i + 1;
          const response = await getTotalSpentMonthly(month, year);
          return response?.data?.totalSpent || 0;
        }),
      );

      // Calculate cash flow data
      const data: CashFlowData[] = Array.from({ length: 12 }, (_, index) => {
        const inflow = monthlyIncome[index] || 0;
        const outflow = monthlyExpenses[index] || 0;
        const netFlow = inflow - outflow;

        return {
          monthIndex: index + 1,
          inflow,
          outflow,
          netFlow,
        };
      });

      setCashFlowData(data);
    } catch (error) {
      console.error('Failed to fetch cash flow data:', error);
      notifications.show({
        title: t('statistics.common.errorTitle'),
        message: t('statistics.cashFlow.error'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  const handleYearChange = (value: string | number) => {
    if (value) {
      setYear(Number(value));
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>{t('statistics.cashFlow.title')}</Title>
          <Group>
            <NumberInput
              label={t('statistics.common.year')}
              value={year}
              onChange={handleYearChange}
              min={2000}
              max={2100}
              w={120}
            />
            <Button onClick={handleRefresh} mt={25}>
              {t('statistics.common.refresh')}
            </Button>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          {t('statistics.cashFlow.description')}
        </Text>

        {loading ? (
          <Center h={300}>
            <Loader />
          </Center>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  return [
                    `${userData?.currency?.symbol}${Number(value).toFixed(2)}`,
                    name,
                  ];
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Area
                type="monotone"
                dataKey="inflow"
                name={t('statistics.cashFlow.income')}
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="outflow"
                name={t('statistics.cashFlow.expenses')}
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="netFlow"
                name={t('statistics.cashFlow.netCashFlow')}
                stroke="#ff7300"
                fill="#ff7300"
                fillOpacity={0.3}
                activeDot={{ r: 8 }}
              />
              {chartData.map((entry, index) => {
                return entry.netFlow < 0 ? (
                  <ReferenceLine
                    key={`ref-${index}`}
                    x={entry.month}
                    stroke="red"
                    strokeOpacity={0.3}
                    strokeWidth={20}
                  />
                ) : null;
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Stack>
    </Paper>
  );
};

export default CashFlowChart;
