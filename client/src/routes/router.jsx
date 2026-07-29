import { createBrowserRouter } from "react-router-dom";
import BrowseGigsPage from "../pages/BrowseGigsPage";
import DashboardPage from "../pages/DashboardPage";
import AdminDashboardPage from "../pages/dashboard/AdminDashboardPage";
import AdminSettingsPage from "../pages/dashboard/AdminSettingsPage";
import ClientDashboardPage from "../pages/dashboard/ClientDashboardPage";
import ClientOrdersPage from "../pages/dashboard/ClientOrdersPage";
import ClientPaymentsPage from "../pages/dashboard/ClientPaymentsPage";
import ClientSettingsPage from "../pages/dashboard/ClientSettingsPage";
import DashboardBrowseGigsPage from "../pages/dashboard/DashboardBrowseGigsPage";
import DashboardGigDetailsPage from "../pages/dashboard/DashboardGigDetailsPage";
import FreelancerDashboardPage from "../pages/dashboard/FreelancerDashboardPage";
import FreelancerEarningsPage from "../pages/dashboard/FreelancerEarningsPage";
import FreelancerGigFormPage from "../pages/dashboard/FreelancerGigFormPage";
import FreelancerMyGigsPage from "../pages/dashboard/FreelancerMyGigsPage";
import FreelancerOrdersPage from "../pages/dashboard/FreelancerOrdersPage";
import FreelancerSettingsPage from "../pages/dashboard/FreelancerSettingsPage";
import GigDetailsPage from "../pages/GigDetailsPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import OnboardingCompletePage from "../pages/OnboardingCompletePage";
import OnboardingRefreshPage from "../pages/OnboardingRefreshPage";
import OrderDetailsPage from "../pages/dashboard/OrderDetailsPage";
import RegisterPage from "../pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES, ROUTES } from "../utils/constants";

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <HomePage />,
  },
  {
    path: ROUTES.browseGigs,
    element: <BrowseGigsPage />,
  },
  {
    path: ROUTES.gigDetails(),
    element: <GigDetailsPage />,
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.register,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.dashboard,
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.clientDashboard,
    element: (
      <ProtectedRoute roles={[ROLES.CLIENT]}>
        <ClientDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.clientOrders,
    element: (
      <ProtectedRoute roles={[ROLES.CLIENT]}>
        <ClientOrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.clientPayments,
    element: (
      <ProtectedRoute roles={[ROLES.CLIENT]}>
        <ClientPaymentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.clientSettings,
    element: (
      <ProtectedRoute roles={[ROLES.CLIENT]}>
        <ClientSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.dashboardBrowseGigs,
    element: (
      <ProtectedRoute roles={[ROLES.CLIENT, ROLES.FREELANCER]}>
        <DashboardBrowseGigsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.dashboardGigDetails(),
    element: (
      <ProtectedRoute roles={[ROLES.CLIENT, ROLES.FREELANCER]}>
        <DashboardGigDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.freelancerDashboard,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <FreelancerDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.freelancerSettings,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <FreelancerSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.freelancerMyGigs,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <FreelancerMyGigsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.freelancerEarnings,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <FreelancerEarningsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.freelancerOrders,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <FreelancerOrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.orderDetails(),
    element: (
      <ProtectedRoute roles={[ROLES.CLIENT, ROLES.FREELANCER]}>
        <OrderDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.freelancerGigNew,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <FreelancerGigFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.freelancerGigEdit(),
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <FreelancerGigFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.adminDashboard,
    element: (
      <ProtectedRoute roles={[ROLES.ADMIN]}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.adminSettings,
    element: (
      <ProtectedRoute roles={[ROLES.ADMIN]}>
        <AdminSettingsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.onboardingComplete,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <OnboardingCompletePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.onboardingRefresh,
    element: (
      <ProtectedRoute roles={[ROLES.FREELANCER]}>
        <OnboardingRefreshPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
