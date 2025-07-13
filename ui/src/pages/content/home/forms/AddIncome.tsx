import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Paper,
  Title,
  NumberInput,
  Select,
  Button,
  Group,
  Textarea,
  LoadingOverlay,
  Tooltip,
} from '@mantine/core';
import { ICreateIncomeDto } from '@clients';
import { usePostAdd } from '@requests/incomesRequests';
import { useGetAllIncomeCategories } from '@requests/categoryRequests';
import { notifications } from '@mantine/notifications';
import ExpensesDateInputWrapper from '../../../../components/wrappers/ExpensesDateInputWrapper.tsx';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface CategoryOption {
  value: string;
  label: string;
}

export default function AddIncome() {
  const { userData } = useUserDataContext();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);

  const [postAddIncome] = usePostAdd();
  const [getAllCategories] = useGetAllIncomeCategories();

  const form = useForm<ICreateIncomeDto>({
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
  });

  // Fetch categories
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
          message: 'Failed to load income categories',
          color: 'red',
        });
      }
    };

    fetchCategories();
  }, []);

  // Fetch user currency
  useEffect(() => {
    try {
      if (userData?.currencyId !== undefined) {
        setCurrencyId(userData.currencyId);
        form.setFieldValue('currencyId', userData.currencyId);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, [userData]);

  const handleSubmit = (values: ICreateIncomeDto) => {
    setLoading(true);
    // Ensure categoryId is a number
    const formData = {
      ...values,
      categoryId: Number(values.categoryId),
      currencyId: currencyId || 1, // Default to 1 if not set
    };
    postAddIncome(formData)
      .then(() => {
        form.reset();
        notifications.show({
          title: 'Success',
          message: 'Income added successfully',
          color: 'green',
        });
      })
      .catch((error) => {
        console.error('Failed to add income:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to add income',
          color: 'red',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Paper p="md" radius="md" withBorder>
      <LoadingOverlay visible={loading} />
      <Title order={3} mb="md">
        Add New Income
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Category"
          placeholder="Select a category"
          data={categories}
          required
          mb="md"
          key={form.key('categoryId')}
          {...form.getInputProps('categoryId')}
        />

        <NumberInput
          label="Amount"
          placeholder="0.00"
          required
          min={0.01}
          step={0.01}
          //precision={2}
          mb="md"
          key={form.key('amount')}
          {...form.getInputProps('amount')}
        />

        <ExpensesDateInputWrapper
          label="Date"
          placeholder="Pick a date"
          mb="md"
          key={form.key('date')}
          {...form.getInputProps('date')}
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          mb="md"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />

        <Group justify="flex-end" mt="md">
          <Tooltip
            label={'Cannot submit income, no currency was found for the user'}
            disabled={currencyId !== undefined}
            color="teal"
            withArrow
            position="top"
          >
            <Button
              disabled={currencyId === undefined}
              type="submit"
              color="green"
            >
              Add Income
            </Button>
          </Tooltip>
        </Group>
      </form>
    </Paper>
  );
}
