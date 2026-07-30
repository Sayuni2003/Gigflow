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
  freelancerSettings: "/dashboard/freelancer/settings",
  freelancerMyGigs: "/dashboard/freelancer/gigs",
  freelancerOrders: "/dashboard/freelancer/orders",
  orderDetails: (id = ":id") => `/dashboard/orders/${id}`,
  freelancerEarnings: "/dashboard/freelancer/earnings",
  freelancerGigNew: "/dashboard/freelancer/gigs/new",
  freelancerGigEdit: (id = ":id") => `/dashboard/freelancer/gigs/${id}/edit`,
  adminDashboard: "/dashboard/admin",
  adminDisputes: "/dashboard/admin/disputes",
  adminSettings: "/dashboard/admin/settings",
  onboardingComplete: "/onboarding/complete",
  onboardingRefresh: "/onboarding/refresh",
  dashboardBrowseGigs: "/dashboard/gigs",
  browseGigs: "/gigs",
  gigDetails: (id = ":id") => `/gigs/${id}`,
  dashboardGigDetails: (id = ":id") => `/dashboard/gigs/${id}`,
  freelancerProfile: (id = ":id") => `/freelancers/${id}`,
  dashboardFreelancerProfile: (id = ":id") => `/dashboard/freelancers/${id}`,
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
