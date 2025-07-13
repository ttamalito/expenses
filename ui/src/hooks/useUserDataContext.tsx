import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { IGetUserDto } from '@clients';

type UserDataProviderProps = {
  children: ReactNode;
};

const UserDataContext = createContext<{
  userData?: IGetUserDto;
  setUserData: (userData: IGetUserDto) => void;
}>({
  userData: undefined,
  setUserData: () => {
    console.log('setUserData');
  },
});

export const UserDataProvider = ({ children }: UserDataProviderProps) => {
  const [userData, setUserData] = useState<IGetUserDto | undefined>();

  const handleUserData = useCallback(
    (userData: IGetUserDto) => {
      setUserData(userData);
    },
    [setUserData],
  );

  const value = useMemo(() => {
    return {
      userData,
      setUserData: handleUserData,
    };
  }, [handleUserData, userData]);

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserDataContext = () => {
  const context = UserDataContext;
  if (context === undefined) {
    throw new Error(
      'useUserDataContext must be used within a UserDataProvider',
    );
  }
  return useContext(context);
};
