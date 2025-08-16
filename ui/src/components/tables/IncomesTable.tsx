import { useCallback, useEffect, useState } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { ActionIcon, Button, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import { IGetIncomeDto } from '@clients';
import { useDeleteIncome } from '@requests/incomesRequests.ts';
import { useGetAllIncomeCategories } from '@requests/categoryRequests.ts';
import sortBy from 'lodash/sortBy';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface CategoryOption {
  value: string;
  label: string;
}

interface IncomesTableProps {
  incomes: IGetIncomeDto[];
  onIncomeUpdated?: () => void;
}

export function IncomesTable({ incomes, onIncomeUpdated }: IncomesTableProps) {
  const { userTags } = useUserDataContext();
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<IGetIncomeDto>
  >({
    columnAccessor: 'date',
    direction: 'desc',
  });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [records, setRecords] = useState<IGetIncomeDto[]>([]);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IGetIncomeDto | null>(
    null,
  );

  const [deleteIncome] = useDeleteIncome();
  const [getAllCategories] = useGetAllIncomeCategories();

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

  // Sort records when sort status or incomes change
  useEffect(() => {
    if (!incomes) return;

    const data = sortBy(incomes, sortStatus.columnAccessor) as IGetIncomeDto[];
    setRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
  }, [sortStatus, incomes]);

  // Handle delete button click
  const handleDelete = (income: IGetIncomeDto) => {
    setSelectedIncome(income);
    setDeleteConfirmOpened(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!selectedIncome) return;

    try {
      await deleteIncome(selectedIncome.id!);
      notifications.show({
        title: 'Success',
        message: 'Income deleted successfully',
        color: 'green',
      });
      setDeleteConfirmOpened(false);
      if (onIncomeUpdated) onIncomeUpdated();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete income',
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
            width: '20%',
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
            width: '15%',
            render: ({ tagId }) => {
              return findTagName(tagId);
            },
          },
          {
            accessor: 'actions',
            title: 'Actions',
            width: '10%',
            render: (income) => {
              return (
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => {
                      return handleDelete(income);
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
        <Text>Are you sure you want to delete this income?</Text>
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

export default IncomesTable;
