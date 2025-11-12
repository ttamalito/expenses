import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import {
  Paper,
  Title,
  NumberInput,
  Select,
  Button,
  Group,
  Textarea,
  LoadingOverlay,
  Tooltip,
  SelectProps,
} from '@mantine/core';
import { ICreateIncomeDto, IGetTagDto } from '@clients';
import { usePostAdd } from '@requests/incomesRequests';
import { useGetAllIncomeCategories } from '@requests/categoryRequests';
import { notifications } from '@mantine/notifications';
import ExpensesDateInputWrapper from '../../../../components/wrappers/ExpensesDateInputWrapper.tsx';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';
import { IconCheck, IconTag } from '@tabler/icons-react';

interface CategoryOption {
  value: string;
  label: string;
}

interface TagOption {
  value: string;
  label: string;
}

interface IAddIncomeProps {
  tagsDto: IGetTagDto[];
  setUpdateCharts: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddIncome({
  tagsDto,
  setUpdateCharts,
}: IAddIncomeProps) {
  const { userData } = useUserDataContext();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [currencyId, setCurrencyId] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagsWithColor, setTagsWithColor] = useState<
    { value: string; color: string }[]
  >([]);
  const [selectedTag, setSelectedTag] = useState<
    { value: string; color: string } | undefined
  >(undefined);

  const [postAddIncome] = usePostAdd();
  const [getAllCategories] = useGetAllIncomeCategories();

  const form = useForm<ICreateIncomeDto>({
    mode: 'uncontrolled',
    // validate: {
    //   amount: (value) => {
    //     return value && value <= 0 ? 'Amount must be greater than 0' : null;
    //   },
    //   categoryId: (value) => {
    //     return value && value <= 0 ? 'Please select a category' : null;
    //   },
    //   name: (value) => {
    //     return value.trim().length < 1 ? 'Name is required' : null;
    //   },
    // },
    onValuesChange: (values) => {
      if (values.tagId === undefined) {
        setSelectedTag(undefined);
        return;
      }
      const tagIdAsString = String(values.tagId);
      if (tagIdAsString !== selectedTag?.value) {
        const tag = tagsWithColor.find((tag) => {
          return tag.value === tagIdAsString;
        });
        setSelectedTag(tag);
      }
    },
  });

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

  useEffect(() => {
    const tagOptions = [];
    const tagsWithColors: { value: string; color: string }[] = [];
    for (const tag of tagsDto) {
      const option: TagOption = {
        value: tag.id?.toString() ?? '0',
        label: tag.name!,
      };
      tagOptions.push(option);
      const tagColorOption = {
        value: tag.id?.toString() ?? '0',
        color: tag.color!,
      };
      tagsWithColors.push(tagColorOption);
    }
    setTagsWithColor(tagsWithColors);
    setTags(tagOptions);
  }, [tagsDto]);

  // Fetch user currency
  useEffect(() => {
    try {
      if (userData?.currencyId !== undefined) {
        setCurrencyId(userData.currencyId);
        form.setFieldValue('currencyId', userData.currencyId);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, [userData]);

  const handleSubmit = (values: ICreateIncomeDto) => {
    setLoading(true);
    // Ensure categoryId is a number
    const formData = {
      ...values,
      categoryId: Number(values.categoryId),
      currencyId: currencyId || 1, // Default to 1 if not set
    };
    postAddIncome(formData)
      .then(() => {
        form.reset();
        setUpdateCharts((oldValue) => {
          return !oldValue;
        });
        notifications.show({
          title: 'Success',
          message: 'Income added successfully',
          color: 'green',
        });
      })
      .catch((error) => {
        console.error('Failed to add income:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to add income',
          color: 'red',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderTagsWithColor: SelectProps['renderOption'] = ({
    option,
    checked,
  }) => {
    const tag = tagsWithColor.find((tag) => {
      return tag.value === option.value;
    });
    const iconProps = {
      stroke: 1.5,
      color: tag ? tag.color : 'currentColor',
      size: 18,
    };
    const checkIconProps = {
      stroke: 1.5,
      color: 'currentColor',
      opacity: 0.6,
      size: 18,
    };
    return (
      <Group flex="1" gap="xs">
        {<IconTag {...iconProps} />}
        {option.label}
        {checked && (
          <IconCheck
            style={{ marginInlineStart: 'auto' }}
            {...checkIconProps}
          />
        )}
      </Group>
    );
  };

  return (
    <Paper p="md" radius="md" withBorder>
      <LoadingOverlay visible={loading} />
      <Title order={3} mb="md">
        Add New Income
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Category"
          placeholder="Select a category"
          data={categories}
          required
          mb="md"
          key={form.key('categoryId')}
          {...form.getInputProps('categoryId')}
        />

        <NumberInput
          label="Amount"
          placeholder="0.00"
          required
          min={0.01}
          step={0.01}
          //precision={2}
          mb="md"
          key={form.key('amount')}
          {...form.getInputProps('amount')}
        />

        <ExpensesDateInputWrapper
          label="Date"
          placeholder="Pick a date"
          mb="md"
          key={form.key('date')}
          {...form.getInputProps('date')}
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          mb="md"
          key={form.key('description')}
          {...form.getInputProps('description')}
        />

        <Select
          label="Tag"
          placeholder="Optional Tag"
          data={tags}
          mb="md"
          clearable
          searchable
          renderOption={renderTagsWithColor}
          leftSection={
            <IconTag color={selectedTag?.color ?? 'currentColor'} size={18} />
          }
          key={form.key('tagId')}
          {...form.getInputProps('tagId')}
        />

        <Group justify="flex-end" mt="md">
          <Tooltip
            label={'Cannot submit income, no currency was found for the user'}
            disabled={currencyId !== undefined}
            color="teal"
            withArrow
            position="top"
          >
            <Button
              disabled={currencyId === undefined}
              type="submit"
              color="green"
            >
              Add Income
            </Button>
          </Tooltip>
        </Group>
      </form>
    </Paper>
  );
}
