export const AUTH_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  me: "/auth/me",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
};

export const GIG_ENDPOINTS = {
  base: "/gigs",
  categories: "/gigs/categories",
  myGigs: "/gigs/my-gigs",
  byId: (id) => `/gigs/${id}`,
  freelancer: (id) => `/gigs/${id}/freelancer`,
};

export const ORDER_ENDPOINTS = {
  base: "/orders",
  byId: (id) => `/orders/${id}`,
  freelancer: (id) => `/orders/${id}/freelancer`,
  client: (id) => `/orders/${id}/client`,
  payment: (id) => `/orders/${id}/payment`,
  status: (id) => `/orders/${id}/status`,
};

export const PAYMENT_ENDPOINTS = {
  base: "/payments",
  onboardFreelancer: "/payments/onboard-freelancer",
  earnings: "/payments/earnings",
};

export const USER_ENDPOINTS = {
  byId: (id) => `/users/${id}`,
  changePassword: (id) => `/users/${id}/change-password`,
};
