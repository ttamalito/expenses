import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Title,
  Text,
  Group,
  Select,
  Stack,
  Loader,
  Center,
  MultiSelect,
  NumberInput,
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
} from 'recharts';
import { useGetAllExpenseCategories } from '@requests/categoryRequests.ts';
import { useGetTotalSpentMonthlyCategory } from '@requests/expensesRequests.ts';
import { notifications } from '@mantine/notifications';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface ChartDataPoint {
  // Stored as "<month>-<year>" (e.g. "3-2026") and translated at render time
  month: string;
  [categoryId: string]: string | number;
}

// Array of colors for the category lines
const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
  '#a4de6c',
  '#d0ed57',
  '#83a6ed',
  '#8dd1e1',
];

const CategorySpendingTimelineChart: React.FC = () => {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<number>(6); // Default: 6 months
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [endDate, setEndDate] = useState<{ month: number; year: number }>({
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(),
  });

  const [getAllExpenseCategories] = useGetAllExpenseCategories();
  const [getTotalSpentMonthlyCategory] = useGetTotalSpentMonthlyCategory();

  // Converts "<month>-<year>" into a translated label like "Mar 2026"
  const formatMonthLabel = (value: string | number): string => {
    const [monthNumber, yearNumber] = String(value).split('-');
    return `${t(`statistics.months.short.${monthNumber}`)} ${yearNumber}`;
  };

  // Fetch all expense categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllExpenseCategories();
        if (response?.data) {
          // Assign a color to each category
          const categoriesWithColors = response.data.map(
            (category: any, index: number) => {
              return {
                id: category.id,
                name: category.name,
                color: CHART_COLORS[index % CHART_COLORS.length],
              };
            },
          );
          setCategories(categoriesWithColors);

          // Select all categories by default
          setSelectedCategories(
            categoriesWithColors.map((cat: { id: { toString: () => any } }) => {
              return cat.id.toString();
            }),
          );
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        notifications.show({
          title: t('statistics.common.errorTitle'),
          message: t('statistics.categoryTimeline.errorCategories'),
          color: 'red',
        });
      }
    };

    fetchCategories();
  }, []);

  // Fetch data for the chart when timeframe, endDate, or selectedCategories change
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Calculate the start date based on the timeframe
        const months: { month: number; year: number }[] = [];
        let currentMonth = endDate.month;
        let currentYear = endDate.year;

        // Generate array of months for the selected timeframe
        for (let i = 0; i < timeframe; i++) {
          months.unshift({ month: currentMonth, year: currentYear });
          currentMonth--;
          if (currentMonth === 0) {
            currentMonth = 12;
            currentYear--;
          }
        }

        // Initialize chart data with months
        const data: ChartDataPoint[] = months.map((m) => {
          return {
            month: `${m.month}-${m.year}`,
          };
        });

        // Fetch spending data for each selected category and each month
        for (const categoryId of selectedCategories) {
          const categoryData = await Promise.all(
            months.map(async (m, index) => {
              const response = await getTotalSpentMonthlyCategory(
                m.month,
                m.year,
                parseInt(categoryId),
              );
              return {
                index,
                amount: response?.data?.totalSpent || 0,
              };
            }),
          );

          // Add category data to chart data
          categoryData.forEach((item) => {
            data[item.index][`cat_${categoryId}`] = item.amount;
          });
        }

        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch category spending data:', error);
        notifications.show({
          title: t('statistics.common.errorTitle'),
          message: t('statistics.categoryTimeline.errorData'),
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, endDate, selectedCategories]);

  // Handle timeframe change
  const handleTimeframeChange = (value: string | null) => {
    if (value) {
      setTimeframe(parseInt(value));
    }
  };

  // Handle end date change
  const handleMonthChange = (value: number | string) => {
    if (value) {
      setEndDate((prev) => {
        return { ...prev, month: Number(value) };
      });
    }
  };

  const handleYearChange = (value: number | string) => {
    if (value) {
      setEndDate((prev) => {
        return { ...prev, year: Number(value) };
      });
    }
  };

  // Handle category selection change
  const handleCategoryChange = (values: string[]) => {
    setSelectedCategories(values);
  };

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          <p style={{ margin: '0 0 5px 0' }}>{formatMonthLabel(label)}</p>
          {payload.map((entry: any, index: number) => {
            return (
              <p
                key={`tooltip-${index}`}
                style={{ color: entry.color, margin: '5px 0' }}
              >
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>{t('statistics.categoryTimeline.title')}</Title>
          <Group>
            <Select
              label={t('statistics.categoryTimeline.timeframe')}
              value={timeframe.toString()}
              onChange={handleTimeframeChange}
              data={[
                { value: '3', label: t('statistics.categoryTimeline.last3') },
                { value: '6', label: t('statistics.categoryTimeline.last6') },
                { value: '12', label: t('statistics.categoryTimeline.last12') },
                { value: '24', label: t('statistics.categoryTimeline.last24') },
              ]}
              w={150}
            />
            <NumberInput
              label={t('statistics.common.month')}
              value={endDate.month}
              onChange={handleMonthChange}
              min={1}
              max={12}
              w={100}
            />
            <NumberInput
              label={t('statistics.common.year')}
              value={endDate.year}
              onChange={handleYearChange}
              min={2000}
              max={2100}
              w={120}
            />
          </Group>
        </Group>

        <Text size="sm" c="dimmed">
          {t('statistics.categoryTimeline.description')}
        </Text>

        <MultiSelect
          label={t('statistics.categoryTimeline.filterCategories')}
          placeholder={t('statistics.categoryTimeline.filterPlaceholder')}
          data={categories.map((cat) => {
            return {
              value: cat.id.toString(),
              label: cat.name,
            };
          })}
          value={selectedCategories}
          onChange={handleCategoryChange}
          clearable
          searchable
        />

        {loading ? (
          <Center h={400}>
            <Loader />
          </Center>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatMonthLabel} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                onClick={(e) => {
                  const categoryId =
                    e?.dataKey?.toString().replace('cat_', '') ?? '';
                  if (selectedCategories.includes(categoryId)) {
                    setSelectedCategories(
                      selectedCategories.filter((id) => {
                        return id !== categoryId;
                      }),
                    );
                  } else {
                    setSelectedCategories([...selectedCategories, categoryId]);
                  }
                }}
              />
              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => {
                  return c.id.toString() === categoryId;
                });
                if (!category) return null;

                return (
                  <Line
                    key={`line-${categoryId}`}
                    type="monotone"
                    dataKey={`cat_${categoryId}`}
                    name={category.name}
                    stroke={category.color}
                    activeDot={{ r: 8 }}
                    dot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Center h={400}>
            <Text>{t('statistics.categoryTimeline.noData')}</Text>
          </Center>
        )}
      </Stack>
    </Paper>
  );
};

export default CategorySpendingTimelineChart;
