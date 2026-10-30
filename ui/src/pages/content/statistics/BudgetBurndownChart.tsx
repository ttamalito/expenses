import React, { useEffect, useState } from 'react';
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
  Select,
} from '@mantine/core';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  useGetBudgetBurndown,
  BudgetBurndownData,
  CategoryBurndownData,
} from '@requests/budgetRequests.ts';
import { notifications } from '@mantine/notifications';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface ChartDataPoint {
  day: number;
  remaining: number;
  spent: number;
  categoryName: string;
}

const BudgetBurndownChart: React.FC = () => {
  const { t } = useTranslation();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // JavaScript months are 0-indexed
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [burndownData, setBurndownData] = useState<BudgetBurndownData | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const [getBudgetBurndown] = useGetBudgetBurndown();

  const { userData } = useUserDataContext();

  // The "All Categories" entry (id -1) comes from the backend with an
  // English name, so it is translated here
  const getCategoryName = (category: CategoryBurndownData): string => {
    return category.categoryId === -1
      ? t('statistics.budgetBurndown.allCategories')
      : category.categoryName;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getBudgetBurndown(month, year);
      if (response?.data) {
        setBurndownData(response.data);

        // If we have categories and no category is selected, select "All Categories" (which has id -1)
        if (response.data.categories.length > 0 && !selectedCategory) {
          // Find the "All Categories" option (it should be the first one with id -1)
          const allCategoriesOption = response.data.categories.find((c) => {
            return c.categoryId === -1;
          });
          if (allCategoriesOption) {
            setSelectedCategory('-1');
            prepareChartData(allCategoriesOption);
          } else if (response.data.categories.length > 0) {
            // Fallback to the first category if "All Categories" is not found
            setSelectedCategory(
              response.data.categories[0].categoryId.toString(),
            );
            prepareChartData(response.data.categories[0]);
          }
        } else if (selectedCategory) {
          // Find the selected category in the new data
          const category = response.data.categories.find((c) => {
            return c.categoryId.toString() === selectedCategory;
          });
          if (category) {
            prepareChartData(category);
          } else if (response.data.categories.length > 0) {
            // If the selected category is not in the new data, select "All Categories"
            const allCategoriesOption = response.data.categories.find((c) => {
              return c.categoryId === -1;
            });
            if (allCategoriesOption) {
              setSelectedCategory('-1');
              prepareChartData(allCategoriesOption);
            } else {
              // Fallback to the first category if "All Categories" is not found
              setSelectedCategory(
                response.data.categories[0].categoryId.toString(),
              );
              prepareChartData(response.data.categories[0]);
            }
          } else {
            setChartData([]);
          }
        } else {
          setChartData([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch budget burndown data:', error);
      notifications.show({
        title: t('statistics.common.errorTitle'),
        message: t('statistics.budgetBurndown.error'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (category: CategoryBurndownData) => {
    const data: ChartDataPoint[] = [];

    // Get all days from the dailySpending object
    const days = Object.keys(category.dailySpending)
      .map(Number)
      .sort((a, b) => {
        return a - b;
      });

    // Create a data point for each day
    for (const day of days) {
      data.push({
        day,
        remaining: category.remainingBudget[day],
        spent: category.dailySpending[day],
        categoryName: category.categoryName,
      });
    }

    setChartData(data);
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  useEffect(() => {
    if (burndownData && selectedCategory) {
      const category = burndownData.categories.find((c) => {
        return c.categoryId.toString() === selectedCategory;
      });
      if (category) {
        prepareChartData(category);
      }
    }
  }, [selectedCategory, burndownData]);

  const handleMonthChange = (value: string | null) => {
    if (value) {
      setMonth(Number(value));
    }
  };

  const handleYearChange = (value: string | number) => {
    if (value) {
      setYear(Number(value));
    }
  };

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>{t('statistics.budgetBurndown.title')}</Title>
          <Group>
            <Select
              label={t('statistics.common.month')}
              value={month.toString()}
              onChange={handleMonthChange}
              data={Array.from({ length: 12 }, (_, i) => {
                return {
                  value: (i + 1).toString(),
                  label: t(`statistics.months.long.${i + 1}`),
                };
              })}
              w={150}
            />
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
          {t('statistics.budgetBurndown.description')}
        </Text>

        {burndownData && burndownData.categories.length > 0 ? (
          <Select
            label={t('statistics.common.category')}
            value={selectedCategory}
            onChange={handleCategoryChange}
            data={burndownData.categories
              // Filter out categories with 0 spent, except for "All Categories" (id -1)
              .filter((category) => {
                return category.totalSpent > 0 || category.categoryId === -1;
              })
              .map((category) => {
                return {
                  value: category.categoryId.toString(), // TODO: label produces NaN when there are no categories
                  label: t('statistics.budgetBurndown.categoryUsed', {
                    name: getCategoryName(category),
                    percent: (
                      (category.totalSpent / category.budget) *
                      100
                    ).toFixed(1),
                  }),
                };
              })}
            w={300}
          />
        ) : null}

        {loading ? (
          <Center h={300}>
            <Loader />
          </Center>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{
                  value: t('statistics.budgetBurndown.dayOfMonth'),
                  position: 'insideBottomRight',
                  offset: -10,
                }}
              />
              <YAxis
                label={{
                  value: t('statistics.budgetBurndown.amountAxis', {
                    symbol: userData?.currency?.symbol,
                  }),
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip
                formatter={(value, name) => {
                  return [
                    `${userData?.currency?.symbol}${Number(value).toFixed(2)}`,
                    name,
                  ];
                }}
                labelFormatter={(label) => {
                  return t('statistics.budgetBurndown.day', { day: label });
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#000" />
              <Line
                type="monotone"
                dataKey="remaining"
                name={t('statistics.budgetBurndown.remainingBudget')}
                stroke="#82ca9d"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="spent"
                name={t('statistics.budgetBurndown.dailySpending')}
                stroke="#8884d8"
                dot={{ r: 4 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Center h={300}>
            <Text c="dimmed">{t('statistics.budgetBurndown.noData')}</Text>
          </Center>
        )}
      </Stack>
    </Paper>
  );
};

export default BudgetBurndownChart;
