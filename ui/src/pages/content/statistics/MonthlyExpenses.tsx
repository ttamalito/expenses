import React, { useEffect, useState } from 'react';
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
  SelectProps,
} from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IExpense, IGetIncomeDto } from '@clients';
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
import { useGetAllExpenseCategories } from '@requests/categoryRequests.ts';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import { IconCheck, IconTag } from '@tabler/icons-react';

interface CategoryOption {
  value: string;
  label: string;
}

interface FormValues {
  categoryId: string;
}

interface TagFormValues {
  tagId: string;
}

interface TagOption {
  value: string;
  label: string;
}

const MonthlyExpenses: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { userTags } = useUserDataContext();
  const year = parseInt(
    searchParams.get('year') || new Date().getFullYear().toString(),
  );
  const month = parseInt(
    searchParams.get('month') || (new Date().getMonth() + 1).toString(),
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
  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagsWithColor, setTagsWithColor] = useState<
    { value: string; color: string }[]
  >([]);
  const [selectedTag, setSelectedTag] = useState<
    { value: string; color: string } | undefined
  >(undefined);

  const [getMonthlyExpenses] = useGetMonthly();
  const [getSingleTypeExpenses] = useGetSingleType();
  const [getMonthlyExpensesForTag] = useGetMonthlyExpensesForATag();
  const [getTotalSpentMonthly] = useGetTotalSpentMonthly();
  const [getTotalSpentMonthlyCategory] = useGetTotalSpentMonthlyCategory();
  const [getTotalSpentMonthlyForTag] = useGetTotalSpentMonthlyForTag();
  const [getAllCategories] = useGetAllExpenseCategories();
  const [getMonthlyIncomes] = useGetMonthlyIncomes();
  const [getTotalEarnedMonth] = useGetTotalEarnedMonth();

  const form = useForm<FormValues>({
    initialValues: {
      categoryId: '',
    },
  });

  const tagForm = useForm<TagFormValues>({
    mode: 'uncontrolled',
    // validate: {
    //   amount: (value) => {
    //     return value && value <= 0 ? 'Amount must be greater than 0' : null;
    //   },
    //   categoryId: (value) => {
    //     return value && value <= 0 ? 'Please select a category' : null;
    //   },
    //   name: (value) => {
    //     return value.trim().length < 1 ? 'Name is required' : null;
    //   },
    // },
    onValuesChange: (values) => {
      if (values.tagId === undefined) {
        setSelectedTag(undefined);
        return;
      }
      const tagIdAsString = String(values.tagId);
      if (tagIdAsString !== selectedTag?.value) {
        const tag = tagsWithColor.find((tag) => {
          return tag.value === tagIdAsString;
        });
        setSelectedTag(tag);
      }
    },
  });

  useEffect(() => {
    const tagOptions = [];
    const tagsWithColors: { value: string; color: string }[] = [];
    for (const tag of userTags) {
      const tagOption: TagOption = {
        label: tag.name!,
        value: tag.id?.toString() ?? '0',
      };
      tagOptions.push(tagOption);
      const tagColorOption = {
        value: tag.id?.toString() ?? '0',
        color: tag.color!,
      };
      tagsWithColors.push(tagColorOption);
    }
    setTagsWithColor(tagsWithColors);
    setTags(tagOptions);
  }, [userTags]);

  // Fetch all expense categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response?.data) {
          const categoriesData = response.data;
          const options = categoriesData.map((category: any) => {
            return {
              value: category.id.toString(),
              label: category.name,
            };
          });
          setCategories(options);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load expense categories',
          color: 'red',
        });
      }
    };

    fetchCategories();
  }, []);

  // Fetch expenses and total spent
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch expenses
        const expensesResponse = await getMonthlyExpenses(month, year);
        if (expensesResponse?.data) {
          setExpenses(expensesResponse.data);

          // Create pie chart data from expenses
          const categoryMap = new Map<string, number>();
          expensesResponse.data.forEach((expense: IExpense) => {
            const categoryId = expense.categoryId?.toString() || 'Unknown';
            const categoryName =
              categories.find((c) => {
                return c.value === categoryId;
              })?.label || `Category ${categoryId}`;
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
              ...entry,
              color: colors[index],
            };
          });

          setPieChartData(dataWithColors);
        }

        // Fetch total spent
        const totalSpentResponse = await getTotalSpentMonthly(month, year);
        if (totalSpentResponse?.data) {
          setTotalSpent(totalSpentResponse.data.totalSpent);
        }

        // Fetch incomes
        const incomesResponse = await getMonthlyIncomes(month, year);
        if (incomesResponse?.data) {
          setIncomes(incomesResponse.data);
        }

        // Fetch total earned
        const totalEarnedResponse = await getTotalEarnedMonth(month, year);
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
  }, [month, year, categories]);

  const handleCategorySubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (values.categoryId) {
        const categoryId = parseInt(values.categoryId);

        // Fetch expenses for the selected category
        const expensesResponse = await getSingleTypeExpenses(
          month,
          year,
          categoryId,
        );
        if (expensesResponse?.data) {
          setExpenses(expensesResponse.data);
        }

        // Fetch total spent for the selected category
        const totalSpentResponse = await getTotalSpentMonthlyCategory(
          month,
          year,
          categoryId,
        );
        if (totalSpentResponse?.data) {
          setTotalSpentCategory(totalSpentResponse.data.totalSpent);
        }

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

  const handleFilterByTag = async (values: TagFormValues) => {
    setLoading(true);
    try {
      if (values.tagId) {
        const tagId = parseInt(values.tagId);

        // Fetch expenses for the selected category
        const expensesResponse = await getMonthlyExpensesForTag(
          month,
          year,
          tagId,
        );
        if (expensesResponse?.data) {
          setExpenses(expensesResponse.data);
        }

        // Fetch total spent for the selected tag
        const totalSpentResponse = await getTotalSpentMonthlyForTag(
          month,
          year,
          tagId,
        );
        if (totalSpentResponse?.data) {
          setTotalSpentCategory(totalSpentResponse.data.totalSpent);
        }

        // Set selected tag name
        const tag = tags.find((c) => {
          return c.value === values.tagId;
        }); // TODO: Use proper setter, so that in the future we can filter by tag and category
        setSelectedCategoryName(tag?.label || `Tag ${tagId}`);
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
      const expensesResponse = await getMonthlyExpenses(month, year);
      if (expensesResponse?.data) {
        setExpenses(expensesResponse.data);
      }

      // Reset category-specific total
      setTotalSpentCategory(null);
      setSelectedCategoryName('');

      // Reset form
      form.reset();
      tagForm.reset();
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
    const expensesResponse = await getMonthlyExpenses(month, year);
    if (expensesResponse?.data) {
      setExpenses(expensesResponse.data);
    }

    const totalSpentResponse = await getTotalSpentMonthly(month, year);
    if (totalSpentResponse?.data) {
      setTotalSpent(totalSpentResponse.data.totalSpent);
    }
  };

  const handleIncomeUpdated = async () => {
    // Refetch incomes when an income is deleted
    const incomesResponse = await getMonthlyIncomes(month, year);
    if (incomesResponse?.data) {
      setIncomes(incomesResponse.data);
    }

    const totalEarnedResponse = await getTotalEarnedMonth(month, year);
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

  // TODO: Extract it to common component
  const renderTagsWithColor: SelectProps['renderOption'] = ({
    option,
    checked,
  }) => {
    const tag = tagsWithColor.find((tag) => {
      return tag.value === option.value;
    });
    const iconProps = {
      stroke: 1.5,
      color: tag ? tag.color : 'currentColor',
      size: 18,
    };
    const checkIconProps = {
      stroke: 1.5,
      color: 'currentColor',
      opacity: 0.6,
      size: 18,
    };
    return (
      <Group flex="1" gap="xs">
        {<IconTag {...iconProps} />}
        {option.label}
        {checked && (
          <IconCheck
            style={{ marginInlineStart: 'auto' }}
            {...checkIconProps}
          />
        )}
      </Group>
    );
  };

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
            <Paper shadow="xs" p="md" withBorder>
              <Title order={4} mb="md">
                Filter Expenses by Tag
              </Title>
              <form onSubmit={tagForm.onSubmit(handleFilterByTag)}>
                <Stack>
                  <Select
                    label="Select Tag"
                    placeholder="Choose a tag"
                    data={tags}
                    clearable
                    renderOption={renderTagsWithColor}
                    leftSection={
                      <IconTag
                        color={selectedTag?.color ?? 'currentColor'}
                        size={18}
                      />
                    }
                    key={tagForm.key('tagId')}
                    {...tagForm.getInputProps('tagId')}
                  />
                  <Group>
                    <Button type="submit">See expenses of a single tag</Button>
                    {selectedCategoryName && (
                      <Button type="button" onClick={handleResetCategory}>
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
              Total spent this month: ${totalSpent.toFixed(2)}
            </Text>
            {totalSpentCategory !== null && selectedCategoryName && (
              <Text size="xl" fw={700}>
                Total spent on {selectedCategoryName}: $
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
            Total earned this month: ${totalEarned.toFixed(2)}
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
