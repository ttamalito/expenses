import { Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router';
import { routes } from '@routes';
//import { useAuth } from '@hooks/useAuth.tsx';

interface ErrorPageProps {
  title?: string;
}

export default function Error({ title = 'An error occurred' }: ErrorPageProps) {
  const navigate = useNavigate();
  // const { token } = useAuth();
  const location = useLocation();

  const errorMessage: string | undefined = location.state?.errorMessage;

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
          {title}
        </Title>

        {/*{code && (*/}
        {/*  <Text size="xl" fw={700} c="dimmed" ta="center">*/}
        {/*    Error code: {code}*/}
        {/*  </Text>*/}
        {/*)}*/}

        <Text size="lg" ta="center" c="dimmed" maw={600}>
          {errorMessage}
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
