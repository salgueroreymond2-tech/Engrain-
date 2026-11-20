import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { WorkshopLayout } from '../layouts/WorkshopLayout';
import { OwnerLayout } from '../layouts/OwnerLayout';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { PassportPublicPage } from '../pages/PassportPublicPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Workshop Pages
import { WorkshopOverviewPage } from '../pages/workshop/WorkshopOverviewPage';
import { WorkshopVehiclesPage } from '../pages/workshop/WorkshopVehiclesPage';
import { WorkshopWorkOrdersPage } from '../pages/workshop/WorkshopWorkOrdersPage';
import { WorkshopMaintenancePage } from '../pages/workshop/WorkshopMaintenancePage';
import { WorkshopDiagnosticsPage } from '../pages/workshop/WorkshopDiagnosticsPage';
import { WorkshopSettingsPage } from '../pages/workshop/WorkshopSettingsPage';

// Owner Pages
import { OwnerOverviewPage } from '../pages/owner/OwnerOverviewPage';
import { OwnerGaragePage } from '../pages/owner/OwnerGaragePage';
import { OwnerVehicleDetailPage } from '../pages/owner/OwnerVehicleDetailPage';
import { OwnerMaintenancePage } from '../pages/owner/OwnerMaintenancePage';
import { OwnerDiagnosticsPage } from '../pages/owner/OwnerDiagnosticsPage';
import { OwnerPassportPage } from '../pages/owner/OwnerPassportPage';

export const router = createBrowserRouter([
  // Public Portal Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
    ],
  },

  // Auth Routes (AuthLayout)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },

  // Public Passport Viewer (Standalone Verified View)
  {
    path: '/passport/:token',
    element: <PassportPublicPage />,
  },

  // Workshop Portal Routes
  {
    path: '/workshop',
    element: <WorkshopLayout />,
    children: [
      {
        index: true,
        element: <WorkshopOverviewPage />,
      },
      {
        path: 'vehicles',
        element: <WorkshopVehiclesPage />,
      },
      {
        path: 'work-orders',
        element: <WorkshopWorkOrdersPage />,
      },
      {
        path: 'maintenance',
        element: <WorkshopMaintenancePage />,
      },
      {
        path: 'diagnostics',
        element: <WorkshopDiagnosticsPage />,
      },
      {
        path: 'settings',
        element: <WorkshopSettingsPage />,
      },
    ],
  },

  // Owner Portal Routes
  {
    path: '/owner',
    element: <OwnerLayout />,
    children: [
      {
        index: true,
        element: <OwnerOverviewPage />,
      },
      {
        path: 'garage',
        element: <OwnerGaragePage />,
      },
      {
        path: 'vehicles/:id',
        element: <OwnerVehicleDetailPage />,
      },
      {
        path: 'maintenance',
        element: <OwnerMaintenancePage />,
      },
      {
        path: 'diagnostics',
        element: <OwnerDiagnosticsPage />,
      },
      {
        path: 'passport',
        element: <OwnerPassportPage />,
      },
    ],
  },

  // 404 Route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
