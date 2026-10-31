import { useState, useEffect } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Box,
  Tooltip,
} from '@mantine/core';
import { IconTrash, IconReplace } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { ICreateExpenseCategoryDto, IGetExpenseCategoryDto } from '@clients';
import {
  useDeleteExpenseCategory,
  useGetAllExpenseCategories,
  usePutExpenseCreate,
} from '@requests/categoryRequests.ts';
import MigrateCategoryModal from './MigrateCategoryModal.tsx';

export default function ExpenseCategoryTable() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<IGetExpenseCategoryDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | undefined
  >();
  const [getAllExpenseCategories] = useGetAllExpenseCategories();
  const [createExpenseCategory] = usePutExpenseCreate();
  const [deleteExpenseCategory] = useDeleteExpenseCategory();

  const form = useForm<ICreateExpenseCategoryDto>({
    validate: {
      name: (value) => {
        return value ? null : t('categories.common.nameRequired');
      },
      budget: (value) => {
        return value && value >= 0
          ? null
          : t('categories.expense.budgetInvalid');
      },
    },
  });

  const fetchCategories = async () => {
    try {
      const response = await getAllExpenseCategories();
      if (response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching expense categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (values: ICreateExpenseCategoryDto) => {
    try {
      await createExpenseCategory(values);
      form.reset();
      setIsModalOpen(false);
      fetchCategories();
      notifications.show({
        title: t('tables.common.successTitle'),
        message: t('categories.expense.created'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating expense category:', error);
      notifications.show({
        title: t('tables.common.errorTitle'),
        message: t('categories.expense.createFailed'),
        color: 'red',
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (selectedCategoryId) {
      try {
        await deleteExpenseCategory(selectedCategoryId);
        setIsDeleteModalOpen(false);
        fetchCategories();
        notifications.show({
          title: t('tables.common.successTitle'),
          message: t('categories.expense.deleted'),
          color: 'green',
        });
      } catch (error: any) {
        console.error('Error deleting expense category:', error);
        notifications.show({
          title: t('tables.common.errorTitle'),
          message: t('categories.expense.deleteFailed', {
            error: error.response.data,
          }),
          color: 'red',
        });
      }
    }
  };

  const openDeleteModal = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setIsDeleteModalOpen(true);
  };

  const openMigrationModal = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setIsMigrateModalOpen(true);
  };

  return (
    <Box>
      <Group justify="flex-end" mb="md">
        <Button
          onClick={() => {
            return setIsModalOpen(true);
          }}
        >
          {t('categories.expense.addButton')}
        </Button>
      </Group>

      <DataTable
        striped
        withTableBorder
        withColumnBorders
        records={categories}
        columns={[
          {
            accessor: 'name',
            title: t('categories.common.name'),
            noWrap: true,
          },
          {
            accessor: 'description',
            title: t('tables.common.description'),
          },
          { accessor: 'budget', title: t('categories.expense.budget') },
          {
            accessor: 'actions',
            title: t('tables.common.actions'),
            textAlign: 'right',
            render: (category) => {
              return (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip label={t('categories.expense.migrateTooltip')}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        openMigrationModal(
                          category.id!,
                          category.name ?? 'Error',
                        );
                      }}
                    >
                      <IconReplace size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t('categories.common.deleteTooltip')}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        openDeleteModal(category.id!);
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              );
            },
          },
        ]}
      />

      {/* Create Category Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          form.reset();
        }}
        title={t('categories.expense.modalTitle')}
      >
        <form onSubmit={form.onSubmit(handleCreateCategory)}>
          <TextInput
            label={t('categories.common.name')}
            placeholder={t('categories.common.namePlaceholder')}
            required
            {...form.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label={t('tables.common.description')}
            placeholder={t('categories.common.descriptionPlaceholder')}
            {...form.getInputProps('description')}
            mb="md"
          />
          <NumberInput
            label={t('categories.expense.budget')}
            placeholder={t('categories.expense.budgetPlaceholder')}
            required
            min={0}
            {...form.getInputProps('budget')}
            mb="md"
          />
          <Group justify="flex-end">
            <Button type="submit">{t('categories.common.create')}</Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          return setIsDeleteModalOpen(false);
        }}
        title={t('tables.common.confirmDeletion')}
      >
        <p>{t('categories.expense.deleteConfirm')}</p>
        <p>{t('categories.expense.deleteWarning')}</p>
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => {
              return setIsDeleteModalOpen(false);
            }}
          >
            {t('tables.common.cancel')}
          </Button>
          <Button color="red" onClick={handleDeleteCategory}>
            {t('tables.common.delete')}
          </Button>
        </Group>
      </Modal>

      {/* Migrate category modal*/}
      <MigrateCategoryModal
        title={t('categories.migrate.expenseTitle', {
          name: selectedCategoryName,
        })}
        opened={isMigrateModalOpen}
        setIsModalOpen={setIsMigrateModalOpen}
        originCategoryId={selectedCategoryId ?? -1}
        categories={categories
          .filter((c) => {
            return c.id !== selectedCategoryId;
          })
          .map((c) => {
            return { value: c.id?.toString() ?? '', label: c.name ?? '' };
          })}
      />
    </Box>
  );
}
