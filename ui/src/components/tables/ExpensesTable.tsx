import { useCallback, useEffect, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { ActionIcon, Button, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { IExpense } from '@clients';
import { useDeleteExpense } from '@requests/expensesRequests.ts';
import { useGetAllExpenseCategories } from '@requests/categoryRequests.ts';
import sortBy from 'lodash/sortBy';
import EditExpenseModal from './editExpenseModal/EditExpenseModal.tsx';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface CategoryOption {
  value: string;
  label: string;
}

interface ExpensesTableProps {
  expenses: IExpense[];
  onExpenseUpdated?: () => void;
}

export function ExpensesTable({
  expenses,
  onExpenseUpdated,
}: ExpensesTableProps) {
  const { userTags } = useUserDataContext();
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<IExpense>>({
    columnAccessor: 'date',
    direction: 'desc',
  });
  const [records, setRecords] = useState<IExpense[]>([]);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [deleteExpense] = useDeleteExpense();
  const [getAllCategories] = useGetAllExpenseCategories();

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
          message: 'Failed to load expense categories',
          color: 'red',
        });
      }
    };

    fetchCategories();
  }, []);

  // Sort records when sort status or expenses change
  useEffect(() => {
    if (!expenses) return;

    const data = sortBy(expenses, sortStatus.columnAccessor) as IExpense[];
    setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
  }, [sortStatus, expenses]);

  // Handle edit button click
  // const handleEdit = (expense: IExpense) => {
  //   console.log('Recieved: ', expense);
  //   setSelectedExpense(expense);
  // };

  // Handle delete button click
  const handleDelete = (expense: IExpense) => {
    setSelectedExpense(expense);
    setDeleteConfirmOpened(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!selectedExpense) return;

    try {
      await deleteExpense(selectedExpense.id!);
      notifications.show({
        title: 'Success',
        message: 'Expense deleted successfully',
        color: 'green',
      });
      setDeleteConfirmOpened(false);
      if (onExpenseUpdated) onExpenseUpdated();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete expense',
        color: 'red',
      });
    }
  };

  const findTagName = useCallback(
    (tagId?: number) => {
      if (!tagId) return '';
      const tag = userTags.find((tag) => {
        return tag.id === tagId;
      });
      return tag?.name;
    },
    [userTags],
  );

  return (
    <>
      <DataTable
        height={500}
        withTableBorder
        withColumnBorders
        records={records}
        columns={[
          {
            accessor: 'description',
            title: 'Description',
            width: '30%',
          },
          {
            accessor: 'amount',
            title: 'Amount',
            sortable: true,
            width: '15%',
            render: ({ amount }) => {
              return amount?.toFixed(2);
            },
          },
          {
            accessor: 'categoryId',
            title: 'Category',
            width: '20%',
            // In a real app, you would fetch category names and map IDs to names
            render: ({ categoryId }) => {
              let possibleCategoryName = `Category ${categoryId} - Check!`;
              categories.forEach((category) => {
                if (category.value === categoryId?.toString()) {
                  possibleCategoryName = category.label;
                }
              });
              return possibleCategoryName;
            },
          },
          {
            accessor: 'date',
            title: 'Date',
            sortable: true,
            width: '10%',
            render: ({ date }) => {
              return date ? new Date(date).toLocaleDateString() : '';
            },
          },
          {
            accessor: 'tagId',
            title: 'Tag',
            sortable: false,
            width: '14%',
            render: ({ tagId }) => {
              return findTagName(tagId);
            },
          },
          {
            accessor: 'actions',
            title: 'Actions',
            width: '15%',
            render: (expense) => {
              return (
                <Group gap="xs">
                  <EditExpenseModal
                    expense={expense}
                    categories={categories}
                    onExpenseUpdated={onExpenseUpdated}
                  />
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => {
                      return handleDelete(expense);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              );
            },
          },
        ]}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmOpened}
        onClose={() => {
          return setDeleteConfirmOpened(false);
        }}
        title="Confirm Deletion"
      >
        <Text>Are you sure you want to delete this expense?</Text>
        <Group justify="flex-end" mt="md">
          <Button
            variant="outline"
            onClick={() => {
              return setDeleteConfirmOpened(false);
            }}
          >
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}

export default ExpensesTable;
