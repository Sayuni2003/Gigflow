export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  browseGigs: "/gigs",
};

export const ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
  FREELANCER: "FREELANCER",
};

export const AUTH_PUBLIC_REGISTER_ROLES = [ROLES.CLIENT, ROLES.FREELANCER];
