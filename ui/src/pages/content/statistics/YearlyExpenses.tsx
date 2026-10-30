import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
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
import ExpensesTable from '../../../components/tables/ExpensesTable';
import IncomesTable from '../../../components/tables/IncomesTable';
import {
  useGetYearly,
  useGetSingleTypeYear,
  useGetTotalSpent,
  useGetYearlyExpensesAndTotalForTag,
  useGetTotalSpentYearlyCategory,
} from '@requests/expensesRequests.ts';
import {
  useGetYearlyIncomes,
  useGetTotalEarnedYear,
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

const YearlyExpenses: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const year = parseInt(
    searchParams.get('year') || new Date().getFullYear().toString(),
  );

  const { userTags, userData } = useUserDataContext();
  const { tags, tagsWithColor } = useTagOptions(userTags);

  const [getYearlyExpenses] = useGetYearly();
  const [getSingleTypeYearExpenses] = useGetSingleTypeYear();
  const [getTotalSpentYear] = useGetTotalSpent();
  const [getTotalSpentYearByCategory] = useGetTotalSpentYearlyCategory();
  const [getYearlyExpensesAndTotalForTag] =
    useGetYearlyExpensesAndTotalForTag();
  const [getYearlyIncomes] = useGetYearlyIncomes();
  const [getTotalEarnedYear] = useGetTotalEarnedYear();

  const fetchers: PeriodDataFetchers = useMemo(() => {
    return {
      fetchExpenses: () => {
        return getYearlyExpenses(year);
      },
      fetchTotalSpent: () => {
        return getTotalSpentYear(year);
      },
      fetchExpensesByCategory: (categoryId: number) => {
        return getSingleTypeYearExpenses(year, categoryId);
      },
      // Standardized: uses the same /expenses/total-spent endpoint as the
      // plain yearly total, just with a categoryId param, instead of
      // summing the fetched expenses client-side.
      fetchTotalSpentByCategory: (categoryId: number) => {
        return getTotalSpentYearByCategory(year, categoryId);
      },
      fetchIncomes: () => {
        return getYearlyIncomes(year);
      },
      fetchTotalEarned: () => {
        return getTotalEarnedYear(year);
      },
      fetchExpensesAndTotalByTag: async (tagId: number) => {
        // Yearly's endpoint returns expenses + totalSpent in one call.
        const response = await getYearlyExpensesAndTotalForTag(year, tagId);
        return {
          expenses: response?.data?.expenses ?? [],
          totalSpent: response?.data?.totalSpent ?? 0,
        };
      },
    };
  }, [
    year,
    getYearlyExpenses,
    getTotalSpentYear,
    getSingleTypeYearExpenses,
    getYearlyIncomes,
    getTotalEarnedYear,
    getYearlyExpensesAndTotalForTag,
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
  } = useExpensesAndIncomesSummary([year], fetchers);

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
      const tagOption = tagsWithColor.find((option) => {
        return option.value === String(values.tagId);
      });
      setSelectedTagColor(tagOption?.color);
    },
  });

  const handleReset = async () => {
    await handleResetFilter();
    form.reset();
    tagForm.reset();
  };

  const currencySymbol = userData?.currency?.symbol ?? '';

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
        {t('statistics.periodSummary.yearly.title', { year })}
      </Title>

      <Stack gap="xl">
        <Group grow align="flex-start">
          {/* Pie Chart */}
          <Paper shadow="xs" p="md" withBorder>
            <Title order={4} mb="md">
              {t('statistics.periodSummary.expenseCategories')}
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
              <Text>{t('statistics.periodSummary.noExpenseData')}</Text>
            )}
          </Paper>

          {/* Category or Tag Filter */}
          <Stack gap="md">
            <Paper shadow="xs" p="md" withBorder>
              <Title order={4} mb="md">
                {t('statistics.periodSummary.filterByCategory')}
              </Title>
              <form
                onSubmit={form.onSubmit((values) => {
                  return handleCategorySubmit(values.categoryId);
                })}
              >
                <Stack>
                  <Select
                    label={t('statistics.periodSummary.selectCategory')}
                    placeholder={t(
                      'statistics.periodSummary.selectCategoryPlaceholder',
                    )}
                    data={categories}
                    clearable
                    key={form.key('categoryId')}
                    {...form.getInputProps('categoryId')}
                  />
                  <Group>
                    <Button type="submit">
                      {t('statistics.periodSummary.seeSingleCategory')}
                    </Button>
                    {selectedCategoryName && (
                      <Button type="button" onClick={handleReset}>
                        {t('statistics.periodSummary.showAllCategories')}
                      </Button>
                    )}
                  </Group>
                </Stack>
              </form>
            </Paper>

            <Paper shadow="xs" p="md" withBorder>
              <Title order={4} mb="md">
                {t('statistics.periodSummary.filterByTag')}
              </Title>
              <form
                onSubmit={tagForm.onSubmit((values) => {
                  return handleFilterByTag(
                    values.tagId,
                    tags.find((tagOption) => {
                      return tagOption.value === values.tagId;
                    })?.label,
                  );
                })}
              >
                <Stack>
                  <Select
                    label={t('statistics.periodSummary.selectTag')}
                    placeholder={t(
                      'statistics.periodSummary.selectTagPlaceholder',
                    )}
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
                    <Button type="submit">
                      {t('statistics.periodSummary.seeSingleTag')}
                    </Button>
                    {selectedCategoryName && (
                      <Button type="button" onClick={handleReset}>
                        {t('statistics.periodSummary.showAllExpenses')}
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
              {t('statistics.periodSummary.yearly.totalSpent', {
                amount: `${currencySymbol}${totalSpent.toFixed(2)}`,
              })}
            </Text>
            {totalSpentCategory !== null && selectedCategoryName && (
              <Text size="xl" fw={700}>
                {t('statistics.periodSummary.totalSpentOn', {
                  name: selectedCategoryName,
                  amount: `${currencySymbol}${totalSpentCategory.toFixed(2)}`,
                })}
              </Text>
            )}
          </Group>
        </Paper>

        {/* Expenses Table */}
        <Paper shadow="xs" p="md" withBorder>
          <Title order={4} mb="md">
            {t('statistics.periodSummary.expenses')}
          </Title>
          <ExpensesTable
            expenses={expenses}
            onExpenseUpdated={handleExpenseUpdated}
          />
        </Paper>

        {/* Total Earned */}
        <Paper shadow="xs" p="md" withBorder>
          <Text size="xl" fw={700}>
            {t('statistics.periodSummary.yearly.totalEarned', {
              amount: `${currencySymbol}${totalEarned.toFixed(2)}`,
            })}
          </Text>
        </Paper>

        {/* Incomes Table */}
        <Paper shadow="xs" p="md" withBorder>
          <Title order={4} mb="md">
            {t('statistics.periodSummary.incomes')}
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
