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
import { IconReplace, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ICreateIncomeCategoryDto, IGetIncomeCategoryDto } from '@clients';
import {
  useDeleteIncomeCategory,
  useGetAllIncomeCategories,
  usePutIncomeCreate,
} from '@requests/categoryRequests.ts';
import MigrateCategoryModal from './MigrateCategoryModal.tsx';

export default function IncomeCategoryTable() {
  const [categories, setCategories] = useState<IGetIncomeCategoryDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | undefined
  >();
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [getAllIncomeCategories] = useGetAllIncomeCategories();
  const [createIncomeCategory] = usePutIncomeCreate();
  const [deleteIncomeCategory] = useDeleteIncomeCategory();

  const form = useForm<ICreateIncomeCategoryDto>({
    validate: {
      name: (value) => {
        return value ? null : 'Name is required';
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
        title: 'Success',
        message: 'Income category created successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating income category:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create income category',
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
          title: 'Success',
          message: 'Income category deleted successfully',
          color: 'green',
        });
      } catch (error: any) {
        console.error('Error deleting income category:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete income category: ' + error.response.data,
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
            setIsModalOpen(true);
          }}
        >
          Add Income Category
        </Button>
      </Group>

      <DataTable
        striped
        withTableBorder
        withColumnBorders
        records={categories}
        columns={[
          { accessor: 'name', title: 'Name', noWrap: true },
          { accessor: 'description', title: 'Description' },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            render: (category) => {
              return (
                <Group gap={4} justify="right" wrap="nowrap">
                  <Tooltip
                    label={'Migrate all incomes to a different category'}
                  >
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
                  <Tooltip label={'Delete category'}>
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
        title="Add Income Category"
      >
        <form onSubmit={form.onSubmit(handleCreateCategory)}>
          <TextInput
            label="Name"
            placeholder="Category name"
            required
            {...form.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label="Description"
            placeholder="Category description"
            {...form.getInputProps('description')}
            mb="md"
          />
          <Group justify="flex-end">
            <Button type="submit">Create</Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
        }}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this income category?</p>
        <p>
          If there are incomes with this category the category will NOT be
          deleted.
        </p>
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteCategory}>
            Delete
          </Button>
        </Group>
      </Modal>

      {/* Migrate category modal*/}
      <MigrateCategoryModal
        title={`Migrate incomes from "${selectedCategoryName}" to`}
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
