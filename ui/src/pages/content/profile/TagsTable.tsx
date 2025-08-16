import { useState, useEffect, useCallback } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  Box,
} from '@mantine/core';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ICreateTagDto, IGetTagDto, IUpdateTagDto } from '@clients';
import {
  useDeleteTagById,
  useGetTagsForUser,
  usePostCreateTag,
  usePutUpdateTag,
} from '@requests/tagRequests.ts';

export default function TagsTable() {
  const [tags, setTags] = useState<IGetTagDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [getTagsForUser] = useGetTagsForUser();
  const [createTag] = usePostCreateTag();
  const [updateTag] = usePutUpdateTag();
  const [deleteTagById] = useDeleteTagById();

  const form = useForm<ICreateTagDto>({
    validate: {
      name: (value) => {
        return value ? null : 'Name is required';
      },
    },
  });

  const updateForm = useForm<IUpdateTagDto>({
    validate: {
      name: (value) => {
        return value ? null : 'Name is required';
      },
    },
  });

  const fetchTags = useCallback(() => {
    getTagsForUser()
      .then((response) => {
        if (response?.data) {
          setTags(response.data);
        }
      })
      .catch((error) => {
        return console.error('Error fetching tags:', error);
      });
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreateTag = async (values: ICreateTagDto) => {
    try {
      await createTag(values);
      form.reset();
      setIsModalOpen(false);
      fetchTags();
      notifications.show({
        title: 'Success',
        message: 'Tag created successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create tag: ' + error,
        color: 'red',
      });
    }
  };

  const handleUpdateTag = useCallback(
    async (tagId: number, values: IUpdateTagDto) => {
      try {
        await updateTag(tagId, values);
        updateForm.reset();
        setIsEditModalOpen(false);
        fetchTags();
        notifications.show({
          title: 'Success',
          message: 'Tag updated successfully',
          color: 'green',
        });
      } catch (error) {
        console.error('Error updating tag:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to update tag: ' + error,
          color: 'red',
        });
      }
    },
    [],
  );

  const handleDeleteTag = async () => {
    if (selectedTagId) {
      try {
        await deleteTagById(selectedTagId);
        setIsDeleteModalOpen(false);
        fetchTags();
        notifications.show({
          title: 'Success',
          message: 'Tag deleted successfully',
          color: 'green',
        });
      } catch (error: any) {
        console.error('Error deleting Tag:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to deleteTag: ' + error.response.data,
          color: 'red',
        });
      }
    }
  };

  const openDeleteModal = (tagId: number) => {
    setSelectedTagId(tagId);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = useCallback((tagId: number) => {
    setSelectedTagId(tagId);
    setIsEditModalOpen(true);
  }, []);

  return (
    <Box>
      <Group justify="flex-end" mb="md">
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Add Tag
        </Button>
      </Group>

      <DataTable
        striped
        withTableBorder
        withColumnBorders
        records={tags}
        columns={[
          { accessor: 'name', title: 'Name', noWrap: true },
          { accessor: 'description', title: 'Description' },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            render: (tag) => {
              return (
                <Group gap={4} justify="right" wrap="nowrap">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="blue"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      updateForm.setValues(tag);
                      openEditModal(tag.id!);
                    }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      openDeleteModal(tag.id!);
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

      {/* Create Tag Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          form.reset();
        }}
        title="Add Tag"
      >
        <form onSubmit={form.onSubmit(handleCreateTag)}>
          <TextInput
            label="Name"
            placeholder="Tag name"
            required
            {...form.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label="Description"
            placeholder="Tag description"
            {...form.getInputProps('description')}
            mb="md"
          />
          <Group justify="flex-end">
            <Button type="submit">Create</Button>
          </Group>
        </form>
      </Modal>

      {/* Update Tag Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          form.reset();
        }}
        title="Update Tag"
      >
        <form
          onSubmit={updateForm.onSubmit((values) => {
            handleUpdateTag(selectedTagId!, values);
          })}
        >
          <TextInput
            label="Name"
            placeholder="Tag name"
            required
            key={updateForm.key('name')}
            {...updateForm.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label="Description"
            placeholder="Tag description"
            key={updateForm.key('description')}
            {...updateForm.getInputProps('description')}
            mb="md"
          />
          <Group justify="flex-end">
            <Button type="submit">Update</Button>
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
        <p>Are you sure you want to delete this tag?</p>
        <p>
          If there are expenses/incomes with this tag the tag will NOT be
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
          <Button color="red" onClick={handleDeleteTag}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
