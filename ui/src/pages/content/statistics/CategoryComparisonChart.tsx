import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart } from '@mantine/charts';
import {
  Paper,
  Title,
  Text,
  Group,
  Select,
  Button,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useCompareCategories } from '@requests/expensesRequests.ts';
import { useUserDataContext } from '@hooks/useUserDataContext.tsx';

interface FormValues {
  currentPeriodType: string;
  currentPeriodValue: string;
  previousPeriodType: string;
  previousPeriodValue: string;
  currentYear?: string;
  previousYear?: string;
}

interface CategoryComparisonData {
  categoryId: number;
  categoryName: string;
  currentPeriodAmount: number;
  previousPeriodAmount: number;
  difference: number;
  percentageChange: number;
}

interface ComparisonResponse {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  categories: CategoryComparisonData[];
  totalCurrentPeriod: number;
  totalPreviousPeriod: number;
  totalDifference: number;
  totalPercentageChange: number;
}

const CategoryComparisonChart: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [comparisonData, setComparisonData] =
    useState<ComparisonResponse | null>(null);
  const [chartData, setChartData] = useState<
    { category: string; [key: string]: string | number }[]
  >([]);

  const [compareCategories] = useCompareCategories();

  const { userData } = useUserDataContext();

  const periodTypeOptions = [
    { value: 'month', label: t('statistics.categoryComparison.periodMonth') },
    { value: 'year', label: t('statistics.categoryComparison.periodYear') },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    return {
      value: (i + 1).toString(),
      label: t(`statistics.months.long.${i + 1}`),
    };
  });

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const form = useForm<FormValues>({
    initialValues: {
      currentPeriodType: 'month',
      currentPeriodValue: new Date().getMonth() + 1 + '',
      previousPeriodType: 'month',
      previousPeriodValue:
        new Date().getMonth() === 0 ? '12' : new Date().getMonth() + '',
      currentYear: new Date().getFullYear() + '',
      previousYear:
        new Date().getMonth() === 0
          ? new Date().getFullYear() - 1 + ''
          : new Date().getFullYear() + '',
    },
    validate: {
      currentPeriodValue: (value) => {
        if (!value) {
          return t('statistics.categoryComparison.validation.currentRequired');
        }
        if (
          form.values.currentPeriodType === 'month' &&
          (parseInt(value) < 1 || parseInt(value) > 12)
        ) {
          return t('statistics.categoryComparison.validation.monthRange');
        }
        return null;
      },
      previousPeriodValue: (value) => {
        if (!value) {
          return t('statistics.categoryComparison.validation.previousRequired');
        }
        if (
          form.values.previousPeriodType === 'month' &&
          (parseInt(value) < 1 || parseInt(value) > 12)
        ) {
          return t('statistics.categoryComparison.validation.monthRange');
        }
        return null;
      },
      currentYear: (value, values) => {
        if (values.currentPeriodType === 'month' && !value) {
          return t(
            'statistics.categoryComparison.validation.currentYearRequired',
          );
        }
        return null;
      },
      previousYear: (value, values) => {
        if (values.previousPeriodType === 'month' && !value) {
          return t(
            'statistics.categoryComparison.validation.previousYearRequired',
          );
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (comparisonData) {
      // Transform the data for the BarChart component
      const transformedData = comparisonData.categories.map((category) => {
        return {
          category: category.categoryName,
          [comparisonData.currentPeriodLabel]: category.currentPeriodAmount,
          [comparisonData.previousPeriodLabel]: category.previousPeriodAmount,
        };
      });

      setChartData(transformedData);
    }
  }, [comparisonData]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await compareCategories(
        values.currentPeriodType,
        parseInt(values.currentPeriodValue),
        values.previousPeriodType,
        parseInt(values.previousPeriodValue),
        values.currentYear ? parseInt(values.currentYear) : undefined,
        values.previousYear ? parseInt(values.previousYear) : undefined,
      );

      if (response?.data) {
        setComparisonData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      notifications.show({
        title: t('statistics.common.errorTitle'),
        message: t('statistics.categoryComparison.error'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      <Title order={4} mb="md">
        {t('statistics.categoryComparison.title')}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
            <Stack>
              <Title order={6}>
                {t('statistics.categoryComparison.currentPeriod')}
              </Title>
              <Select
                label={t('statistics.categoryComparison.periodType')}
                placeholder={t(
                  'statistics.categoryComparison.periodTypePlaceholder',
                )}
                data={periodTypeOptions}
                {...form.getInputProps('currentPeriodType')}
              />

              {form.values.currentPeriodType === 'month' ? (
                <>
                  <Select
                    label={t('statistics.common.month')}
                    placeholder={t(
                      'statistics.categoryComparison.monthPlaceholder',
                    )}
                    data={monthOptions}
                    {...form.getInputProps('currentPeriodValue')}
                  />

                  <Select
                    label={t('statistics.common.year')}
                    placeholder={t(
                      'statistics.categoryComparison.yearPlaceholder',
                    )}
                    data={yearOptions}
                    {...form.getInputProps('currentYear')}
                  />
                </>
              ) : (
                <Select
                  label={t('statistics.common.year')}
                  placeholder={t(
                    'statistics.categoryComparison.yearPlaceholder',
                  )}
                  data={yearOptions}
                  {...form.getInputProps('currentPeriodValue')}
                />
              )}
            </Stack>

            <Stack>
              <Title order={6}>
                {t('statistics.categoryComparison.previousPeriod')}
              </Title>
              <Select
                label={t('statistics.categoryComparison.periodType')}
                placeholder={t(
                  'statistics.categoryComparison.periodTypePlaceholder',
                )}
                data={periodTypeOptions}
                {...form.getInputProps('previousPeriodType')}
              />

              {form.values.previousPeriodType === 'month' ? (
                <>
                  <Select
                    label={t('statistics.common.month')}
                    placeholder={t(
                      'statistics.categoryComparison.monthPlaceholder',
                    )}
                    data={monthOptions}
                    {...form.getInputProps('previousPeriodValue')}
                  />

                  <Select
                    label={t('statistics.common.year')}
                    placeholder={t(
                      'statistics.categoryComparison.yearPlaceholder',
                    )}
                    data={yearOptions}
                    {...form.getInputProps('previousYear')}
                  />
                </>
              ) : (
                <Select
                  label={t('statistics.common.year')}
                  placeholder={t(
                    'statistics.categoryComparison.yearPlaceholder',
                  )}
                  data={yearOptions}
                  {...form.getInputProps('previousPeriodValue')}
                />
              )}
            </Stack>
          </Group>

          <Button type="submit" loading={loading}>
            {t('statistics.categoryComparison.compare')}
          </Button>
        </Stack>
      </form>

      {loading && (
        <Center h={400}>
          <Loader size="xl" />
        </Center>
      )}

      {!loading && comparisonData && (
        <>
          <Title order={5} mt="xl" mb="md">
            {t('statistics.categoryComparison.versus', {
              current: comparisonData.currentPeriodLabel,
              previous: comparisonData.previousPeriodLabel,
            })}
          </Title>

          {chartData.length > 0 ? (
            <BarChart
              h={400}
              data={chartData}
              dataKey="category"
              series={[
                { name: comparisonData.currentPeriodLabel, color: '#4CAF50' },
                { name: comparisonData.previousPeriodLabel, color: '#2196F3' },
              ]}
              withLegend
              withTooltip
            />
          ) : (
            <Text>{t('statistics.categoryComparison.noData')}</Text>
          )}

          <Group justify={'space-between'} mt="xl">
            <Stack gap="xs">
              <Text fw={500}>
                {t('statistics.categoryComparison.totalFor', {
                  period: comparisonData.currentPeriodLabel,
                })}
              </Text>
              <Text size="xl" fw={700}>
                {userData?.currency?.symbol}
                {comparisonData.totalCurrentPeriod.toFixed(2)}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text fw={500}>
                {t('statistics.categoryComparison.totalFor', {
                  period: comparisonData.previousPeriodLabel,
                })}
              </Text>
              <Text size="xl" fw={700}>
                {userData?.currency?.symbol}
                {comparisonData.totalPreviousPeriod.toFixed(2)}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text fw={500}>
                {t('statistics.categoryComparison.difference')}
              </Text>
              <Text
                size="xl"
                fw={700}
                c={comparisonData.totalDifference >= 0 ? 'red' : 'green'}
              >
                {userData?.currency?.symbol}
                {comparisonData.totalDifference.toFixed(2)}(
                {comparisonData.totalPercentageChange >= 0 ? '+' : ''}
                {comparisonData.totalPercentageChange.toFixed(2)}%)
              </Text>
            </Stack>
          </Group>
        </>
      )}
    </Paper>
  );
};

export default CategoryComparisonChart;
