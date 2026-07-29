import {
  AlertTriangle,
  Briefcase,
  ClipboardList,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Search,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { ROLES, ROUTES } from "../utils/constants";

export const CLIENT_NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, to: ROUTES.clientDashboard },
  { label: "Browse gigs", icon: Search, to: ROUTES.dashboardBrowseGigs },
  { label: "Orders", icon: ShoppingBag, to: ROUTES.clientOrders },
  { label: "Payments", icon: CreditCard, to: ROUTES.clientPayments },
  { label: "Settings", icon: Settings, to: ROUTES.clientSettings },
];

export const FREELANCER_NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, to: ROUTES.freelancerDashboard },
  { label: "Browse gigs", icon: Search, to: ROUTES.dashboardBrowseGigs },
  { label: "My gigs", icon: ClipboardList, disabled: true },
  { label: "Earnings", icon: DollarSign, disabled: true },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, to: ROUTES.adminDashboard },
  { label: "Users", icon: Users, disabled: true },
  { label: "Gigs", icon: Briefcase, disabled: true },
  { label: "Disputes", icon: AlertTriangle, disabled: true },
];

export const NAV_ITEMS_BY_ROLE = {
  [ROLES.CLIENT]: CLIENT_NAV_ITEMS,
  [ROLES.FREELANCER]: FREELANCER_NAV_ITEMS,
  [ROLES.ADMIN]: ADMIN_NAV_ITEMS,
};
