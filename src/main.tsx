import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/index';
import LoginPage from './pages/login';
import { AppLayout } from './components/layout/AppLayout';
import DashboardPage from './pages/app/dashboard/page';
import TradesPage from './pages/app/trades/page';
import AccountsPage from './pages/app/accounts/page';
import PayoutsPage from './pages/app/payouts/page';
import CalendarPage from './pages/app/calendar/page';
import JournalPage from './pages/app/journal/page';
import PsychologyPage from './pages/app/psychology/page';
import PatrimoinePage from './pages/app/patrimoine/page';
import FinancePage from './pages/app/finance/page';
import GoalsPage from './pages/app/goals/page';
import FormationPage from './pages/app/formation/page';
import AIInsightsPage from './pages/app/ai-insights/page';
import SettingsPage from './pages/app/settings/page';
import './styles/globals.css';

import { AdminLayout } from './components/layout/AdminLayout';
import AdminDashboardPage from './pages/admin/dashboard/page';
import AdminUsersPage from './pages/admin/users/page';
import AdminBillingPage from './pages/admin/billing/page';
import AdminSupportPage from './pages/admin/support/page';
import AdminBroadcastPage from './pages/admin/broadcast/page';
import AdminCmsPage from './pages/admin/cms/page';
import AdminSystemPage from './pages/admin/system/page';
import AdminSettingsPage from './pages/admin/settings/page';

import UpgradePage from './pages/app/upgrade/page';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <LoginPage />, // Réutilise LoginPage pour l'instant (RegisterForm à venir)
  },
  {
    path: '/app/upgrade',
    element: <UpgradePage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'billing', element: <AdminBillingPage /> },
      { path: 'support', element: <AdminSupportPage /> },
      { path: 'broadcast', element: <AdminBroadcastPage /> },
      { path: 'cms', element: <AdminCmsPage /> },
      { path: 'system', element: <AdminSystemPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { path: '', element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'trades', element: <TradesPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'payouts', element: <PayoutsPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'psychology', element: <PsychologyPage /> },
      { path: 'patrimoine', element: <PatrimoinePage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'formation', element: <FormationPage /> },
      { path: 'ai-insights', element: <AIInsightsPage /> },
      { path: 'playbooks', element: <div className="glass p-12 text-center rounded-3xl text-txt-2 italic">Module Playbooks en cours de déploiement...</div> },
      { path: 'reports', element: <div className="glass p-12 text-center rounded-3xl text-txt-2 italic">Module Rapports en cours de déploiement...</div> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'economic', element: <div className="glass p-12 text-center rounded-3xl text-txt-2 italic">Module Économique en cours de déploiement...</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
