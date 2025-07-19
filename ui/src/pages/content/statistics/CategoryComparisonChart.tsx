import React, { useState, useEffect } from 'react';
import { BarChart } from '@mantine/charts';
import {
  Paper,
  Title,
  Text,
  Group,
  Select,
  Button,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCompareCategories } from '@requests/expensesRequests.ts';

interface FormValues {
  currentPeriodType: string;
  currentPeriodValue: string;
  previousPeriodType: string;
  previousPeriodValue: string;
  currentYear?: string;
  previousYear?: string;
}

interface CategoryComparisonData {
  categoryId: number;
  categoryName: string;
  currentPeriodAmount: number;
  previousPeriodAmount: number;
  difference: number;
  percentageChange: number;
}

interface ComparisonResponse {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  categories: CategoryComparisonData[];
  totalCurrentPeriod: number;
  totalPreviousPeriod: number;
  totalDifference: number;
  totalPercentageChange: number;
}

const CategoryComparisonChart: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [comparisonData, setComparisonData] =
    useState<ComparisonResponse | null>(null);
  const [chartData, setChartData] = useState<
    { category: string; [key: string]: string | number }[]
  >([]);

  const [compareCategories] = useCompareCategories();

  const form = useForm<FormValues>({
    initialValues: {
      currentPeriodType: 'month',
      currentPeriodValue: new Date().getMonth() + 1 + '',
      previousPeriodType: 'month',
      previousPeriodValue:
        new Date().getMonth() === 0 ? '12' : new Date().getMonth() + '',
      currentYear: new Date().getFullYear() + '',
      previousYear:
        new Date().getMonth() === 0
          ? new Date().getFullYear() - 1 + ''
          : new Date().getFullYear() + '',
    },
    validate: {
      currentPeriodValue: (value) => {
        if (!value) return 'Current period value is required';
        if (
          form.values.currentPeriodType === 'month' &&
          (parseInt(value) < 1 || parseInt(value) > 12)
        ) {
          return 'Month must be between 1 and 12';
        }
        return null;
      },
      previousPeriodValue: (value) => {
        if (!value) return 'Previous period value is required';
        if (
          form.values.previousPeriodType === 'month' &&
          (parseInt(value) < 1 || parseInt(value) > 12)
        ) {
          return 'Month must be between 1 and 12';
        }
        return null;
      },
      currentYear: (value, values) => {
        if (values.currentPeriodType === 'month' && !value) {
          return 'Current year is required for monthly comparison';
        }
        return null;
      },
      previousYear: (value, values) => {
        if (values.previousPeriodType === 'month' && !value) {
          return 'Previous year is required for monthly comparison';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (comparisonData) {
      // Transform the data for the BarChart component
      const transformedData = comparisonData.categories.map((category) => {
        return {
          category: category.categoryName,
          [comparisonData.currentPeriodLabel]: category.currentPeriodAmount,
          [comparisonData.previousPeriodLabel]: category.previousPeriodAmount,
        };
      });

      setChartData(transformedData);
    }
  }, [comparisonData]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await compareCategories(
        values.currentPeriodType,
        parseInt(values.currentPeriodValue),
        values.previousPeriodType,
        parseInt(values.previousPeriodValue),
        values.currentYear ? parseInt(values.currentYear) : undefined,
        values.previousYear ? parseInt(values.previousYear) : undefined,
      );

      if (response?.data) {
        setComparisonData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load category comparison data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={4} mb="md">
        Category Comparison
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
            <Stack>
              <Title order={6}>Current Period</Title>
              <Select
                label="Period Type"
                placeholder="Select period type"
                data={[
                  { value: 'month', label: 'Month' },
                  { value: 'year', label: 'Year' },
                ]}
                {...form.getInputProps('currentPeriodType')}
              />

              {form.values.currentPeriodType === 'month' ? (
                <>
                  <Select
                    label="Month"
                    placeholder="Select month"
                    data={[
                      { value: '1', label: 'January' },
                      { value: '2', label: 'February' },
                      { value: '3', label: 'March' },
                      { value: '4', label: 'April' },
                      { value: '5', label: 'May' },
                      { value: '6', label: 'June' },
                      { value: '7', label: 'July' },
                      { value: '8', label: 'August' },
                      { value: '9', label: 'September' },
                      { value: '10', label: 'October' },
                      { value: '11', label: 'November' },
                      { value: '12', label: 'December' },
                    ]}
                    {...form.getInputProps('currentPeriodValue')}
                  />

                  <Select
                    label="Year"
                    placeholder="Select year"
                    data={Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return { value: year.toString(), label: year.toString() };
                    })}
                    {...form.getInputProps('currentYear')}
                  />
                </>
              ) : (
                <Select
                  label="Year"
                  placeholder="Select year"
                  data={Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return { value: year.toString(), label: year.toString() };
                  })}
                  {...form.getInputProps('currentPeriodValue')}
                />
              )}
            </Stack>

            <Stack>
              <Title order={6}>Previous Period</Title>
              <Select
                label="Period Type"
                placeholder="Select period type"
                data={[
                  { value: 'month', label: 'Month' },
                  { value: 'year', label: 'Year' },
                ]}
                {...form.getInputProps('previousPeriodType')}
              />

              {form.values.previousPeriodType === 'month' ? (
                <>
                  <Select
                    label="Month"
                    placeholder="Select month"
                    data={[
                      { value: '1', label: 'January' },
                      { value: '2', label: 'February' },
                      { value: '3', label: 'March' },
                      { value: '4', label: 'April' },
                      { value: '5', label: 'May' },
                      { value: '6', label: 'June' },
                      { value: '7', label: 'July' },
                      { value: '8', label: 'August' },
                      { value: '9', label: 'September' },
                      { value: '10', label: 'October' },
                      { value: '11', label: 'November' },
                      { value: '12', label: 'December' },
                    ]}
                    {...form.getInputProps('previousPeriodValue')}
                  />

                  <Select
                    label="Year"
                    placeholder="Select year"
                    data={Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return { value: year.toString(), label: year.toString() };
                    })}
                    {...form.getInputProps('previousYear')}
                  />
                </>
              ) : (
                <Select
                  label="Year"
                  placeholder="Select year"
                  data={Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return { value: year.toString(), label: year.toString() };
                  })}
                  {...form.getInputProps('previousPeriodValue')}
                />
              )}
            </Stack>
          </Group>

          <Button type="submit" loading={loading}>
            Compare
          </Button>
        </Stack>
      </form>

      {loading && (
        <Center h={400}>
          <Loader size="xl" />
        </Center>
      )}

      {!loading && comparisonData && (
        <>
          <Title order={5} mt="xl" mb="md">
            {comparisonData.currentPeriodLabel} vs{' '}
            {comparisonData.previousPeriodLabel}
          </Title>

          {chartData.length > 0 ? (
            <BarChart
              h={400}
              data={chartData}
              dataKey="category"
              series={[
                { name: comparisonData.currentPeriodLabel, color: '#4CAF50' },
                { name: comparisonData.previousPeriodLabel, color: '#2196F3' },
              ]}
              withLegend
              withTooltip
            />
          ) : (
            <Text>No comparison data available</Text>
          )}

          <Group justify={'space-between'} mt="xl">
            <Stack gap="xs">
              <Text fw={500}>
                Total for {comparisonData.currentPeriodLabel}
              </Text>
              <Text size="xl" fw={700}>
                ${comparisonData.totalCurrentPeriod.toFixed(2)}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text fw={500}>
                Total for {comparisonData.previousPeriodLabel}
              </Text>
              <Text size="xl" fw={700}>
                ${comparisonData.totalPreviousPeriod.toFixed(2)}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text fw={500}>Difference</Text>
              <Text
                size="xl"
                fw={700}
                c={comparisonData.totalDifference >= 0 ? 'red' : 'green'}
              >
                ${comparisonData.totalDifference.toFixed(2)}(
                {comparisonData.totalPercentageChange >= 0 ? '+' : ''}
                {comparisonData.totalPercentageChange.toFixed(2)}%)
              </Text>
            </Stack>
          </Group>
        </>
      )}
    </Paper>
  );
};

export default CategoryComparisonChart;
