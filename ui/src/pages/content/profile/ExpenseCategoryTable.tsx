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
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ICreateExpenseCategoryDto, IGetExpenseCategoryDto } from '@clients';
import {
  useDeleteExpenseCategory,
  useGetAllExpenseCategories,
  usePutExpenseCreate,
} from '@requests/categoryRequests.ts';

export default function ExpenseCategoryTable() {
  const [categories, setCategories] = useState<IGetExpenseCategoryDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [getAllExpenseCategories] = useGetAllExpenseCategories();
  const [createExpenseCategory] = usePutExpenseCreate();
  const [deleteExpenseCategory] = useDeleteExpenseCategory();

  const form = useForm<ICreateExpenseCategoryDto>({
    validate: {
      name: (value) => {
        return value ? null : 'Name is required';
      },
      budget: (value) => {
        return value && value >= 0 ? null : 'Budget must be a positive number';
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
        title: 'Success',
        message: 'Expense category created successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating expense category:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create expense category',
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
          title: 'Success',
          message: 'Expense category deleted successfully',
          color: 'green',
        });
      } catch (error) {
        console.error('Error deleting expense category:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete expense category',
          color: 'red',
        });
      }
    }
  };

  const openDeleteModal = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setIsDeleteModalOpen(true);
  };

  return (
    <Box>
      <Group justify="flex-end" mb="md">
        <Button
          onClick={() => {
            return setIsModalOpen(true);
          }}
        >
          Add Expense Category
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
          { accessor: 'budget', title: 'Budget' },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            render: (category) => {
              return (
                <Group gap={4} justify="right" wrap="nowrap">
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
        title="Add Expense Category"
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
          <NumberInput
            label="Budget"
            placeholder="Budget amount"
            required
            min={0}
            {...form.getInputProps('budget')}
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
          return setIsDeleteModalOpen(false);
        }}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this expense category?</p>
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => {
              return setIsDeleteModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteCategory}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
