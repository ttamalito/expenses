import React, { useEffect, useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Grid,
  Card,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useGetStatisticalSummary } from '@requests/statisticsRequests.ts';
import { StatisticalSummaryDto } from '@clients';
import {
  IconArrowUp,
  IconCalendar,
  IconCategory,
  IconChartBar,
  IconCoin,
  IconTrendingUp,
} from '@tabler/icons-react';

const StatisticalSummaries: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryData, setSummaryData] = useState<StatisticalSummaryDto | null>(
    null,
  );

  const [getStatisticalSummary] = useGetStatisticalSummary();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getStatisticalSummary();
      if (response?.data) {
        setSummaryData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistical summaries:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load statistical summaries',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Format date values
  const formatDate = (dateStr: string): string => {
    if (dateStr === 'N/A') return dateStr;

    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Get month name from month number
  const getMonthName = (month: number): string => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1] || 'Unknown';
  };

  if (loading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (!summaryData) {
    return (
      <Center h={300}>
        <Text c="dimmed">No statistical data available.</Text>
      </Center>
    );
  }

  // Extract data for easier access
  const { highestSpending, savings, averageSpending, budgetStreak } =
    summaryData;

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Title order={4}>Statistical Summaries</Title>

        <Text size="sm" c="dimmed">
          This section provides various financial statistics to help you
          understand your spending patterns and savings habits. <br />
          The data is from the last 2 years, anything older than that is not
          taken into account
        </Text>

        <Grid>
          {/* Highest Spending Statistics */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Title order={5}>Highest Spending</Title>
                  <ThemeIcon color="red" variant="light">
                    <IconArrowUp size={18} />
                  </ThemeIcon>
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                <Group>
                  <ThemeIcon color="blue" variant="light" size="lg">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Highest Spending Day</Text>
                    <Text size="sm">
                      {formatDate(
                        highestSpending?.highestSpendingDay?.date ?? '01-01-00',
                      )}
                      :
                      {formatCurrency(
                        highestSpending?.highestSpendingDay?.amount ?? 0,
                      )}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <ThemeIcon color="indigo" variant="light" size="lg">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Highest Spending Month</Text>
                    <Text size="sm">
                      {getMonthName(
                        highestSpending?.highestSpendingMonth?.month ?? 0,
                      )}
                      {highestSpending?.highestSpendingMonth?.year ?? 0}
                      {formatCurrency(
                        highestSpending?.highestSpendingMonth?.amoun ?? 0,
                      )}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <ThemeIcon color="grape" variant="light" size="lg">
                    <IconCategory size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Highest Spending Category</Text>
                    <Text size="sm">
                      {highestSpending?.highestSpendingCategory?.categoryName}:
                      {formatCurrency(
                        highestSpending?.highestSpendingCategory?.amount ?? 0,
                      )}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Average Spending Statistics */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Title order={5}>Average Spending</Title>
                  <ThemeIcon color="blue" variant="light">
                    <IconChartBar size={18} />
                  </ThemeIcon>
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                <Group>
                  <ThemeIcon color="cyan" variant="light" size="lg">
                    <IconCoin size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Average Daily Spend</Text>
                    <Text size="sm">
                      {formatCurrency(averageSpending?.averageDailySpend ?? 0)}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <ThemeIcon color="teal" variant="light" size="lg">
                    <IconCoin size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Average Weekly Spend</Text>
                    <Text size="sm">
                      {formatCurrency(averageSpending?.averageWeeklySpend ?? 0)}
                    </Text>
                  </div>
                </Group>

                <Group>
                  <ThemeIcon color="green" variant="light" size="lg">
                    <IconTrendingUp size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>Longest Streak Under Budget</Text>
                    <Text size="sm">
                      {budgetStreak?.longestStreakDays} days (
                      {formatDate(budgetStreak?.streakStartDate ?? '0')} to
                      {formatDate(budgetStreak?.streakEndDate ?? '0')})
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Savings Statistics */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section withBorder inheritPadding py="xs">
                <Group justify="space-between">
                  <Title order={5}>Savings</Title>
                  <Badge
                    color={
                      savings &&
                      savings.averageMonthlySavingsRate !== undefined &&
                      savings.averageMonthlySavingsRate >= 0
                        ? 'green'
                        : 'red'
                    }
                  >
                    {formatPercentage(savings?.averageMonthlySavingsRate ?? 0)}
                  </Badge>
                </Group>
              </Card.Section>

              <Stack gap="md" mt="md">
                <Text fw={500}>
                  Average Monthly Savings Rate:
                  {formatPercentage(savings?.averageMonthlySavingsRate ?? 0)}
                </Text>

                <Text fw={500}>Monthly Savings Percentages:</Text>
                <Grid>
                  {Object.entries(savings?.monthlySavingsPercentage ?? 0).map(
                    ([monthYear, percentage]) => {
                      return (
                        <Grid.Col
                          span={{ base: 6, sm: 4, md: 3 }}
                          key={monthYear}
                        >
                          <Badge
                            fullWidth
                            color={percentage >= 0 ? 'green' : 'red'}
                            variant="light"
                          >
                            {monthYear}: {formatPercentage(percentage)}
                          </Badge>
                        </Grid.Col>
                      );
                    },
                  )}
                </Grid>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default StatisticalSummaries;
