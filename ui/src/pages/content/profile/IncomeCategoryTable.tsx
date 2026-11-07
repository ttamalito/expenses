import { useState, useEffect } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  Box,
  Tooltip,
} from '@mantine/core';
import { IconReplace, IconTrash, IconEdit } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
  ICreateIncomeCategoryDto,
  IGetIncomeCategoryDto,
  IUpdateIncomeCategoryDto,
} from '@clients';
import {
  useDeleteIncomeCategory,
  useGetAllIncomeCategories,
  usePutIncomeCreate,
  useUpdateIncomeCategory,
} from '@requests/categoryRequests.ts';
import MigrateCategoryModal from './MigrateCategoryModal.tsx';

export default function IncomeCategoryTable() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<IGetIncomeCategoryDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | undefined
  >();
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [getAllIncomeCategories] = useGetAllIncomeCategories();
  const [createIncomeCategory] = usePutIncomeCreate();
  const [updateIncomeCategory] = useUpdateIncomeCategory();
  const [deleteIncomeCategory] = useDeleteIncomeCategory();

  const form = useForm<ICreateIncomeCategoryDto>({
    validate: {
      name: (value) => {
        return value ? null : t('categories.common.nameRequired');
      },
    },
  });

  const editCategoryForm = useForm<IUpdateIncomeCategoryDto>({
    validate: {
      name: (value) => {
        return value ? null : t('categories.common.nameRequired');
      },
    },
  });

  const fetchCategories = async () => {
    try {
      const response = await getAllIncomeCategories();
      if (response?.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching income categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (values: ICreateIncomeCategoryDto) => {
    try {
      await createIncomeCategory(values);
      form.reset();
      setIsModalOpen(false);
      fetchCategories();
      notifications.show({
        title: t('tables.common.successTitle'),
        message: t('categories.income.created'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating income category:', error);
      notifications.show({
        title: t('tables.common.errorTitle'),
        message: t('categories.income.createFailed'),
        color: 'red',
      });
    }
  };

  const handleUpdateCategory = async (values: IUpdateIncomeCategoryDto) => {
    try {
      await updateIncomeCategory(values);
      editCategoryForm.reset();
      setIsEditModalOpen(false);
      fetchCategories();
      notifications.show({
        title: t('tables.common.successTitle'),
        message: t('categories.income.edited'),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t('tables.common.errorTitle'),
        message: t('categories.income.editedFailed'),
        color: 'red',
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (selectedCategoryId) {
      try {
        await deleteIncomeCategory(selectedCategoryId);
        setIsDeleteModalOpen(false);
        fetchCategories();
        notifications.show({
          title: t('tables.common.successTitle'),
          message: t('categories.income.deleted'),
          color: 'green',
        });
      } catch (error: any) {
        console.error('Error deleting income category:', error);
        notifications.show({
          title: t('tables.common.errorTitle'),
          message: t('categories.income.deleteFailed', {
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

  const openEditModal = (category: IGetIncomeCategoryDto) => {
    editCategoryForm.setValues({
      categoryId: category.id,
      name: category.name,
      description: category.description,
    });
    setIsEditModalOpen(true);
  };

  return (
    <Box>
      <Group justify="flex-end" mb="md">
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          {t('categories.income.addButton')}
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
          {
            accessor: 'actions',
            title: t('tables.common.actions'),
            textAlign: 'right',
            render: (category) => {
              return (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip label={t('categories.income.migrateTooltip')}>
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
                  <Tooltip label={t('categories.income.editCategoryTooltip')}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="green"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        openEditModal(category);
                      }}
                    >
                      <IconEdit size={16} />
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
        title={t('categories.income.modalTitle')}
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
          <Group justify="flex-end">
            <Button type="submit">{t('categories.common.create')}</Button>
          </Group>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          editCategoryForm.reset();
        }}
        title={t('categories.income.editModalTitle')}
      >
        <form onSubmit={editCategoryForm.onSubmit(handleUpdateCategory)}>
          <TextInput
            label={t('categories.common.name')}
            placeholder={t('categories.common.namePlaceholder')}
            required
            {...editCategoryForm.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label={t('tables.common.description')}
            placeholder={t('categories.common.descriptionPlaceholder')}
            {...editCategoryForm.getInputProps('description')}
            mb="md"
          />
          <Group justify="flex-end">
            <Button type="submit">{t('categories.common.edit')}</Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        title={t('tables.common.confirmDeletion')}
      >
        <p>{t('categories.income.deleteConfirm')}</p>
        <p>{t('categories.income.deleteWarning')}</p>
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteModalOpen(false);
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
        title={t('categories.migrate.incomeTitle', {
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
