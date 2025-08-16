import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IExpense } from '@clients';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import ExpensesDateInputWrapper from '../../wrappers/ExpensesDateInputWrapper.tsx';
import { notifications } from '@mantine/notifications';
import { usePostModify } from '@requests/expensesRequests.ts';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface CategoryOption {
  value: string;
  label: string;
}

interface IEditExpenseModalProps {
  expense: IExpense;
  categories: CategoryOption[];
  onExpenseUpdated?: () => void;
}

export default function EditExpenseModal(props: IEditExpenseModalProps) {
  const { userTags } = useUserDataContext();
  const [disabled, setDisabled] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [modifyExpense] = usePostModify();

  // Handle form submission for editing
  const handleSubmit = async (values: IExpense) => {
    setDisabled(true);
    try {
      await modifyExpense(values);
      notifications.show({
        title: 'Success',
        message: 'Expense updated successfully',
        color: 'green',
      });
      close();
      if (props.onExpenseUpdated) props.onExpenseUpdated();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update expense',
        color: 'red',
      });
    } finally {
      setDisabled(false);
    }
  };

  const form = useForm<IExpense>({
    mode: 'uncontrolled',
    initialValues: {
      ...props.expense,
    },
  });

  return (
    <>
      {/* Edit Modal */}
      <Modal opened={opened} onClose={close} title="Edit Expense">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Description"
              placeholder="Enter description"
              key={form.key('description')}
              {...form.getInputProps('description')}
            />
            <NumberInput
              label="Amount"
              placeholder="Enter amount"
              decimalScale={2}
              key={form.key('amount')}
              {...form.getInputProps('amount')}
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={props.categories}
              key={form.key('categoryId')}
              {...form.getInputProps('categoryId')}
            />
            <ExpensesDateInputWrapper
              label="Date"
              placeholder="Select date"
              key={form.key('date')}
              {...form.getInputProps('date')}
            />
            <Select
              label="Tag"
              placeholder="Optional tag"
              data={userTags.map((tag) => {
                return {
                  value: tag.id?.toString() ?? '0',
                  label: tag.name!,
                };
              })}
              key={form.key('tagId')}
              {...form.getInputProps('tagId')}
            />
            <Group justify="flex-end" mt="md">
              <Button disabled={disabled} type="submit">
                Save
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <ActionIcon variant="subtle" color="blue" onClick={open}>
        <IconEdit size={16} />
      </ActionIcon>
    </>
  );
}
