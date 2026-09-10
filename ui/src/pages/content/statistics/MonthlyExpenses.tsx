import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { useForm } from '@mantine/form';
import ExpensesTable from '../../../components/tables/ExpensesTable';
import IncomesTable from '../../../components/tables/IncomesTable';
import {
  useGetMonthly,
  useGetMonthlyExpensesForATag,
  useGetSingleType,
  useGetTotalSpentMonthly,
  useGetTotalSpentMonthlyCategory,
  useGetTotalSpentMonthlyForTag,
} from '@requests/expensesRequests.ts';
import {
  useGetMonthlyIncomes,
  useGetTotalEarnedMonth,
} from '@requests/incomesRequests.ts';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import { IconTag } from '@tabler/icons-react';
import {
  PeriodDataFetchers,
  useExpensesAndIncomesSummary,
} from '@hooks/useExpensesAndIncomesSummary.ts';
import {
  renderTagOptionWithColor,
  useTagOptions,
} from '@hooks/useTagOptions.tsx';

interface FormValues {
  categoryId: string;
}

interface TagFormValues {
  tagId: string;
}

const MonthlyExpenses: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { userTags, userData } = useUserDataContext();
  const year = parseInt(
    searchParams.get('year') || new Date().getFullYear().toString(),
  );
  const month = parseInt(
    searchParams.get('month') || (new Date().getMonth() + 1).toString(),
  );

  const { tags, tagsWithColor } = useTagOptions(userTags);

  const [getMonthlyExpenses] = useGetMonthly();
  const [getSingleTypeExpenses] = useGetSingleType();
  const [getMonthlyExpensesForTag] = useGetMonthlyExpensesForATag();
  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getTotalSpentMonthlyCategory] = useGetTotalSpentMonthlyCategory();
  const [getTotalSpentMonthlyForTag] = useGetTotalSpentMonthlyForTag();
  const [getMonthlyIncomes] = useGetMonthlyIncomes();
  const [getTotalEarnedMonth] = useGetTotalEarnedMonth();

  const fetchers: PeriodDataFetchers = useMemo(() => {
    return {
      fetchExpenses: () => {
        return getMonthlyExpenses(month, year);
      },
      fetchTotalSpent: () => {
        return getTotalSpentMonthly(month, year);
      },
      fetchExpensesByCategory: (categoryId: number) => {
        return getSingleTypeExpenses(month, year, categoryId);
      },
      fetchTotalSpentByCategory: (categoryId: number) => {
        return getTotalSpentMonthlyCategory(month, year, categoryId);
      },
      fetchIncomes: () => {
        return getMonthlyIncomes(month, year);
      },
      fetchTotalEarned: () => {
        return getTotalEarnedMonth(month, year);
      },
      fetchExpensesAndTotalByTag: async (tagId: number) => {
        // Monthly still needs two calls under the hood - the shared hook
        // doesn't need to know that.
        const expensesResponse = await getMonthlyExpensesForTag(
          month,
          year,
          tagId,
        );
        const totalSpentResponse = await getTotalSpentMonthlyForTag(
          month,
          year,
          tagId,
        );
        return {
          expenses: expensesResponse?.data ?? [],
          totalSpent: totalSpentResponse?.data?.totalSpent ?? 0,
        };
      },
    };
  }, [
    month,
    year,
    getMonthlyExpenses,
    getTotalSpentMonthly,
    getSingleTypeExpenses,
    getTotalSpentMonthlyCategory,
    getMonthlyIncomes,
    getTotalEarnedMonth,
    getMonthlyExpensesForTag,
    getTotalSpentMonthlyForTag,
  ]);

  const {
    expenses,
    incomes,
    categories,
    totalSpent,
    totalEarned,
    totalSpentCategory,
    selectedCategoryName,
    loading,
    pieChartData,
    handleCategorySubmit,
    handleFilterByTag,
    handleResetFilter,
    handleExpenseUpdated,
    handleIncomeUpdated,
  } = useExpensesAndIncomesSummary([month, year], fetchers);

  const form = useForm<FormValues>({
    initialValues: { categoryId: '' },
  });

  const [selectedTagColor, setSelectedTagColor] = useState<string | undefined>(
    undefined,
  );

  const tagForm = useForm<TagFormValues>({
    mode: 'uncontrolled',
    onValuesChange: (values) => {
      if (values.tagId === undefined) {
        setSelectedTagColor(undefined);
        return;
      }
      const tag = tagsWithColor.find((t) => {
        return t.value === String(values.tagId);
      });
      setSelectedTagColor(tag?.color);
    },
  });

  const handleReset = async () => {
    await handleResetFilter();
    form.reset();
    tagForm.reset();
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
        Monthly Expenses and Incomes - {month}/{year}
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

          {/* Category or Tag Filter */}
          <Stack gap="md">
            <Paper shadow="xs" p="md" withBorder>
              <Title order={4} mb="md">
                Filter by Expense Category
              </Title>
              <form
                onSubmit={form.onSubmit((values) => {
                  return handleCategorySubmit(values.categoryId);
                })}
              >
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
                      <Button type="button" onClick={handleReset}>
                        Show all categories
                      </Button>
                    )}
                  </Group>
                </Stack>
              </form>
            </Paper>
            <Paper shadow="xs" p="md" withBorder>
              <Title order={4} mb="md">
                Filter Expenses by Tag
              </Title>
              <form
                onSubmit={tagForm.onSubmit((values) => {
                  return handleFilterByTag(
                    values.tagId,
                    tags.find((t) => {
                      return t.value === values.tagId;
                    })?.label,
                  );
                })}
              >
                <Stack>
                  <Select
                    label="Select Tag"
                    placeholder="Choose a tag"
                    data={tags}
                    clearable
                    renderOption={renderTagOptionWithColor(tagsWithColor)}
                    leftSection={
                      <IconTag
                        color={selectedTagColor ?? 'currentColor'}
                        size={18}
                      />
                    }
                    key={tagForm.key('tagId')}
                    {...tagForm.getInputProps('tagId')}
                  />
                  <Group>
                    <Button type="submit">See expenses of a single tag</Button>
                    {selectedCategoryName && (
                      <Button type="button" onClick={handleReset}>
                        Show all expenses
                      </Button>
                    )}
                  </Group>
                </Stack>
              </form>
            </Paper>
          </Stack>
        </Group>

        {/* Total Spent */}
        <Paper shadow="xs" p="md" withBorder>
          <Group justify="space-between">
            <Text size="xl" fw={700}>
              Total spent this month: {userData?.currency?.symbol}
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
            Total earned this month: {userData?.currency?.symbol}
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

export default MonthlyExpenses;
