import { useState, useEffect, useCallback } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  Box,
  ColorPicker,
  Grid,
  Text,
  Space,
} from '@mantine/core';
import { IconTrash, IconEdit, IconTag } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { ICreateTagDto, IUpdateTagDto } from '@clients';
import {
  useDeleteTagById,
  useGetTagsForUser,
  usePostCreateTag,
  usePutUpdateTag,
} from '@requests/tagRequests.ts';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

export default function TagsTable() {
  const { t } = useTranslation();
  const { userTags, setUserTags } = useUserDataContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [color, setColor] = useState<string>('#8c8c88');
  const [getTagsForUser] = useGetTagsForUser();
  const [createTag] = usePostCreateTag();
  const [updateTag] = usePutUpdateTag();
  const [deleteTagById] = useDeleteTagById();

  const form = useForm<ICreateTagDto>({
    validate: {
      name: (value) => {
        return value ? null : t('tags.nameRequired');
      },
    },
  });

  const updateForm = useForm<IUpdateTagDto>({
    validate: {
      name: (value) => {
        return value ? null : t('tags.nameRequired');
      },
    },
  });

  const fetchTags = useCallback(() => {
    getTagsForUser()
      .then((response) => {
        if (response?.data) {
          setUserTags(response.data);
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
      values.color = color;
      await createTag(values);
      form.reset();
      setIsModalOpen(false);
      fetchTags();
      notifications.show({
        title: t('tables.common.successTitle'),
        message: t('tags.created'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      notifications.show({
        title: t('tables.common.errorTitle'),
        message: t('tags.createFailed', { error: String(error) }),
        color: 'red',
      });
    }
  };

  const handleUpdateTag = useCallback(
    async (tagId: number, values: IUpdateTagDto, newColor: string) => {
      try {
        values.color = newColor;
        console.log('COLOR: ', newColor);
        console.log('Sending values: ', values);
        await updateTag(tagId, values);
        updateForm.reset();
        setIsEditModalOpen(false);
        fetchTags();
        notifications.show({
          title: t('tables.common.successTitle'),
          message: t('tags.updated'),
          color: 'green',
        });
      } catch (error) {
        console.error('Error updating tag:', error);
        notifications.show({
          title: t('tables.common.errorTitle'),
          message: t('tags.updateFailed', { error: String(error) }),
          color: 'red',
        });
      }
    },
    [t],
  );

  const handleDeleteTag = async () => {
    if (selectedTagId) {
      try {
        await deleteTagById(selectedTagId);
        setIsDeleteModalOpen(false);
        fetchTags();
        notifications.show({
          title: t('tables.common.successTitle'),
          message: t('tags.deleted'),
          color: 'green',
        });
      } catch (error: any) {
        console.error('Error deleting Tag:', error);
        notifications.show({
          title: t('tables.common.errorTitle'),
          message: t('tags.deleteFailed', { error: error.response.data }),
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
          {t('tags.addButton')}
        </Button>
      </Group>

      <DataTable
        striped
        withTableBorder
        withColumnBorders
        records={userTags}
        columns={[
          { accessor: 'name', title: t('tags.name'), noWrap: true },
          {
            accessor: 'description',
            title: t('tables.common.description'),
          },
          {
            accessor: 'color',
            title: t('tags.color'),
            render: (tag) => {
              return <IconTag color={tag.color} size={25} />;
            },
          },
          {
            accessor: 'actions',
            title: t('tables.common.actions'),
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
                      setColor(tag.color ?? '#8c8c88');
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
        title={t('tags.addModalTitle')}
      >
        <form onSubmit={form.onSubmit(handleCreateTag)}>
          <TextInput
            label={t('tags.name')}
            placeholder={t('tags.namePlaceholder')}
            required
            {...form.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label={t('tables.common.description')}
            placeholder={t('tags.descriptionPlaceholder')}
            {...form.getInputProps('description')}
            mb="md"
          />
          <Text>{t('tags.tagColor')}</Text>
          <Space h="xs" />
          <Grid>
            <Grid.Col span={8}>
              <ColorPicker value={color} onChange={setColor} />
            </Grid.Col>
            <Grid.Col span={4}>
              <IconTag color={color} size={50} />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end">
            <Button type="submit">{t('tags.create')}</Button>
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
        title={t('tags.updateModalTitle')}
      >
        <form
          onSubmit={updateForm.onSubmit((values) => {
            handleUpdateTag(selectedTagId!, values, color);
          })}
        >
          <TextInput
            label={t('tags.name')}
            placeholder={t('tags.namePlaceholder')}
            required
            key={updateForm.key('name')}
            {...updateForm.getInputProps('name')}
            mb="md"
          />
          <Textarea
            label={t('tables.common.description')}
            placeholder={t('tags.descriptionPlaceholder')}
            key={updateForm.key('description')}
            {...updateForm.getInputProps('description')}
            mb="md"
          />
          <Text>{t('tags.tagColor')}</Text>
          <Space h="xs" />
          <Grid>
            <Grid.Col span={8}>
              <ColorPicker value={color} onChange={setColor} />
            </Grid.Col>
            <Grid.Col span={4}>
              <IconTag color={color} size={50} />
            </Grid.Col>
          </Grid>
          <Group justify="flex-end">
            <Button type="submit">{t('tags.update')}</Button>
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
        <p>{t('tags.deleteConfirm')}</p>
        <p>{t('tags.deleteWarning')}</p>
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteModalOpen(false);
            }}
          >
            {t('tables.common.cancel')}
          </Button>
          <Button color="red" onClick={handleDeleteTag}>
            {t('tables.common.delete')}
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
