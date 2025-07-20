export const constants = {
  // Auth
  login: 'login',
  auth: 'auth',
  signup: 'signup',
  loggedIn: 'loggedIn',
  logout: 'logout',
  ping: 'ping',
  not: 'not',

  // Base
  // (no additional constants needed for base endpoints)

  // Budget
  budget: 'budget',
  modify: 'modify',
  burndown: 'burndown',

  // Categories
  category: 'category',
  expense: 'expense',
  income: 'income',
  get: 'get',
  create: 'create',
  delete: 'delete',
  all: 'all',

  // Expenses
  expenses: 'expenses',
  add: 'add',
  monthly: 'monthly',
  yearly: 'yearly',
  singleType: 'single-type',
  totalSpent: 'total-spent',
  compare: 'compare',

  // Incomes
  incomes: 'incomes',
  totalEarned: 'total-earned',
  earned: 'earned',
  month: 'month',
  year: 'year',

  // User
  user: 'user',
  update: 'update',
  data: 'data',

  // Currency
  currency: 'currency',

  // Statistics
  statistics: 'statistics',
  summary: 'summary',
};

export const routes = {
  // Auth Controller
  auth: {
    login: `/${constants.auth}/${constants.login}`,
    signup: `/${constants.auth}/${constants.signup}`,
    loggedIn: `/${constants.auth}/${constants.loggedIn}`,
    logout: `/${constants.auth}/${constants.logout}`,
    ping: `/${constants.auth}/${constants.ping}`,
    pingPost: `/${constants.auth}/${constants.ping}`,
    pingNot: `/${constants.auth}/${constants.ping}/${constants.not}`,
  },

  // Base Controller
  base: {
    ping: `/${constants.ping}`,
    pingNot: `/${constants.ping}/${constants.not}`,
  },

  // Budget Controller
  budget: {
    get: `/${constants.budget}`,
    modify: `/${constants.budget}/${constants.modify}`,
    burndown: `/${constants.budget}/${constants.burndown}`,
  },

  // Statistics Controller
  statistics: {
    summary: `/${constants.statistics}/${constants.summary}`,
  },

  // Categories Controller
  category: {
    expenseGet: (categoryId: number) => {
      return `/${constants.category}/${constants.expense}/${constants.get}/${categoryId}`;
    },
    expenseCreate: `/${constants.category}/${constants.expense}/${constants.create}`,
    expenseDelete: (categoryId: number) => {
      return `/${constants.category}/${constants.expense}/${constants.delete}/${categoryId}`;
    },
    expenseAll: `/${constants.category}/${constants.expense}/${constants.all}`,
    incomeGet: (categoryId: number) => {
      return `/${constants.category}/${constants.income}/${constants.get}/${categoryId}`;
    },
    incomeCreate: `/${constants.category}/${constants.income}/${constants.create}`,
    incomeDelete: (categoryId: number) => {
      return `/${constants.category}/${constants.income}/${constants.delete}/${categoryId}`;
    },
    incomeAll: `/${constants.category}/${constants.income}/${constants.all}`,
  },

  // Expenses Controller
  expenses: {
    add: `/${constants.expenses}/${constants.add}`,
    get: (id: number) => {
      return `/${constants.expenses}/${constants.get}/${id}`;
    },
    monthly: (month: number, year: number) => {
      return `/${constants.expenses}/${constants.monthly}/${month}/${year}`;
    },
    singleType: (month: number, year: number) => {
      return `/${constants.expenses}/${constants.singleType}/${month}/${year}`;
    },
    yearly: (year: number) => {
      return `/${constants.expenses}/${constants.yearly}/${year}`;
    },
    singleTypeYear: `/${constants.expenses}/${constants.singleType}`,
    totalSpent: `/${constants.expenses}/${constants.totalSpent}`,
    modify: `/${constants.expenses}/${constants.modify}`,
    totalSpentMonthly: `/${constants.expenses}/${constants.totalSpent}/${constants.monthly}`,
    totalSpentMonthlyCategory: `/${constants.expenses}/${constants.totalSpent}/${constants.monthly}/${constants.category}`,
    delete: `/${constants.expenses}/${constants.delete}`,
    compare: `/${constants.expenses}/${constants.compare}`,
  },

  // Incomes Controller
  incomes: {
    add: `/${constants.incomes}/${constants.add}`,
    delete: (id: number) => {
      return `/${constants.incomes}/${constants.delete}/${id}`;
    },
    get: (id: number) => {
      return `/${constants.incomes}/${constants.get}/${id}`;
    },
    totalEarnedYear: `/${constants.incomes}/${constants.totalEarned}/${constants.year}`,
    totalEarnedMonth: `/${constants.incomes}/${constants.totalEarned}/${constants.month}`,
    earnedYearMonthly: `/${constants.incomes}/${constants.earned}/${constants.year}/${constants.monthly}`,
    monthly: (month: number, year: number) => {
      return `/${constants.incomes}/${constants.monthly}/${month}/${year}`;
    },
    yearly: (year: number) => {
      return `/${constants.incomes}/${constants.yearly}/${year}`;
    },
  },

  // User Controller
  user: {
    update: (username: string) => {
      return `/${constants.user}/${constants.update}/${username}`;
    },
    get: (username: string) => {
      return `/${constants.user}/${username}`;
    },
    data: `/${constants.user}/${constants.data}`,
    delete: (username: string) => {
      return `/${constants.user}/${constants.delete}/${username}`;
    },
  },

  // Currency Controller
  currency: {
    all: `/${constants.currency}/${constants.all}`,
    get: (currencyId: number) => {
      return `/${constants.currency}/${currencyId}`;
    },
    create: `/${constants.currency}/${constants.create}`,
    delete: (currencyId: number) => {
      return `/${constants.currency}/${constants.delete}/${currencyId}`;
    },
  },
};
