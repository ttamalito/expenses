import { Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { useNavigate } from 'react-router';
import { routes } from '@routes';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate(routes.home.index);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <Title order={1} ta="center">
          {t('notFound.title')}
        </Title>

        <Text size="xl" fw={700} c="dimmed" ta="center">
          {t('notFound.errorCode')}
        </Text>

        <Text size="lg" ta="center" c="dimmed" maw={600}>
          {t('notFound.description')}
        </Text>

        <Group justify="center" mt="md">
          <Button variant="outline" onClick={handleGoBack}>
            {t('notFound.goBack')}
          </Button>
          <Button onClick={handleGoHome}>{t('notFound.goHome')}</Button>
        </Group>
      </Stack>
    </Container>
  );
}
