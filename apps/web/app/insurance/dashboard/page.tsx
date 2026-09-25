'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Loader2, ShieldCheck, FileText, Download } from 'lucide-react';

export default function InsuranceDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/insurance/dashboard');
      return;
    }
    if (user?.role !== 'INSURANCE_AGENT' && user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchPolicies();
  }, [isAuthenticated, user]);

  const fetchPolicies = async () => {
    try {
      const res = await apiClient.get('/insurance');
      setPolicies(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const issuePolicy = async (id: string) => {
    try {
      await apiClient.post(`/insurance/${id}/issue`);
      alert('Policy issued successfully! A copy has been queued for WhatsApp delivery.');
      fetchPolicies();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue policy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#008767]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#008767]" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-[#0B192C]">Insurance Dashboard</h1>
            <p className="text-slate-500">Manage customer insurance policies and issue certificates.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-sm text-slate-500">
                  <th className="py-4 px-6 font-medium">Customer</th>
                  <th className="py-4 px-6 font-medium">Vehicle</th>
                  <th className="py-4 px-6 font-medium">Coverage</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {policies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No policies found.
                    </td>
                  </tr>
                ) : (
                  policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-[#0B192C]">{policy.ownerName}</p>
                        <p className="text-sm text-slate-500">{policy.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-[#0B192C]">{policy.vehicleReg}</p>
                        <p className="text-sm text-slate-500">{policy.vehicleType}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                          {policy.coverageType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          policy.paymentStatus === 'PAID' ? 'bg-[#E6F4F1] text-[#008767]' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {policy.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {policy.paymentStatus === 'PAID' && !policy.issuedAt ? (
                          <button 
                            onClick={() => issuePolicy(policy.id)}
                            className="btn-primary text-sm px-4 py-2 rounded-full"
                          >
                            Issue Policy
                          </button>
                        ) : policy.issuedAt ? (
                          <span className="flex items-center justify-end gap-1 text-sm text-[#008767] font-medium">
                            <FileText className="w-4 h-4" /> Issued
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">Waiting payment</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
