import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Button,
  NumberInput,
  Text,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { DataTable } from 'mantine-datatable';
import { IUpdateBudgetDto } from '@clients';
import { useGetBudget, usePostModify } from '@requests/budgetRequests.ts';
import BudgetBurndownChart from '../statistics/BudgetBurndownChart.tsx';

interface BudgetItem {
  id: number;
  userId: string;
  name: string;
  description: string;
  budget: number;
}

export default function Budget() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalMonthlyBudget, setTotalMonthlyBudget] = useState<number>(0);
  //the budgets that are returned in onValuesChange
  const [budgetsThatAreBeingChanged, setBudgetsThatAreBeingChanged] = useState<
    IUpdateBudgetDto[]
  >([]);
  const [debouncedBudgets] = useDebouncedValue(budgetsThatAreBeingChanged, 200);
  const [getBudget] = useGetBudget();
  const [modifyBudget] = usePostModify();

  // Initialize form with uncontrolled mode as specified in requirements
  const form = useForm<{ budgets: IUpdateBudgetDto[] }>({
    mode: 'uncontrolled',
    onValuesChange: (values) => {
      //console.log(values);
      setBudgetsThatAreBeingChanged(values.budgets);
      // const newBudget = calculateTotalBudget(values.budgets);
      // setTotalMonthlyBudget(newBudget);
    },
  });

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const response = await getBudget();
      if (response?.data?.budget) {
        setBudgetItems(response.data.budget);

        // Initialize form values based on fetched data
        const initialBudgets = response.data.budget.map((item: BudgetItem) => {
          return {
            categoryId: item.id,
            newBudget: item.budget,
          };
        });

        form.setValues({ budgets: initialBudgets });

        // Calculate and set initial total monthly budget
        const initialTotal = calculateTotalBudget(initialBudgets);
        setTotalMonthlyBudget(initialTotal);
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch budget data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate total monthly budget
  const calculateTotalBudget = (items: IUpdateBudgetDto[]) => {
    return items.reduce((total, item) => {
      return total + (item.newBudget || 0);
    }, 0);
  };

  // // Update total when form values change
  useEffect(() => {
    // console.log('Debounced budgets:');
    // console.log(debouncedBudgets);
    const newBudget = calculateTotalBudget(debouncedBudgets);
    setTotalMonthlyBudget(newBudget);
  }, [debouncedBudgets]);

  useEffect(() => {
    fetchBudget();
  }, []);

  const handleSubmit = async (values: { budgets: IUpdateBudgetDto[] }) => {
    try {
      await modifyBudget(values.budgets);
      notifications.show({
        title: 'Success',
        message: 'Budget updated successfully',
        color: 'green',
      });
      fetchBudget(); // Refresh data after update
    } catch (error) {
      console.error('Error updating budget:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update budget',
        color: 'red',
      });
    }
  };

  return (
    <Container fluid>
      <Title order={1} mb="xl">
        Budget Management
      </Title>

      <Paper shadow="xs" p="md" mb="xl">
        <Box mb="lg">
          <Text size="lg" fw={500}>
            Monthly Budget Total:{' '}
            <Text span fw={700} c="blue">
              ${totalMonthlyBudget.toFixed(2)}
            </Text>
          </Text>
        </Box>
      </Paper>

      <Paper shadow="xs" p="md" mb="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <DataTable
            striped
            withTableBorder
            withColumnBorders
            //loading={loading}
            records={budgetItems}
            columns={[
              { accessor: 'name', title: 'Category Name', width: 200 },
              { accessor: 'description', title: 'Description', width: 300 },
              {
                accessor: 'budget',
                title: 'Current Budget',
                width: 150,
                render: (item) => {
                  return `$${item.budget.toFixed(2)}`;
                },
              },
              {
                accessor: 'newBudget',
                title: 'New Budget',
                width: 200,
                render: (item, index) => {
                  return (
                    <NumberInput
                      min={0}
                      step={0.01}
                      defaultValue={item.budget}
                      key={`budgets.${index}.newBudget`}
                      {...form.getInputProps(`budgets.${index}.newBudget`)}
                    />
                  );
                },
              },
            ]}
          />

          <Group justify="flex-end" mt="xl">
            <Button type="submit" disabled={loading}>
              Save Changes
            </Button>
          </Group>
        </form>
      </Paper>
      <BudgetBurndownChart />
    </Container>
  );
}
