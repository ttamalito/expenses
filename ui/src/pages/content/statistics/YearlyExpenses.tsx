import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Box,
  Title,
  Paper,
  Text,
  Select,
  Group,
  Stack,
  Loader,
  Center,
  Button,
} from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IExpense, IGetIncomeDto } from '@clients';
import ExpensesTable from '../../../components/tables/ExpensesTable';
import IncomesTable from '../../../components/tables/IncomesTable';
import {
  useGetYearly,
  useGetSingleTypeYear,
  useGetTotalSpent,
} from '@requests/expensesRequests.ts';
import {
  useGetYearlyIncomes,
  useGetTotalEarnedYear,
} from '@requests/incomesRequests.ts';
import { useGetAllExpenseCategories } from '@requests/categoryRequests.ts';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface CategoryOption {
  value: string;
  label: string;
}

interface FormValues {
  categoryId: string;
}

const YearlyExpenses: React.FC = () => {
  const [searchParams] = useSearchParams();
  const year = parseInt(
    searchParams.get('year') || new Date().getFullYear().toString(),
  );

  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [incomes, setIncomes] = useState<IGetIncomeDto[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalSpentCategory, setTotalSpentCategory] = useState<number | null>(
    null,
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [pieChartData, setPieChartData] = useState<
    { name: string; value: number; color: string }[]
  >([]);

  const [getYearlyExpenses] = useGetYearly();
  const [getSingleTypeYearExpenses] = useGetSingleTypeYear();
  const [getTotalSpentYear] = useGetTotalSpent();
  const [getAllCategories] = useGetAllExpenseCategories();
  const [getYearlyIncomes] = useGetYearlyIncomes();
  const [getTotalEarnedYear] = useGetTotalEarnedYear();

  const { userData } = useUserDataContext();

  const form = useForm<FormValues>({
    initialValues: {
      categoryId: '',
    },
  });

  // Fetch all expense categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await getAllCategories();
      if (response?.data) {
        const categoriesData = response.data;
        const options: CategoryOption[] = categoriesData.map(
          (category: any) => {
            // console.log('Category: ', category);
            return {
              value: category.id.toString(),
              label: category.name,
            };
          },
        );
        return options;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load expense categories',
        color: 'red',
      });
      return [];
    }
  }, []);

  // Fetch expenses and total spent
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch expenses
        const expensesResponse = await getYearlyExpenses(year);
        if (expensesResponse?.data) {
          //console.log(expensesResponse);
          setExpenses(expensesResponse.data);

          // fetch all the categories
          const categoriesOptions: CategoryOption[] = await fetchCategories();
          setCategories(categoriesOptions);

          // Create pie chart data from expenses
          const categoryMap = new Map<string, number>();
          expensesResponse.data.forEach((expense: IExpense) => {
            //console.log('Expense: ', expense);
            const categoryId = expense.categoryId?.toString() || 'Unknown';
            const categoryFound = categoriesOptions.find((c) => {
              // console.log('Category that is being searched: ', c);
              // console.log('c.value: ', c.value);
              // console.log('categoryId: ', categoryId);
              return c.value === categoryId;
            });
            //console.log('Category found: ', categoryFound);
            const categoryName = categoryFound?.label || 'NOTHING FOUND!!!';
            // categoriesOptions.find((c) => {
            //   // console.log('Category that is being searched: ', c);
            //   // console.log('c.value: ', c.value);
            //   // console.log('categoryId: ', categoryId);
            //   return c.value === categoryId;
            // })?.label || `Category ${categoryId}`;
            //console.log('Category name: ', categoryName);
            const currentAmount = categoryMap.get(categoryName) || 0;
            categoryMap.set(
              categoryName,
              currentAmount + (expense.amount || 0),
            );
          });

          // Convert to array and sort by amount (descending)
          const chartData = Array.from(categoryMap.entries())
            .map(([name, value]) => {
              return { name, value };
            })
            .sort((a, b) => {
              return b.value - a.value;
            })
            .slice(0, 6); // Take top 6 categories

          const colors = [
            '#4CAF50',
            '#FF5252',
            '#FFC107',
            '#2196F3',
            '#9C27B0',
            '#FF9800',
          ];

          // add a random color to each category:
          const dataWithColors = chartData.map((entry, index) => {
            return {
              name: entry.name,
              value: Math.round(entry.value * 1e2) / 1e2,
              color: colors[index],
            };
          });

          setPieChartData(dataWithColors);
        }

        // Fetch total spent
        const totalSpentResponse = await getTotalSpentYear(year);
        if (totalSpentResponse?.data) {
          setTotalSpent(totalSpentResponse.data.totalSpent);
        }

        // Fetch incomes
        const incomesResponse = await getYearlyIncomes(year);
        if (incomesResponse?.data) {
          setIncomes(incomesResponse.data);
        }

        // Fetch total earned
        const totalEarnedResponse = await getTotalEarnedYear(year);
        if (totalEarnedResponse?.data) {
          setTotalEarned(totalEarnedResponse.data.total);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load expenses data',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const handleCategorySubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (values.categoryId) {
        const categoryId = parseInt(values.categoryId);

        // Fetch expenses for the selected category
        const expensesResponse = await getSingleTypeYearExpenses(
          year,
          categoryId,
        );
        if (expensesResponse?.data) {
          setExpenses(expensesResponse.data);
        }

        // Calculate total spent for the selected category
        let categoryTotal = 0;
        expensesResponse?.data?.forEach((expense: IExpense) => {
          categoryTotal += expense.amount || 0;
        });
        setTotalSpentCategory(categoryTotal);

        // Set selected category name
        const category = categories.find((c) => {
          return c.value === values.categoryId;
        });
        setSelectedCategoryName(category?.label || `Category ${categoryId}`);
      }
    } catch (error) {
      console.error('Failed to fetch category data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load category data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetCategory = async () => {
    setLoading(true);
    try {
      // Reset to all expenses
      const expensesResponse = await getYearlyExpenses(year);
      if (expensesResponse?.data) {
        setExpenses(expensesResponse.data);
      }

      // Reset category-specific total
      setTotalSpentCategory(null);
      setSelectedCategoryName('');

      // Reset form
      form.reset();
    } catch (error) {
      console.error('Failed to reset data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to reset data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseUpdated = async () => {
    // Refetch data when an expense is updated or deleted
    const expensesResponse = await getYearlyExpenses(year);
    if (expensesResponse?.data) {
      setExpenses(expensesResponse.data);
    }

    const totalSpentResponse = await getTotalSpentYear(year);
    if (totalSpentResponse?.data) {
      setTotalSpent(totalSpentResponse.data.totalSpent);
    }
  };

  const handleIncomeUpdated = async () => {
    // Refetch incomes when an income is deleted
    const incomesResponse = await getYearlyIncomes(year);
    if (incomesResponse?.data) {
      setIncomes(incomesResponse.data);
    }

    const totalEarnedResponse = await getTotalEarnedYear(year);
    if (totalEarnedResponse?.data) {
      setTotalEarned(totalEarnedResponse.data.total);
    }
  };

  if (loading && expenses.length === 0) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Box p="md">
      <Title order={2} mb="lg">
        Yearly Expenses and Incomes - {year}
      </Title>

      <Stack gap="xl">
        <Group grow align="flex-start">
          {/* Pie Chart */}
          <Paper shadow="xs" p="md" withBorder>
            <Title order={4} mb="md">
              Expense Categories
            </Title>
            {pieChartData.length > 0 ? (
              <PieChart
                data={pieChartData}
                withLabels
                withTooltip
                tooltipDataSource="segment"
                h={300}
                size={300}
              />
            ) : (
              <Text>No expense data available</Text>
            )}
          </Paper>

          {/* Category Filter */}
          <Paper shadow="xs" p="md" withBorder>
            <Title order={4} mb="md">
              Filter by Expense Category
            </Title>
            <form onSubmit={form.onSubmit(handleCategorySubmit)}>
              <Stack>
                <Select
                  label="Select Category"
                  placeholder="Choose a category"
                  data={categories}
                  clearable
                  key={form.key('categoryId')}
                  {...form.getInputProps('categoryId')}
                />
                <Group>
                  <Button type="submit">
                    See expenses of a single category
                  </Button>
                  {selectedCategoryName && (
                    <Button type="button" onClick={handleResetCategory}>
                      Show all categories
                    </Button>
                  )}
                </Group>
              </Stack>
            </form>
          </Paper>
        </Group>

        {/* Total Spent */}
        <Paper shadow="xs" p="md" withBorder>
          <Group justify="space-between">
            <Text size="xl" fw={700}>
              Total spent this year: {userData?.currency?.symbol}
              {totalSpent.toFixed(2)}
            </Text>
            {totalSpentCategory !== null && selectedCategoryName && (
              <Text size="xl" fw={700}>
                Total spent on {selectedCategoryName}:{' '}
                {userData?.currency?.symbol}
                {totalSpentCategory.toFixed(2)}
              </Text>
            )}
          </Group>
        </Paper>

        {/* Expenses Table */}
        <Paper shadow="xs" p="md" withBorder>
          <Title order={4} mb="md">
            Expenses
          </Title>
          <ExpensesTable
            expenses={expenses}
            onExpenseUpdated={handleExpenseUpdated}
          />
        </Paper>

        {/* Total Earned */}
        <Paper shadow="xs" p="md" withBorder>
          <Text size="xl" fw={700}>
            Total earned this year: {userData?.currency?.symbol}
            {totalEarned.toFixed(2)}
          </Text>
        </Paper>

        {/* Incomes Table */}
        <Paper shadow="xs" p="md" withBorder>
          <Title order={4} mb="md">
            Incomes
          </Title>
          <IncomesTable
            incomes={incomes}
            onIncomeUpdated={handleIncomeUpdated}
          />
        </Paper>
      </Stack>
    </Box>
  );
};

export default YearlyExpenses;
