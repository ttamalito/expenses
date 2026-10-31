import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { ActionIcon, Button, Group, Modal, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconTag } from '@tabler/icons-react';
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
  const { t } = useTranslation();
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
          title: t('tables.common.errorTitle'),
          message: t('tables.incomes.loadCategoriesFailed'),
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
        title: t('tables.common.successTitle'),
        message: t('tables.incomes.deleted'),
        color: 'green',
      });
      setDeleteConfirmOpened(false);
      if (onIncomeUpdated) onIncomeUpdated();
    } catch {
      notifications.show({
        title: t('tables.common.errorTitle'),
        message: t('tables.incomes.deleteFailed'),
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
      return (
        <Group>
          <IconTag color={tag?.color} size={14} />
          <Text size="sm">{tag?.name}</Text>
        </Group>
      );
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
            title: t('tables.common.description'),
            width: '30%',
          },
          {
            accessor: 'amount',
            title: t('tables.common.amount'),
            sortable: true,
            width: '20%',
            render: ({ amount }) => {
              return amount?.toFixed(2);
            },
          },
          {
            accessor: 'categoryId',
            title: t('tables.common.category'),
            width: '20%',
            // In a real app, you would fetch category names and map IDs to names
            render: ({ categoryId }) => {
              let possibleCategoryName = t('tables.common.unknownCategory', {
                id: categoryId,
              });
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
            title: t('tables.common.date'),
            sortable: true,
            width: '10%',
            render: ({ date }) => {
              return date ? new Date(date).toLocaleDateString('es-ES') : '';
            },
          },
          {
            accessor: 'tagId',
            title: t('tables.common.tag'),
            sortable: false,
            width: '15%',
            render: ({ tagId }) => {
              return findTagName(tagId);
            },
          },
          {
            accessor: 'actions',
            title: t('tables.common.actions'),
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
        title={t('tables.common.confirmDeletion')}
      >
        <Text>{t('tables.incomes.deleteConfirm')}</Text>
        <Group justify="flex-end" mt="md">
          <Button
            variant="outline"
            onClick={() => {
              return setDeleteConfirmOpened(false);
            }}
          >
            {t('tables.common.cancel')}
          </Button>
          <Button color="red" onClick={handleConfirmDelete}>
            {t('tables.common.delete')}
          </Button>
        </Group>
      </Modal>
    </>
  );
}

export default IncomesTable;
