import { Button, Group, Modal, Select, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IMigrateCategoryDto } from '@clients';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useMigrateCategory } from '@requests/categoryRequests.ts';

interface IMigrateCategoryModalProps {
  opened: boolean;
  setIsModalOpen: (value: React.SetStateAction<boolean>) => void;
  title: string;
  categories: { value: string; label: string }[];
  originCategoryId: number;
}

export default function MigrateCategoryModal(
  props: IMigrateCategoryModalProps,
) {
  const [targetCategoryName, setTargetCategoryName] = useState<
    string | undefined
  >();
  const [loading, setLoading] = useState(false);

  const [migrateCategory] = useMigrateCategory();

  const migrationForm = useForm<IMigrateCategoryDto>({
    mode: 'uncontrolled',
    name: 'categoryMigrationForm',
    validate: {
      categoryBId: (value) => {
        return value !== undefined ? null : 'Category is required';
      },
    },
    onValuesChange: (values) => {
      if (values.categoryBId !== undefined) {
        setTargetCategoryName(() => {
          const selectedCategory = props.categories.find((category) => {
            return category.value === values.categoryBId?.toString();
          });
          return selectedCategory?.label;
        });
        return;
      }
    },
  });

  const handleMigration = async (values: IMigrateCategoryDto) => {
    setLoading(true);
    try {
      const formData: IMigrateCategoryDto = {
        categoryAId: props.originCategoryId,
        categoryBId: Number(values.categoryBId),
      };
      const response = await migrateCategory(formData);
      if (response) {
        notifications.show({
          title: 'Success',
          message: `Items migrated to: "${targetCategoryName}"`,
          color: 'green',
        });
        migrationForm.reset();
        props.setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error migrating category:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to migrate category',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={props.opened}
      onClose={() => {
        return props.setIsModalOpen(false);
      }}
      title={
        targetCategoryName
          ? `${props.title} "${targetCategoryName}"`
          : `${props.title} ...`
      }
      size="lg"
      centered
    >
      <form onSubmit={migrationForm.onSubmit(handleMigration)}>
        <Select
          label="Select target category"
          placeholder="Target category"
          data={props.categories}
          required
          mt={'md'}
          mb="md"
          size="md"
          key={migrationForm.key('categoryBId')}
          {...migrationForm.getInputProps('categoryBId')}
        />
        {targetCategoryName && (
          <Text
            mb={'md'}
            c={'red'}
            size={'lg'}
          >{`Every item will be migrated to "${targetCategoryName}" category!`}</Text>
        )}
        <Group justify="flex-end">
          <Button
            variant="outline"
            onClick={() => {
              return props.setIsModalOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            type={'submit'}
            disabled={!targetCategoryName || loading}
          >
            Migrate
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
