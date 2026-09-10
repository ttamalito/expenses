import { useCallback, useEffect, useState, DependencyList } from 'react';
import { AxiosResponse } from 'axios';
import { notifications } from '@mantine/notifications';
import { IExpense, IGetIncomeDto } from '@clients';
import { useGetAllExpenseCategories } from '@requests/categoryRequests.ts';

export interface CategoryOption {
  value: string;
  label: string;
}

export interface PieChartEntry {
  name: string;
  value: number;
  color: string;
}

export interface TagTotalResult {
  expenses: IExpense[];
  totalSpent: number;
}

const PIE_CHART_COLORS = [
  '#4CAF50',
  '#FF5252',
  '#FFC107',
  '#2196F3',
  '#9C27B0',
  '#FF9800',
];

const buildPieChartData = (
  expenses: IExpense[],
  categories: CategoryOption[],
): PieChartEntry[] => {
  const categoryMap = new Map<string, number>();
  expenses.forEach((expense) => {
    const categoryId = expense.categoryId?.toString() || 'Unknown';
    const categoryName =
      categories.find((c) => {
        return c.value === categoryId;
      })?.label || `Category ${categoryId}`;
    const currentAmount = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, currentAmount + (expense.amount || 0));
  });

  return Array.from(categoryMap.entries())
    .map(([name, value]) => {
      return { name, value };
    })
    .sort((a, b) => {
      return b.value - a.value;
    })
    .slice(0, 6)
    .map((entry, index) => {
      return {
        name: entry.name,
        value: Math.round(entry.value * 1e2) / 1e2,
        color: PIE_CHART_COLORS[index],
      };
    });
};

export interface PeriodDataFetchers {
  fetchExpenses: () => Promise<AxiosResponse | undefined>;
  fetchTotalSpent: () => Promise<AxiosResponse | undefined>;
  fetchExpensesByCategory: (
    categoryId: number,
  ) => Promise<AxiosResponse | undefined>;
  fetchTotalSpentByCategory: (
    categoryId: number,
  ) => Promise<AxiosResponse | undefined>;
  fetchIncomes: () => Promise<AxiosResponse | undefined>;
  fetchTotalEarned: () => Promise<AxiosResponse | undefined>;
  /** Optional: only components that support tag filtering need to pass this. */
  fetchExpensesAndTotalByTag?: (
    tagId: number,
  ) => Promise<TagTotalResult | undefined>;
}

export function useExpensesAndIncomesSummary(
  periodKey: DependencyList,
  fetchers: PeriodDataFetchers,
) {
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [incomes, setIncomes] = useState<IGetIncomeDto[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [totalSpentCategory, setTotalSpentCategory] = useState<number | null>(
    null,
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState<PieChartEntry[]>([]);

  const [getAllCategories] = useGetAllExpenseCategories();

  const fetchCategories = useCallback(async (): Promise<CategoryOption[]> => {
    try {
      const response = await getAllCategories();
      if (response?.data) {
        return response.data.map((category: any) => {
          return {
            value: category.id.toString(),
            label: category.name,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load expense categories',
        color: 'red',
      });
      return [];
    }
  }, [getAllCategories]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const expensesResponse = await fetchers.fetchExpenses();
        // Fetch categories fresh here (not from outside state) so the pie
        // chart never uses a stale category list.
        const categoriesOptions = await fetchCategories();
        setCategories(categoriesOptions);

        if (expensesResponse?.data) {
          setExpenses(expensesResponse.data);
          setPieChartData(
            buildPieChartData(expensesResponse.data, categoriesOptions),
          );
        }

        const totalSpentResponse = await fetchers.fetchTotalSpent();
        if (totalSpentResponse?.data) {
          setTotalSpent(totalSpentResponse.data.totalSpent);
        }

        const incomesResponse = await fetchers.fetchIncomes();
        if (incomesResponse?.data) {
          setIncomes(incomesResponse.data);
        }

        const totalEarnedResponse = await fetchers.fetchTotalEarned();
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
    // Intentionally keyed on the caller-supplied period only (mirrors the
    // previous behavior) — fetchers are recreated per-render via useMemo in
    // the caller and don't need to be a dep here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, periodKey);

  const handleCategorySubmit = useCallback(
    async (categoryIdStr: string) => {
      if (!categoryIdStr) return;
      setLoading(true);
      try {
        const categoryId = parseInt(categoryIdStr);

        const expensesResponse =
          await fetchers.fetchExpensesByCategory(categoryId);
        if (expensesResponse?.data) {
          setExpenses(expensesResponse.data);
        }

        const totalSpentResponse =
          await fetchers.fetchTotalSpentByCategory(categoryId);
        if (totalSpentResponse?.data) {
          setTotalSpentCategory(totalSpentResponse.data.totalSpent);
        }

        const category = categories.find((c) => {
          return c.value === categoryIdStr;
        });
        setSelectedCategoryName(category?.label || `Category ${categoryId}`);
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
    },
    [categories, fetchers],
  );

  const handleFilterByTag = useCallback(
    async (tagIdStr: string, tagLabel?: string) => {
      if (!tagIdStr || !fetchers.fetchExpensesAndTotalByTag) return;
      setLoading(true);
      try {
        const tagId = parseInt(tagIdStr);
        const result = await fetchers.fetchExpensesAndTotalByTag(tagId);
        if (result) {
          setExpenses(result.expenses);
          setTotalSpentCategory(result.totalSpent);
        }
        setSelectedCategoryName(tagLabel || `Tag ${tagId}`);
      } catch (error) {
        console.error('Failed to fetch tag data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load tag data',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    },
    [fetchers],
  );

  const handleResetFilter = useCallback(async () => {
    setLoading(true);
    try {
      const expensesResponse = await fetchers.fetchExpenses();
      if (expensesResponse?.data) {
        setExpenses(expensesResponse.data);
      }
      setTotalSpentCategory(null);
      setSelectedCategoryName('');
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
  }, [fetchers]);

  const handleExpenseUpdated = useCallback(async () => {
    const expensesResponse = await fetchers.fetchExpenses();
    if (expensesResponse?.data) {
      setExpenses(expensesResponse.data);
    }
    const totalSpentResponse = await fetchers.fetchTotalSpent();
    if (totalSpentResponse?.data) {
      setTotalSpent(totalSpentResponse.data.totalSpent);
    }
  }, [fetchers]);

  const handleIncomeUpdated = useCallback(async () => {
    const incomesResponse = await fetchers.fetchIncomes();
    if (incomesResponse?.data) {
      setIncomes(incomesResponse.data);
    }
    const totalEarnedResponse = await fetchers.fetchTotalEarned();
    if (totalEarnedResponse?.data) {
      setTotalEarned(totalEarnedResponse.data.total);
    }
  }, [fetchers]);

  return {
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
  };
}
