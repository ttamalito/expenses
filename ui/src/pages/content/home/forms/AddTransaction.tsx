import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Paper,
  Tabs,
  NumberInput,
  Select,
  Button,
  Group,
  Textarea,
  LoadingOverlay,
  Tooltip,
  Text,
  SelectProps,
  Box,
} from '@mantine/core';
import { ICreateExpenseDto, ICreateIncomeDto, IGetTagDto } from '@clients';
import { usePostAdd as usePostAddExpense } from '@requests/expensesRequests.ts';
import { usePostAdd as usePostAddIncome } from '@requests/incomesRequests';
import {
  useGetAllExpenseCategories,
  useGetAllIncomeCategories,
} from '@requests/categoryRequests.ts';
import { notifications } from '@mantine/notifications';
import ExpensesDateInputWrapper from '../../../../components/wrappers/ExpensesDateInputWrapper.tsx';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import { IconCheck, IconTag } from '@tabler/icons-react';

interface CategoryOption {
  value: string;
  label: string;
}

interface TagOption {
  value: string;
  label: string;
}

type TagWithColor = { value: string; color: string };

interface IAddTransactionProps {
  tagsDto: IGetTagDto[];
  setUpdateCharts: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddTransaction({
  tagsDto,
  setUpdateCharts,
}: IAddTransactionProps) {
  const { userData } = useUserDataContext();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);

  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagsWithColor, setTagsWithColor] = useState<TagWithColor[]>([]);

  const [expenseCategories, setExpenseCategories] = useState<CategoryOption[]>(
    [],
  );
  const [incomeCategories, setIncomeCategories] = useState<CategoryOption[]>(
    [],
  );

  const [loadingExpense, setLoadingExpense] = useState(false);
  const [loadingIncome, setLoadingIncome] = useState(false);

  const [selectedExpenseTag, setSelectedExpenseTag] = useState<
    TagWithColor | undefined
  >(undefined);
  const [selectedIncomeTag, setSelectedIncomeTag] = useState<
    TagWithColor | undefined
  >(undefined);

  // Both hook sets are called unconditionally (rules of hooks) — we just
  // pick which result to use depending on which form is being submitted.
  const [postAddExpense] = usePostAddExpense();
  const [postAddIncome] = usePostAddIncome();
  const [getAllExpenseCategories] = useGetAllExpenseCategories();
  const [getAllIncomeCategories] = useGetAllIncomeCategories();

  const expenseForm = useForm<ICreateExpenseDto>({
    mode: 'uncontrolled',
    onValuesChange: (values) => {
      if (values.tagId === undefined) {
        setSelectedExpenseTag(undefined);
        return;
      }
      const tagIdAsString = String(values.tagId);
      if (tagIdAsString !== selectedExpenseTag?.value) {
        setSelectedExpenseTag(
          tagsWithColor.find((tag) => {
            return tag.value === tagIdAsString;
          }),
        );
      }
    },
  });

  const incomeForm = useForm<ICreateIncomeDto>({
    mode: 'uncontrolled',
    onValuesChange: (values) => {
      if (values.tagId === undefined) {
        setSelectedIncomeTag(undefined);
        return;
      }
      const tagIdAsString = String(values.tagId);
      if (tagIdAsString !== selectedIncomeTag?.value) {
        setSelectedIncomeTag(
          tagsWithColor.find((tag) => {
            return tag.value === tagIdAsString;
          }),
        );
      }
    },
  });

  // Fetch expense categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllExpenseCategories();
        if (response?.data) {
          setExpenseCategories(
            response.data.map((category: any) => {
              return {
                value: category.id.toString(),
                label: category.name,
              };
            }),
          );
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

  // Fetch income categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllIncomeCategories();
        if (response?.data) {
          setIncomeCategories(
            response.data.map((category: any) => {
              return {
                value: category.id.toString(),
                label: category.name,
              };
            }),
          );
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

  // Tags — identical computation in both original forms, so shared here
  useEffect(() => {
    const tagOptions: TagOption[] = [];
    const tagsWithColors: TagWithColor[] = [];
    for (const tag of tagsDto) {
      tagOptions.push({ value: tag.id?.toString() ?? '0', label: tag.name! });
      tagsWithColors.push({
        value: tag.id?.toString() ?? '0',
        color: tag.color!,
      });
    }
    setTagsWithColor(tagsWithColors);
    setTags(tagOptions);
  }, [tagsDto]);

  // currency identical in both  forms
  useEffect(() => {
    try {
      if (userData?.currencyId !== undefined) {
        setCurrencyId(userData.currencyId);
        expenseForm.setFieldValue('currencyId', userData.currencyId);
        incomeForm.setFieldValue('currencyId', userData.currencyId);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, [userData]);

  const handleSubmitExpense = async (values: ICreateExpenseDto) => {
    setLoadingExpense(true);
    try {
      const formData = {
        ...values,
        categoryId: Number(values.categoryId),
        currencyId: currencyId || 1,
      };
      const response = await postAddExpense(formData);
      if (response) {
        notifications.show({
          title: 'Success',
          message: 'Expense added successfully',
          color: 'green',
        });
        expenseForm.reset();
        setUpdateCharts((oldValue) => {
          return !oldValue;
        });
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to add expense',
        color: 'red',
      });
    } finally {
      setLoadingExpense(false);
    }
  };

  const handleSubmitIncome = async (values: ICreateIncomeDto) => {
    setLoadingIncome(true);
    try {
      const formData = {
        ...values,
        categoryId: Number(values.categoryId),
        currencyId: currencyId || 1,
      };
      const response = await postAddIncome(formData);
      if (response) {
        notifications.show({
          title: 'Success',
          message: 'Income added successfully',
          color: 'green',
        });
        incomeForm.reset();
        setUpdateCharts((oldValue) => {
          return !oldValue;
        });
      }
    } catch (error) {
      console.error('Failed to add income:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to add income',
        color: 'red',
      });
    } finally {
      setLoadingIncome(false);
    }
  };

  // Shared between both panels — only depends on tagsWithColor
  const renderTagsWithColor: SelectProps['renderOption'] = ({
    option,
    checked,
  }) => {
    const tag = tagsWithColor.find((t) => {
      return t.value === option.value;
    });
    return (
      <Group flex="1" gap="xs">
        <IconTag
          stroke={1.5}
          color={tag ? tag.color : 'currentColor'}
          size={18}
        />
        {option.label}
        {checked && (
          <IconCheck
            style={{ marginInlineStart: 'auto' }}
            stroke={1.5}
            color="currentColor"
            opacity={0.6}
            size={18}
          />
        )}
      </Group>
    );
  };

  return (
    <Paper p="md" radius="md" withBorder>
      <Box h={'100%'}>{/* ...other content */}</Box>
      <Tabs
        value={activeTab}
        onChange={(value) => {
          return setActiveTab(value as 'expense' | 'income');
        }}
      >
        <Tabs.List grow mb="md">
          <Tabs.Tab value="expense">
            <Text size="lg">Add Expense</Text>
          </Tabs.Tab>
          <Tabs.Tab value="income">
            <Text size="lg">Add Income</Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="expense">
          <LoadingOverlay
            visible={loadingExpense}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            styles={{
              root: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
              },
            }}
          />
          <form onSubmit={expenseForm.onSubmit(handleSubmitExpense)}>
            <Select
              label="Category"
              placeholder="Select a category"
              data={expenseCategories}
              required
              mb="md"
              size="md"
              key={expenseForm.key('categoryId')}
              {...expenseForm.getInputProps('categoryId')}
            />
            <NumberInput
              label="Amount"
              placeholder={`${userData?.currency?.symbol} 0.00`}
              required
              min={0.01}
              step={0.01}
              mb="md"
              size="md"
              key={expenseForm.key('amount')}
              {...expenseForm.getInputProps('amount')}
            />
            <ExpensesDateInputWrapper
              label="Date"
              placeholder="Pick a date"
              mb="md"
              size="md"
              key={expenseForm.key('date')}
              {...expenseForm.getInputProps('date')}
            />
            <Textarea
              label="Description"
              placeholder="Optional description"
              mb="md"
              size="md"
              key={expenseForm.key('description')}
              {...expenseForm.getInputProps('description')}
            />
            <Select
              label="Tag"
              placeholder="Optional Tag"
              data={tags}
              mb="md"
              size="md"
              clearable
              searchable
              renderOption={renderTagsWithColor}
              leftSection={
                <IconTag
                  color={selectedExpenseTag?.color ?? 'currentColor'}
                  size={18}
                />
              }
              key={expenseForm.key('tagId')}
              {...expenseForm.getInputProps('tagId')}
            />
            <Group justify="flex-end" mt="md">
              <Tooltip
                disabled={currencyId !== undefined}
                label="Cannot submit expense, because no currency was found"
                color="teal"
                withArrow
                position="top"
              >
                <Button
                  size={'md'}
                  disabled={currencyId === undefined || loadingExpense}
                  type="submit"
                >
                  Add Expense
                </Button>
              </Tooltip>
            </Group>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="income">
          <LoadingOverlay
            visible={false}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            styles={{
              root: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
              },
            }}
          />
          <form onSubmit={incomeForm.onSubmit(handleSubmitIncome)}>
            <Select
              label="Category"
              placeholder="Select a category"
              data={incomeCategories}
              required
              mb="md"
              size="md"
              key={incomeForm.key('categoryId')}
              {...incomeForm.getInputProps('categoryId')}
            />
            <NumberInput
              label="Amount"
              placeholder={`${userData?.currency?.symbol} 0.00`}
              required
              min={0.01}
              step={0.01}
              mb="md"
              size="md"
              key={incomeForm.key('amount')}
              {...incomeForm.getInputProps('amount')}
            />
            <ExpensesDateInputWrapper
              label="Date"
              placeholder="Pick a date"
              mb="md"
              size="md"
              key={incomeForm.key('date')}
              {...incomeForm.getInputProps('date')}
            />
            <Textarea
              label="Description"
              placeholder="Optional description"
              mb="md"
              size="md"
              key={incomeForm.key('description')}
              {...incomeForm.getInputProps('description')}
            />
            <Select
              label="Tag"
              placeholder="Optional Tag"
              data={tags}
              mb="md"
              size="md"
              clearable
              searchable
              renderOption={renderTagsWithColor}
              leftSection={
                <IconTag
                  color={selectedIncomeTag?.color ?? 'currentColor'}
                  size={18}
                />
              }
              key={incomeForm.key('tagId')}
              {...incomeForm.getInputProps('tagId')}
            />
            <Group justify="flex-end" mt="md">
              <Tooltip
                label="Cannot submit income, no currency was found for the user"
                disabled={currencyId !== undefined}
                color="teal"
                withArrow
                position="top"
              >
                <Button
                  disabled={currencyId === undefined || loadingIncome}
                  type="submit"
                  color="green"
                  size="md"
                >
                  Add Income
                </Button>
              </Tooltip>
            </Group>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
