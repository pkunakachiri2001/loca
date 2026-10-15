'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Car, DollarSign, MapPin, CheckCircle, Loader2, ArrowLeft,
  Upload, X, Image as ImageIcon, Sparkles, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'CAR_RENTAL', label: 'Car Rental' },
  { value: 'BUS_RENTAL', label: 'Bus / Minibus Charter' },
  { value: 'DRIVER', label: 'Spare Parts' },
  { value: 'MECHANIC', label: 'Workshops & Repairs' },
  { value: 'CAR_WASH', label: 'Car Wash & Detailing' },
  { value: 'VEHICLE_DEALER', label: 'Vehicle Dealership' },
  { value: 'COURIER', label: 'Courier & Freight' },
  { value: 'EMERGENCY_ROADSIDE', label: 'Emergency Roadside Towing' },
];

const ZIM_CITIES = [
  'Harare',
  'Bulawayo',
  'Victoria Falls',
  'Mutare',
  'Gweru',
  'Masvingo',
  'Chinhoyi',
  'Kwekwe',
];

export default function NewListingPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || (user?.role !== 'COMPANY_OWNER' && user?.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/company/listings/new');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'CAR_RENTAL',
    pricePerDay: '',
    pricePerHour: '',
    city: 'Harare',
    state: 'Harare Metropolitan',
    country: 'Zimbabwe',
    make: '',
    model: '',
    year: '2023',
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    features: 'Air Conditioning, GPS Navigation, Bluetooth Audio, Full Tank Option',
  });

  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1000&h=700&fit=crop'
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.data?.url;
      if (uploadedUrl) {
        setImages((prev) => [uploadedUrl, ...prev]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo. You can also paste an image URL.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please provide at least one photo for your listing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        pricePerDay: parseFloat(form.pricePerDay),
        pricePerHour: form.pricePerHour ? parseFloat(form.pricePerHour) : undefined,
        year: form.year ? parseInt(form.year, 10) : undefined,
        features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
        images: images.map((url, idx) => ({
          url,
          isPrimary: idx === 0,
        })),
      };

      await apiClient.post('/listings', payload);
      router.push('/company/listings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing. Ensure your company is verified.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-[#0B192C]">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/company/listings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#008767] transition mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Fleet & Services
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Offering</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Add New Listing</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Publish a new vehicle, spare parts package, or workshop service to the Famba Zimbabwe marketplace.
        </p>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Listing Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Toyota Land Cruiser Prado TX (Harare Airport Pickup)"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
              required
            />
          </div>

          {/* Category & Pricing */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Rate per day ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.pricePerDay}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerDay: e.target.value }))}
                  placeholder="85.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Service / Vehicle Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Detail vehicle condition, chauffeur availability, insurance inclusion, mileage limits, and pickup requirements..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] resize-none"
            />
          </div>

          {/* Make, Model, Year */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Make
              </label>
              <input
                value={form.make}
                onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                placeholder="Toyota"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Model
              </label>
              <input
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder="Land Cruiser"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="2023"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
              />
            </div>
          </div>

          {/* Location & Specs */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                City (Zimbabwe) *
              </label>
              <select
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, state: `${e.target.value} Province` }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
              >
                {ZIM_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Transmission
              </label>
              <select
                value={form.transmission}
                onChange={(e) => setForm((f) => ({ ...f, transmission: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
              >
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Fuel Type
              </label>
              <select
                value={form.fuelType}
                onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Included Features (comma separated)
            </label>
            <input
              value={form.features}
              onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
              placeholder="AC, GPS, Bluetooth, Unlimited Mileage, Comprehensive Insurance"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
            />
          </div>

          {/* Photos Upload & Gallery */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Vehicle & Service Photos *
            </label>

            <div className="border-2 border-dashed border-slate-200 hover:border-[#008767] rounded-2xl p-6 text-center transition bg-slate-50/50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="listing-photo-upload"
              />
              <label
                htmlFor="listing-photo-upload"
                className="cursor-pointer inline-flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mb-3">
                  {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <p className="text-sm font-bold text-[#0B192C] mb-1">
                  {uploadingImage ? 'Uploading photo...' : 'Click to upload vehicle photo from device'}
                </p>
                <p className="text-xs font-semibold text-slate-400">
                  PNG, JPG, or WebP up to 10MB
                </p>
              </label>
            </div>

            {/* Preview of Uploaded Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {images.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 shadow-sm"
                  >
                    <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-[#008767] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full py-4 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting for verification...</span>
              </>
            ) : (
              <span>Publish Listing to Marketplace</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
