'use client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import EmailForm from '@/components/EmailForm';
// Toaster is already in RootLayout, no need to add it here unless specifically for this page.
import DashboardContent from '@/components/layout/DashboardContent';

export default function YoinkedPage() {
  useRequireAuth();
  return (
    <DashboardContent />
  );
}
