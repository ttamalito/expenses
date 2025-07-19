import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { routes } from '@routes';
import {
  Box,
  Button,
  NumberInput,
  Group,
  Title,
  Paper,
  Stack,
} from '@mantine/core';
import CategoryComparisonChart from './CategoryComparisonChart';
import CashFlowChart from './CashFlowChart';

const Statistics: React.FC = () => {
  const navigate = useNavigate();
  const [yearForSummary, setYearForSummary] = useState<number | undefined>(
    new Date().getFullYear(),
  );
  const [yearForMonthSummary, setYearForMonthSummary] = useState<
    number | undefined
  >(new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(
    new Date().getMonth() + 1,
  );

  const handleYearSummaryClick = () => {
    if (yearForSummary) {
      navigate(`${routes.content.statistics.year}?year=${yearForSummary}`);
    }
  };

  const handleMonthSummaryClick = () => {
    if (yearForMonthSummary && month) {
      navigate(
        `${routes.content.statistics.month}?year=${yearForMonthSummary}&month=${month}`,
      );
    }
  };

  return (
    <Box p="md">
      <Title order={2} mb="lg">
        Statistics
      </Title>
      <Stack gap="xl">
        <Paper shadow="xs" p="md" withBorder>
          <Title order={4} mb="md">
            Yearly Summary
          </Title>
          <Group gap="md">
            <NumberInput
              label="Year"
              placeholder="Enter year"
              value={yearForSummary}
              onChange={(value) => {
                return setYearForSummary(value as number | undefined);
              }}
              min={2000}
              max={2100}
              required
              w={200}
            />
            <Button
              onClick={handleYearSummaryClick}
              disabled={!yearForSummary}
              mt={25}
            >
              Go to summary for year
            </Button>
          </Group>
        </Paper>

        <Paper shadow="xs" p="md" withBorder>
          <Title order={4} mb="md">
            Monthly Summary
          </Title>
          <Group gap="md">
            <NumberInput
              label="Year"
              placeholder="Enter year"
              value={yearForMonthSummary}
              onChange={(value) => {
                return setYearForMonthSummary(value as number | undefined);
              }}
              min={2000}
              max={2100}
              required
              w={200}
            />
            <NumberInput
              label="Month"
              placeholder="Enter month"
              value={month}
              onChange={(value) => {
                return setMonth(value as number | undefined);
              }}
              min={1}
              max={12}
              required
              w={200}
            />
            <Button
              onClick={handleMonthSummaryClick}
              disabled={!yearForMonthSummary || !month}
              mt={25}
            >
              Go to summary for a specific month
            </Button>
          </Group>
        </Paper>

        <CashFlowChart />

        <CategoryComparisonChart />
      </Stack>
    </Box>
  );
};

export default Statistics;
