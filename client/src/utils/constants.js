export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  clientDashboard: "/dashboard/client",
  clientOrders: "/dashboard/client/orders",
  clientPayments: "/dashboard/client/payments",
  clientSettings: "/dashboard/client/settings",
  freelancerDashboard: "/dashboard/freelancer",
  adminDashboard: "/dashboard/admin",
  dashboardBrowseGigs: "/dashboard/gigs",
  browseGigs: "/gigs",
  gigDetails: (id = ":id") => `/gigs/${id}`,
  dashboardGigDetails: (id = ":id") => `/dashboard/gigs/${id}`,
};

export const ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  FREELANCER: "FREELANCER",
};

export const AUTH_PUBLIC_REGISTER_ROLES = [ROLES.CLIENT, ROLES.FREELANCER];

export const DASHBOARD_ROUTE_BY_ROLE = {
  [ROLES.ADMIN]: ROUTES.adminDashboard,
  [ROLES.CLIENT]: ROUTES.clientDashboard,
  [ROLES.FREELANCER]: ROUTES.freelancerDashboard,
};

export const getDashboardRoute = (role) => DASHBOARD_ROUTE_BY_ROLE[role] || ROUTES.dashboard;
