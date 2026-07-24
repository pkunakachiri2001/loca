import { Navbar } from '@/components/layout/Navbar';
import { CompanySidebar } from '@/components/company/CompanySidebar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />
      <div className="pt-16 flex">
        <CompanySidebar />
        <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
