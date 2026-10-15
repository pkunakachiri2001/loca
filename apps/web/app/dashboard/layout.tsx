import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFCFB]">
      <Navbar />
      <div className="pt-20 flex">
        <DashboardSidebar />
        <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
