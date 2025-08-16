import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { IGetTagDto, IGetUserDto } from '@clients';

type UserDataProviderProps = {
  children: ReactNode;
};

const UserDataContext = createContext<{
  userData?: IGetUserDto;
  setUserData: (userData: IGetUserDto) => void;
  userTags: IGetTagDto[];
  setUserTags: (userTags: IGetTagDto[]) => void;
}>({
  userData: undefined,
  setUserData: () => {
    console.log('setUserData');
  },
  userTags: [],
  setUserTags: () => {
    console.log('setUserTags');
  },
});

export const UserDataProvider = ({ children }: UserDataProviderProps) => {
  const [userData, setUserData] = useState<IGetUserDto | undefined>();
  const [userTags, setUserTags] = useState<IGetTagDto[]>([]);

  const handleUserData = useCallback(
    (userData: IGetUserDto) => {
      setUserData(userData);
    },
    [setUserData],
  );

  const handleUserTags = useCallback(
    (userTags: IGetTagDto[]) => {
      setUserTags(userTags);
    },
    [setUserTags],
  );

  const value = useMemo(() => {
    return {
      userData,
      setUserData: handleUserData,
      userTags,
      setUserTags: handleUserTags,
    };
  }, [handleUserData, handleUserTags, userData, userTags]);

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
