import { useEffect, useState } from 'react';
import { Group, SelectProps } from '@mantine/core';
import { IconCheck, IconTag } from '@tabler/icons-react';

export interface TagOption {
  value: string;
  label: string;
}

export interface TagColorOption {
  value: string;
  color: string;
}

interface UserTagLike {
  id?: number;
  name?: string;
  color?: string;
}

export function useTagOptions(userTags: UserTagLike[]) {
  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagsWithColor, setTagsWithColor] = useState<TagColorOption[]>([]);

  useEffect(() => {
    const tagOptions: TagOption[] = [];
    const tagColors: TagColorOption[] = [];
    for (const tag of userTags) {
      tagOptions.push({ label: tag.name!, value: tag.id?.toString() ?? '0' });
      tagColors.push({ value: tag.id?.toString() ?? '0', color: tag.color! });
    }
    setTags(tagOptions);
    setTagsWithColor(tagColors);
  }, [userTags]);

  return { tags, tagsWithColor };
}

export function renderTagOptionWithColor(
  tagsWithColor: TagColorOption[],
): SelectProps['renderOption'] {
  return ({ option, checked }) => {
    const tag = tagsWithColor.find((t) => {
      return t.value === option.value;
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
        <IconTag {...iconProps} />
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
}
