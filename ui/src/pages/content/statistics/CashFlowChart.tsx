import React, { useEffect, useState } from 'react';
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

interface CashFlowData {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

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

const CashFlowChart: React.FC = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);

  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getTotalEarnedMonth] = useGetTotalEarnedMonth();
  const [getEarnedYearMonthly] = useGetEarnedYearMonthly();

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
      const data: CashFlowData[] = monthNames.map((month, index) => {
        const inflow = monthlyIncome[index] || 0;
        const outflow = monthlyExpenses[index] || 0;
        const netFlow = inflow - outflow;

        return {
          month,
          inflow,
          outflow,
          netFlow,
        };
      });

      setCashFlowData(data);
    } catch (error) {
      console.error('Failed to fetch cash flow data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load cash flow data',
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
          <Title order={4}>Cash Flow Visualization</Title>
          <Group>
            <NumberInput
              label="Year"
              value={year}
              onChange={handleYearChange}
              min={2000}
              max={2100}
              w={120}
            />
            <Button onClick={handleRefresh} mt={25}>
              Refresh
            </Button>
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          This chart shows your income (inflow) vs. expenses (outflow) over
          time. Months with negative cash flow are highlighted.
        </Text>

        {loading ? (
          <Center h={300}>
            <Loader />
          </Center>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={cashFlowData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  return [`$${Number(value).toFixed(2)}`, name];
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Area
                type="monotone"
                dataKey="inflow"
                name="Income"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="outflow"
                name="Expenses"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="netFlow"
                name="Net Cash Flow"
                stroke="#ff7300"
                fill="#ff7300"
                fillOpacity={0.3}
                activeDot={{ r: 8 }}
              />
              {cashFlowData.map((entry, index) => {
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
