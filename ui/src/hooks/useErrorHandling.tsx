import { useLocation, useNavigate } from 'react-router';
import { routes } from '@routes';

const useErrorHandling = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleError = (
    errorMessage: string | undefined,
    httpResponseCode?: number,
  ) => {
    console.log(httpResponseCode);
    navigate(routes.error.index, {
      state: {
        from: location.pathname,
        errorMessage: errorMessage,
      },
    });
  };
  return { handleError };
};

export default useErrorHandling;
