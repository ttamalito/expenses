import { Routes, Route } from 'react-router';
import './index.css';
import { AuthProvider } from './hooks/useAuth.tsx';
import Login from './pages/login/Login.tsx';
import { constants } from '@routes';
import ExpensesLayout from './pages/layout/ExpensesLayout.tsx';
import Profile from './pages/content/profile/Profile.tsx';
import ExpensesLandingPage from './pages/landingPage/ExpensesLandingPage.tsx';
import Signup from './pages/register/Signup.tsx';
import MonthlyExpenses from './pages/content/statistics/MonthlyExpenses.tsx';
import YearlyExpenses from './pages/content/statistics/YearlyExpenses.tsx';
import Documentation from './pages/documentation/Documentation.tsx';
import Error from './pages/errors/Error.tsx';
import NotFound from './pages/errors/NotFound.tsx';
import { UserDataProvider } from '@hooks/useUserDataContext.tsx';
import { lazy } from 'react';

// lazy imports
const Statistics = lazy(() => {
  return import('./pages/content/statistics/Statistics.tsx');
});

const Budget = lazy(() => {
  return import('./pages/content/budget/Budget.tsx');
});

const Home = lazy(() => {
  return import('./pages/content/home/Home.tsx');
});

function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <Routes>
          <Route path={'/'} element={<ExpensesLandingPage />} />
          <Route path={constants.Documentation} element={<Documentation />} />
          <Route path={constants.Login} element={<Login />} />
          <Route path={constants.Register} element={<Signup />} />
          <Route path={constants.Error} element={<Error />} />
          <Route path={constants.NotFound} element={<NotFound />} />
          <Route path={constants.Content} element={<ExpensesLayout />}>
            <Route path={constants.Home} index element={<Home />} />
            <Route path={constants.Budget} element={<Budget />} />
            <Route path={constants.Profile} element={<Profile />} />
            <Route path={constants.Statistics} element={<Statistics />} />
            <Route
              path={`${constants.Statistics}/${constants.Year}`}
              element={<YearlyExpenses />}
            />
            <Route
              path={`${constants.Statistics}/${constants.Month}`}
              element={<MonthlyExpenses />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserDataProvider>
    </AuthProvider>
  );
}
export default App;
