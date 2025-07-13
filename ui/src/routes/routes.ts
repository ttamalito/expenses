export const constants = {
  Home: 'Home',
  Content: 'Content',
  aboutUs: 'AboutUs',
  Login: 'Login',
  Register: 'Register',
  Statistics: 'Statistics',
  Budget: 'Budget',
  Profile: 'Profile',
  Year: 'Year',
  Month: 'Month',
  Documentation: 'Documentation',
  Error: 'Error',
  NotFound: 'NotFound',
};

export const routes = {
  home: {
    index: `/`,
  },
  documentation: {
    index: `/${constants.Documentation}`,
  },
  content: {
    home: `/${constants.Content}/${constants.Home}`,
    statistics: {
      index: `/${constants.Content}/${constants.Statistics}`,
      year: `/${constants.Content}/${constants.Statistics}/${constants.Year}`,
      month: `/${constants.Content}/${constants.Statistics}/${constants.Month}`,
    },
    budget: `/${constants.Content}/${constants.Budget}`,
    profile: `/${constants.Content}/${constants.Profile}`,
  },
  login: {
    index: `/${constants.Login}`,
  },
  register: {
    index: `/${constants.Register}`,
  },
  error: {
    index: `/${constants.Error}`,
  },
  notFound: {
    index: `/${constants.NotFound}`,
  },
};
