'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Car, FileText, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const VEHICLE_TYPES = ['Saloon / Light Vehicle', 'SUV / Double Cab', 'Minibus (up to 15 seats)', 'Bus', 'Light Truck (up to 3T)', 'Heavy Truck'];

export default function InsuranceCustomerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [premium, setPremium] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    vehicleType: 'Saloon / Light Vehicle',
    vehicleReg: '',
    ownerName: '',
    idNumber: '',
    phone: '',
    coverageType: 'THIRD_PARTY'
  });

  const handleNext = async () => {
    if (step === 1 && (!formData.vehicleReg || !formData.vehicleType)) return alert('Please complete all fields');
    if (step === 2 && (!formData.ownerName || !formData.idNumber || !formData.phone)) return alert('Please complete all fields');
    
    if (step === 2) {
      // Fetch quote before step 3
      try {
        setLoading(true);
        const res = await apiClient.post('/insurance/quote', {
          vehicleType: formData.vehicleType,
          coverageType: formData.coverageType
        });
        setPremium(res.data.data.premium);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (step === 3) {
      // Final checkout
      try {
        setLoading(true);
        const res = await apiClient.post('/insurance/buy', {
          ...formData,
          premium
        });
        
        if (res.data.success && res.data.data.paymentUrl) {
          window.location.href = res.data.data.paymentUrl;
        }
      } catch (err) {
        console.error(err);
        alert('Failed to initiate checkout. Please try again.');
        setLoading(false);
      }
      return;
    }

    setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E6F4F1] mb-6">
            <ShieldCheck className="w-8 h-8 text-[#008767]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-[#0B192C] mb-4">
            Instant Vehicle Insurance
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Get your vehicle insured in less than 3 minutes. Your digital insurance disc will be sent instantly to your WhatsApp.
          </p>
        </div>

        {/* Steps Tracker */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= num ? 'bg-[#008767] text-white' : 'bg-slate-200 text-slate-400'}`}>
                {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
              </div>
              {num < 3 && (
                <div className={`w-16 h-1 transition-colors ${step > num ? 'bg-[#008767]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-8 md:p-10 max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-[#0B192C] mb-6 flex items-center gap-2">
                  <Car className="w-6 h-6 text-[#E8A547]" /> Vehicle Details
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B192C] mb-2">Vehicle Type</label>
                    <select 
                      className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#008767] outline-none"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    >
                      {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B192C] mb-2">Registration Plate</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ABC 1234" 
                      className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#008767] outline-none uppercase"
                      value={formData.vehicleReg}
                      onChange={(e) => setFormData({...formData, vehicleReg: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-[#0B192C] mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-[#E8A547]" /> Owner Details
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B192C] mb-2">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="As it appears on ID" 
                      className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#008767] outline-none"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B192C] mb-2">National ID Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 63-1234567-A-89" 
                      className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#008767] outline-none uppercase"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B192C] mb-2">WhatsApp Number (For digital disc delivery)</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 263771234567" 
                      className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#008767] outline-none"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-[#0B192C] mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#E8A547]" /> Select Coverage
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div 
                    onClick={async () => {
                      setFormData({...formData, coverageType: 'THIRD_PARTY'});
                      setLoading(true);
                      const res = await apiClient.post('/insurance/quote', { vehicleType: formData.vehicleType, coverageType: 'THIRD_PARTY' });
                      setPremium(res.data.data.premium);
                      setLoading(false);
                    }}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.coverageType === 'THIRD_PARTY' ? 'border-[#008767] bg-[#E6F4F1]' : 'border-[#E2E8F0] hover:border-[#008767]'}`}
                  >
                    <h3 className="font-bold text-lg text-[#0B192C] mb-2">Third Party</h3>
                    <p className="text-sm text-slate-500 mb-4">Basic legal requirement for driving on public roads.</p>
                  </div>
                  <div 
                    onClick={async () => {
                      setFormData({...formData, coverageType: 'COMPREHENSIVE'});
                      setLoading(true);
                      const res = await apiClient.post('/insurance/quote', { vehicleType: formData.vehicleType, coverageType: 'COMPREHENSIVE' });
                      setPremium(res.data.data.premium);
                      setLoading(false);
                    }}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.coverageType === 'COMPREHENSIVE' ? 'border-[#E8A547] bg-[#fcf5eb]' : 'border-[#E2E8F0] hover:border-[#E8A547]'}`}
                  >
                    <h3 className="font-bold text-lg text-[#0B192C] mb-2">Comprehensive</h3>
                    <p className="text-sm text-slate-500 mb-4">Full coverage including your own vehicle damage and theft.</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl mb-8 flex justify-between items-center border border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Total Premium (4 Months)</p>
                    <p className="text-3xl font-bold text-[#0B192C]">${premium?.toFixed(2)} USD</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex justify-between">
            {step > 1 ? (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 rounded-full font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            <button 
              onClick={handleNext}
              disabled={loading}
              className="btn-primary px-8 py-3 rounded-full flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? 'Pay Now via Paynow' : 'Next Step'}
              {!loading && step < 3 && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
