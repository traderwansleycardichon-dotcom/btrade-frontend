import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from './pages/index';
import LoginPage from './pages/login';
import { PublicRoute } from './components/auth/AuthGuards';
import { AppLayout } from './components/layout/AppLayout';
import DashboardPage from './pages/app/dashboard/page';
import TradesPage from './pages/app/trades/page';
import AccountsPage from './pages/app/accounts/page';
import PayoutsPage from './pages/app/payouts/page';
import CalendarPage from './pages/app/calendar/page';
import JournalPage from './pages/app/journal/page';
import TodoPage from './pages/app/todo/page';
import PsychologyPage from './pages/app/psychology/page';
import PatrimoinePage from './pages/app/patrimoine/page';
import FinancePage from './pages/app/finance/page';
import GoalsPage from './pages/app/goals/page';
import FormationPage from './pages/app/formation/page';
import ModuleLessonsPage from './pages/app/formation/ModuleLessonsPage';
import LessonDetailPage from './pages/app/formation/LessonDetailPage';
import AIInsightsPage from './pages/app/ai-insights/page';
import PlaybooksPage from './pages/app/playbooks/page';
import EconomicPage from './pages/app/economic/page';
import AnalysesPage from './pages/app/analyses/page';
import AiChatPage from './pages/app/ai-chat/page';
import SettingsPage from './pages/app/settings/page';
import SupportPage from './pages/app/support/page';
import CoachingPage from './pages/app/coaching/page';
import './styles/globals.css';

import { AdminLayout } from './components/layout/AdminLayout';
import AdminDashboardPage from "./pages/admin/dashboard/page";
import AdminUsersPage from "./pages/admin/users/page";
import AdminBillingPage from "./pages/admin/billing/page";
import AdminPricingPage from "./pages/admin/pricing/AdminPricingPage";
import AdminSupportPage from "./pages/admin/support/page";
import AdminCoachingPage from './pages/admin/coaching/page';
import AdminBroadcastPage from "./pages/admin/broadcast/page";
import AdminCmsPage from "./pages/admin/cms/page";
import AdminSystemPage from "./pages/admin/system/page";
import AdminSettingsPage from "./pages/admin/settings/page";
import AdminLegalPage from './pages/admin/legal/AdminLegalPage';
import { PromoCodesPage } from './pages/admin/promo-codes/PromoCodesPage';
import AdminAcademyPage from './pages/admin/academy/page';
import AdminLessonsPage from './pages/admin/academy/[moduleId]/page';
import LegalPage from './pages/legal/LegalPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { SoundProvider } from './context/SoundContext';

import UpgradePage from './pages/app/upgrade/page';
import MessagesPage from './pages/app/messages/page';
import AdminMessagingPage from './pages/admin/messaging/page';

export const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute>
        <LandingPage />
      </PublicRoute>
    ),
  },
  {
    path: '/legal/:slug',
    element: <LegalPage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <LoginPage defaultRegister />
      </PublicRoute>
    ),
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
      { path: 'messaging', element: <AdminMessagingPage /> },
      { path: 'billing', element: <AdminBillingPage /> },
      { path: 'pricing', element: <AdminPricingPage /> },
      { path: 'promo-codes', element: <PromoCodesPage /> },
      { path: 'support', element: <AdminSupportPage /> },
      { path: 'coaching', element: <AdminCoachingPage /> },
      { path: 'broadcast', element: <AdminBroadcastPage /> },
      { path: 'cms', element: <AdminCmsPage /> },
      { path: 'system', element: <AdminSystemPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'legal', element: <AdminLegalPage /> },
      { path: 'academy', element: <AdminAcademyPage /> },
      { path: 'academy/:moduleId', element: <AdminLessonsPage /> },
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
      { path: 'todo', element: <TodoPage /> },
      { path: 'psychology', element: <PsychologyPage /> },
      { path: 'patrimoine', element: <PatrimoinePage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'formation', element: <FormationPage /> },
      { path: 'formation/:slug', element: <ModuleLessonsPage /> },
      { path: 'formation/:slug/:lessonId', element: <LessonDetailPage /> },
      { path: 'ai-insights', element: <AIInsightsPage /> },
      { path: 'playbooks', element: <PlaybooksPage /> },
      { path: 'reports', element: <AnalysesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'economic', element: <EconomicPage /> },
      { path: 'ai-chat', element: <AiChatPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'coaching', element: <CoachingPage /> },
    ],
  },
  // Catch-all fallback to redirect any unknown routes to the landing page
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
], {
  future: {
    v7_startTransition: true,
  } as any
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SoundProvider>
        <SettingsProvider>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </SettingsProvider>
      </SoundProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
