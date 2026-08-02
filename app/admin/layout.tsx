import { AdminLayoutClient } from '@/components/admin/admin-layout';

export const metadata = {
  title: 'Admin — The Libaas Gallery',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
