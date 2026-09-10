import { ReactNode } from 'react';
import { DateInput, DateValue } from '@mantine/dates';

interface IExpensesDateInputWrapperProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  /**
   * Dayjs format to display input value, "MMMM D, YYYY" by default
   */
  valueFormat?: string;
  onChange?: (value: DateValue) => void;
  dateParser?: (value: string) => Date | null;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  clearable?: boolean;
  leftSection?: ReactNode;
  mb?: number | string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xs';
}

/**
 * Parses a date string in the format "DD/MM/YYYY" and returns a Date object.
 * @param input
 */
function parseDayMonthYear(input: string) {
  const parts = input.split('/');

  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is zero-based
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  return new Date(year, month, day);
}

/**
 * ExpensesDateInputWrapper component, this should be used just like a normal mantine input component with the useForm hook
 * @param props
 * @constructor
 */
export default function ExpensesDateInputWrapper(
  props: IExpensesDateInputWrapperProps,
) {
  return (
    <DateInput
      label={props.label}
      required={props.required}
      placeholder={props.placeholder ? props.placeholder : 'DD/MM/AAAA'}
      defaultValue={
        props.defaultValue ? new Date(props.defaultValue) : undefined
      }
      valueFormat={props.valueFormat ? props.valueFormat : 'DD/MM/YYYY'}
      onChange={props.onChange}
      dateParser={props.dateParser ? props.dateParser : parseDayMonthYear}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      error={props.error}
      clearable={props.clearable}
      leftSection={props.leftSection}
      mb={props.mb}
      size={props.size}
    />
  );
}
