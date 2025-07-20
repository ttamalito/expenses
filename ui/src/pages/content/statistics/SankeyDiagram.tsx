import React, { useEffect, useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Select,
  NumberInput,
  Button,
  Stack,
  Loader,
  Center,
  SegmentedControl,
} from '@mantine/core';
import {
  Sankey,
  Tooltip,
  Rectangle,
  Layer,
  ResponsiveContainer,
} from 'recharts';
import { useGetAllExpenseCategories } from '@requests/categoryRequests.ts';
import { useGetMonthly, useGetYearly } from '@requests/expensesRequests.ts';
import { notifications } from '@mantine/notifications';

// Define the node and link types for the Sankey diagram
interface SankeyNode {
  name: string;
  value?: number;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Format currency for display
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

// Custom node component for the Sankey diagram
const CustomNode = (props: any) => {
  const { x, y, width, height, index, payload, containerWidth } = props;
  const isOut = x + width + 6 > containerWidth;

  // Determine if this is an expense node (typically at the end of the diagram)
  // We'll consider nodes with index higher than a threshold as expense nodes
  const isExpenseNode = index >= 10; // Adjust this threshold based on your data structure

  // Format the display text with name and value if available
  const displayText =
    payload.value !== undefined
      ? `${payload.name} (${formatCurrency(payload.value)})`
      : payload.name;

  // For expense nodes, don't truncate the text
  const truncatedText = isExpenseNode
    ? displayText
    : displayText.length > Math.max(10, Math.floor(containerWidth / 20))
      ? displayText.substring(
          0,
          Math.max(10, Math.floor(containerWidth / 20)) - 3,
        ) + '...'
      : displayText;

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isExpenseNode ? '#ff9966' : '#8884d8'} // Different color for expense nodes
        fillOpacity="0.8"
      />
      <text
        textAnchor={isOut ? 'end' : 'start'}
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2}
        fontSize="14"
        stroke="#333"
        style={{ pointerEvents: 'none' }}
        fontWeight={isExpenseNode ? 'bold' : 'normal'} // Make expense node text bold
      >
        {truncatedText}
      </text>
    </Layer>
  );
};

const SankeyDiagram: React.FC = () => {
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [sankeyData, setSankeyData] = useState<SankeyData>({
    nodes: [],
    links: [],
  });
  const [viewType, setViewType] = useState<'month' | 'year'>('month');

  // API hooks
  const [getAllExpenseCategories] = useGetAllExpenseCategories();
  const [getMonthlyExpenses] = useGetMonthly();
  const [getYearlyExpenses] = useGetYearly();

  // Fetch data and prepare Sankey diagram data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesResponse = await getAllExpenseCategories();
      const categories = categoriesResponse?.data || [];

      // Fetch expenses based on view type
      let expenses;
      if (viewType === 'month') {
        const expensesResponse = await getMonthlyExpenses(month, year);
        expenses = expensesResponse?.data || [];
      } else {
        const expensesResponse = await getYearlyExpenses(year);
        expenses = expensesResponse?.data || [];
      }

      // Prepare Sankey data
      prepareSankeyData(categories, expenses);
    } catch (error) {
      console.error('Failed to fetch data for Sankey diagram:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load data for money flow visualization',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform the data into the format required by the Sankey diagram
  const prepareSankeyData = (categories: any[], expenses: any[]) => {
    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];

    // Calculate expenses by category
    const categoryExpenses = new Map<number, number>();

    expenses.forEach((expense) => {
      const categoryId = expense.categoryId;
      const amount = expense.amount || 0;

      if (categoryExpenses.has(categoryId)) {
        categoryExpenses.set(
          categoryId,
          categoryExpenses.get(categoryId)! + amount,
        );
      } else {
        categoryExpenses.set(categoryId, amount);
      }
    });

    // Calculate total spent
    let totalSpent = 0;
    categoryExpenses.forEach((amount) => {
      totalSpent += amount;
    });

    // Add "Total Spent" as the first node with the total value
    nodes.push({ name: 'Total Spent', value: totalSpent });
    const totalSpentIndex = 0;

    // Add categories as nodes (only those with spending > 0)
    const categoryStartIndex = nodes.length;
    const categoriesWithSpending: number[] = [];

    categories.forEach((category, index) => {
      const categoryId = category.id;
      const amount = categoryExpenses.get(categoryId) || 0;

      // Only add categories with spending > 0
      if (amount > 0) {
        nodes.push({ name: category.name, value: amount });
        categoriesWithSpending.push(index);
      }
    });

    // For monthly view, add expenses as nodes
    const expenseStartIndex = nodes.length;
    if (viewType === 'month') {
      expenses.forEach((expense) => {
        const amount = expense.amount || 0;
        nodes.push({
          name: expense.name || `Expense ${expense.id}`,
          value: amount,
        });
      });
    }

    // Create links from "Total Spent" to categories (only those with spending > 0)
    categoryExpenses.forEach((amount, categoryId) => {
      if (amount > 0) {
        const categoryIndex = categories.findIndex((cat) => {
          return cat.id === categoryId;
        });

        if (categoryIndex !== -1) {
          // Find the position in the nodes array (accounting for filtered categories)
          const nodeIndex = categoriesWithSpending.indexOf(categoryIndex);

          if (nodeIndex !== -1) {
            links.push({
              source: totalSpentIndex,
              target: categoryStartIndex + nodeIndex,
              value: amount,
            });
          }
        }
      }
    });

    // For monthly view, create links from categories to expenses
    if (viewType === 'month') {
      expenses.forEach((expense, expenseIndex) => {
        const categoryId = expense.categoryId;
        const amount = expense.amount || 0;

        // Only create links for categories with spending > 0
        if (amount > 0) {
          // Find the category for this expense
          const categoryIndex = categories.findIndex((cat) => {
            return cat.id === categoryId;
          });

          if (categoryIndex !== -1) {
            // Find the position in the nodes array (accounting for filtered categories)
            const nodeIndex = categoriesWithSpending.indexOf(categoryIndex);

            if (nodeIndex !== -1) {
              links.push({
                source: categoryStartIndex + nodeIndex,
                target: expenseStartIndex + expenseIndex,
                value: amount,
              });
            }
          }
        }
      });
    }

    setSankeyData({ nodes, links });
  };

  useEffect(() => {
    fetchData();
  }, [month, year, viewType]);

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

  const handleViewTypeChange = (value: string) => {
    setViewType(value as 'month' | 'year');
  };

  const handleRefresh = () => {
    fetchData();
  };

  const monthNames = [
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

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>Spending Distribution</Title>
          <Group>
            <SegmentedControl
              value={viewType}
              onChange={handleViewTypeChange}
              data={[
                { label: 'Monthly', value: 'month' },
                { label: 'Yearly', value: 'year' },
              ]}
            />
            <Select
              label="Month"
              value={month.toString()}
              onChange={handleMonthChange}
              data={Array.from({ length: 12 }, (_, i) => {
                return {
                  value: (i + 1).toString(),
                  label: monthNames[i],
                };
              })}
              w={150}
              disabled={viewType === 'year'}
            />
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
          {viewType === 'month'
            ? 'This Sankey diagram shows how your total spending is distributed across categories and individual expenses. It helps visualize your spending patterns in detail.'
            : 'This Sankey diagram shows how your total spending is distributed across different categories. It provides an overview of your spending patterns for the year.'}
        </Text>

        {loading ? (
          <Center h={400}>
            <Loader />
          </Center>
        ) : sankeyData.nodes.length > 0 ? (
          <ResponsiveContainer width="90%" height={500}>
            <Sankey
              data={sankeyData}
              node={<CustomNode />}
              nodePadding={50}
              margin={{
                left: 50,
                right: 150,
                top: 50,
                bottom: 50,
              }}
              link={{ stroke: '#77c878' }}
            >
              <Tooltip
                content={({ payload }) => {
                  if (payload) {
                    return (
                      <div
                        style={{
                          backgroundColor: 'white',
                          padding: '5px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      ></div>
                    );
                  }
                  return null;
                }}
              />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <Center h={400}>
            <Text c="dimmed">
              No data available for the selected period. Please try a different
              month or year.
            </Text>
          </Center>
        )}
      </Stack>
    </Paper>
  );
};

export default SankeyDiagram;
