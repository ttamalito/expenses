import { Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { useNavigate } from 'react-router';
import { routes } from '@routes';

export default function NotFound() {
  const navigate = useNavigate();

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
          Page Not Found
        </Title>

        <Text size="xl" fw={700} c="dimmed" ta="center">
          Error code: 404
        </Text>

        <Text size="lg" ta="center" c="dimmed" maw={600}>
          The page you are looking for doesn't exist or has been moved.
        </Text>

        <Group justify="center" mt="md">
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
          <Button onClick={handleGoHome}>Go to Home</Button>
        </Group>
      </Stack>
    </Container>
  );
}
