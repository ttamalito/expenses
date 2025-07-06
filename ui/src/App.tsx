import { Routes, Route } from 'react-router';
import './index.css';
import { AuthProvider } from './hooks/useAuth.tsx';
import Login from './pages/login/Login.tsx';
import { constants } from '@routes';
import ExpensesLayout from './pages/layout/ExpensesLayout.tsx';
import Home from './pages/content/home/Home.tsx';
import Profile from './pages/content/profile/Profile.tsx';
import Budget from './pages/content/budget/Budget.tsx';
import ExpensesLandingPage from './pages/landingPage/ExpensesLandingPage.tsx';
import Signup from './pages/register/Signup.tsx';
import Statistics from './pages/content/statistics/Statistics.tsx';
import MonthlyExpenses from './pages/content/statistics/MonthlyExpenses.tsx';
import YearlyExpenses from './pages/content/statistics/YearlyExpenses.tsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path={'/'} element={<ExpensesLandingPage />} />
        <Route path={constants.Login} element={<Login />} />
        <Route path={constants.Register} element={<Signup />} />
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
      </Routes>
    </AuthProvider>
  );
}
export default App;
