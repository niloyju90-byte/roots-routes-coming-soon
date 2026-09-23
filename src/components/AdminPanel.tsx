import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Lock,
  Users,
  HeartHandshake,
  Settings,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Database,
  Search,
  KeyRound,
  FileSpreadsheet,
  Globe,
  Sliders,
  Target,
  Phone,
  Smartphone,
  Building2,
  Share2,
  UploadCloud,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Palette,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import {
  getSubscribers,
  removeSubscriber,
  getDonations,
  updateDonationStatus,
  removeDonation,
  saveSiteConfig,
} from '../lib/storage';
import { isFirebaseConfigured } from '../lib/firebase';
import type { Subscriber, DonationRecord, SiteConfig } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onUpdateConfig: (newConfig: SiteConfig) => void;
  lang?: 'bn' | 'en';
  theme?: 'dark' | 'light';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  lang = 'bn',
  theme = 'dark',
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<'subscribers' | 'donations' | 'logo' | 'settings' | 'deploy'>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editable config state
  const [editableConfig, setEditableConfig] = useState<SiteConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditableConfig(config);
  }, [config]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, dons] = await Promise.all([getSubscribers(), getDonations()]);
      setSubscribers(subs);
      setDonations(dons);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin pin verification
    if (pinInput === 'roots2026') {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত এই ইমেইলটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this subscriber?')) {
      await removeSubscriber(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleToggleDonationStatus = async (donation: DonationRecord) => {
    const newStatus = donation.status === 'verified' ? 'pending' : 'verified';
    await updateDonationStatus(donation.id, newStatus);
    setDonations((prev) =>
      prev.map((d) => (d.id === donation.id ? { ...d, status: newStatus } : d))
    );
  };

  const handleDeleteDonation = async (id: string) => {
    if (confirm(lang === 'bn' ? 'আপনি কি এই ডোনেশন রেকর্ডটি মুছতে চান?' : 'Delete this donation record?')) {
      await removeDonation(id);
      setDonations((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await saveSiteConfig(editableConfig);
    onUpdateConfig(editableConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const processImageFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError(
        lang === 'bn'
          ? 'অনুগ্রহ করে একটি ছবি ফাইল (PNG, SVG, WebP, JPG) নির্বাচন করুন।'
          : 'Please select a valid image file (PNG, SVG, WebP, JPG).'
      );
      return;
    }

    setLogoUploading(true);
    setLogoUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setLogoUploading(false);
        return;
      }

      // If SVG, keep raw data URL
      if (file.type === 'image/svg+xml') {
        setEditableConfig((prev) => ({
          ...prev,
          customLogoUrl: result,
        }));
        setLogoUploading(false);
        return;
      }

      // If PNG/JPEG/WebP: resize if very large to prevent exceeding storage quotas
      const img = new Image();
      img.onload = () => {
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const pngDataUrl = canvas.toDataURL('image/png');
          setEditableConfig((prev) => ({
            ...prev,
            customLogoUrl: pngDataUrl,
          }));
        } else {
          setEditableConfig((prev) => ({
            ...prev,
            customLogoUrl: result,
          }));
        }
        setLogoUploading(false);
      };

      img.onerror = () => {
        setLogoUploadError(
          lang === 'bn' ? 'ছবি পড়তে সমস্যা হয়েছে।' : 'Failed to read image.'
        );
        setLogoUploading(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      setLogoUploadError(
        lang === 'bn' ? 'ফাইল পড়তে ব্যর্থ হয়েছে।' : 'Failed to read file.'
      );
      setLogoUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleResetToDefaultLogo = () => {
    setEditableConfig((prev) => ({
      ...prev,
      customLogoUrl: '',
      logoDisplayMode: 'symbol_and_text',
      customLogoBadgeBg: 'rose',
    }));
  };

  // CSV Export helpers
  const exportSubscribersCSV = () => {
    const headers = ['ID', 'Email', 'Created At', 'Source', 'Status'];
    const rows = subscribers.map((s) => [s.id, s.email, s.createdAt, s.source || '', s.status || 'active']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDonationsCSV = () => {
    const headers = ['ID', 'Donor Name', 'Phone', 'Email', 'Amount', 'Currency', 'Method', 'Purpose', 'TXN ID', 'Status', 'Date'];
    const rows = donations.map((d) => [
      d.id,
      `"${d.donorName}"`,
      d.donorPhone || '',
      d.donorEmail || '',
      d.amount,
      d.currency,
      d.method,
      `"${d.purpose}"`,
      d.transactionId,
      d.status,
      d.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalBg = theme === 'dark' ? 'bg-stone-900 border-white/10 text-stone-100' : 'bg-white border-stone-200 text-stone-900';
  const cardBg = theme === 'dark' ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200';
  const inputBg = theme === 'dark' ? 'bg-stone-950 border-stone-700 text-white focus:border-rose-500' : 'bg-white border-stone-300 text-stone-900 focus:border-rose-500';

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDonationAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-6 ${modalBg}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-700/40 bg-gradient-to-r from-stone-950/80 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-rose-500 flex items-center gap-2">
                {lang === 'bn' ? 'ফাউন্ডেশন কন্ট্রোল ও অ্যাডমিন প্যানেল' : 'Foundation Control & Admin Portal'}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-stone-400">
                <span>Roots & Routes Management</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  {isFirebaseConfigured ? 'Firebase Firestore Connected' : 'Local Persistence (Ready for Firebase)'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/15 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <KeyRound className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-xl font-bold mb-2">
              {lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি পিন' : 'Admin Security PIN'}
            </h4>
            <p className="text-xs text-stone-400 mb-6 leading-relaxed">
              {lang === 'bn'
                ? 'ইমেইল তালিকা দেখতে, ডোনেশন ভেরিফাই করতে বা কাউন্টডাউন পরিবর্তন করতে পিন লিখুন।'
                : 'Enter your administrator PIN to access subscribers, donation records, and site configuration.'}
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder={lang === 'bn' ? 'গোপন পিন লিখুন...' : 'Enter Secret PIN...'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-center text-sm font-mono border focus:outline-none ${inputBg}`}
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-rose-500 font-medium">
                  {lang === 'bn' ? 'ভুল পিন! দয়া করে সঠিক পিন দিন।' : 'Invalid PIN! Please check and try again.'}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#c93d51] text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-lg cursor-pointer"
              >
                {lang === 'bn' ? 'লগইন করুন' : 'Unlock Dashboard'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'মোট সাবস্ক্রাইবার' : 'Subscribers'}</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-2xl font-bold font-serif text-rose-500">{subscribers.length}</span>
              </div>

              <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'সংগৃহীত তহবিল' : 'Total Pledges'}</span>
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl font-bold font-serif text-emerald-400">{totalDonationAmount} ৳</span>
              </div>

              <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'অনুমোদিত ডোনেশন' : 'Verified'}</span>
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-2xl font-bold font-serif text-teal-400">
                  {donations.filter((d) => d.status === 'verified').length} / {donations.length}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${cardBg}`}>
                <div className="flex items-center justify-between text-stone-400 mb-1">
                  <span className="text-xs font-medium">{lang === 'bn' ? 'উদ্বোধন তারিখ' : 'Target Launch'}</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-amber-400 truncate block mt-2">
                  {new Date(editableConfig.launchDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-950/80 rounded-xl border border-stone-800 mb-6">
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'subscribers'
                    ? 'bg-[#c93d51] text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ইমেইল তালিকা' : 'Subscribers'} ({subscribers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('donations')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'donations'
                    ? 'bg-[#c93d51] text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডোনেশন রেকর্ড' : 'Donations'} ({donations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('logo')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'logo'
                    ? 'bg-[#c93d51] text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লোগো আপলোড' : 'Logo Upload'}</span>
                {editableConfig.customLogoUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Custom PNG Active"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-[#c93d51] text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'মিশন, ডোনেশন ও সেটিংস' : 'Mission, Accounts & Settings'}</span>
              </button>

              <button
                onClick={() => setActiveTab('deploy')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'deploy'
                    ? 'bg-[#c93d51] text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ভার্সেল ও ফায়ারবেস গাইড' : 'Vercel & Firebase'}</span>
              </button>

              <button
                onClick={loadData}
                disabled={loading}
                className="ml-auto p-2 text-stone-400 hover:text-stone-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* TAB 1: SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'ইমেইল দিয়ে খুঁজুন...' : 'Search email...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                    />
                  </div>
                  <button
                    onClick={exportSubscribersCSV}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 text-xs font-medium transition-colors border border-stone-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'CSV এক্সপোর্ট করুন' : 'Export to CSV'}</span>
                  </button>
                </div>

                <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-950/80 text-stone-400 border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">#</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'ইমেইল' : 'Email Address'}</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'নিবন্ধন তারিখ' : 'Subscribed Date'}</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'সোর্স' : 'Source'}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {filteredSubscribers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-stone-400 text-xs">
                              {lang === 'bn' ? 'কোনো সাবস্ক্রাইবার পাওয়া যায়নি' : 'No subscribers found'}
                            </td>
                          </tr>
                        ) : (
                          filteredSubscribers.map((sub, idx) => (
                            <tr key={sub.id} className="hover:bg-stone-800/30 transition-colors">
                              <td className="px-4 py-2.5 text-stone-400 font-mono text-[11px]">{idx + 1}</td>
                              <td className="px-4 py-2.5 font-medium text-stone-200">{sub.email}</td>
                              <td className="px-4 py-2.5 text-stone-400">
                                {new Date(sub.createdAt).toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="text-[11px] text-stone-400 bg-stone-800/60 px-2 py-0.5 rounded">
                                  {sub.source || 'Website'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  onClick={() => handleDeleteSubscriber(sub.id)}
                                  className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
                                  title="Delete subscriber"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DONATIONS */}
            {activeTab === 'donations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">
                    {lang === 'bn' ? 'মোট পেমেন্ট রেকর্ড:' : 'Total records:'} {donations.length}
                  </span>
                  <button
                    onClick={exportDonationsCSV}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 text-xs font-medium transition-colors border border-stone-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'ডোনেশন CSV এক্সপোর্ট' : 'Export Donations CSV'}</span>
                  </button>
                </div>

                <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-950/80 text-stone-400 border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'দাতা' : 'Donor'}</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'মাধ্যম' : 'Method'}</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'উদ্দেশ্য' : 'Purpose'}</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'TrxID' : 'TXN ID'}</th>
                          <th className="px-4 py-2.5 font-medium">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                          <th className="px-4 py-2.5 font-medium text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {donations.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-stone-400 text-xs">
                              {lang === 'bn' ? 'এখনো কোনো ডোনেশন পাওয়া যায়নি' : 'No donations recorded yet'}
                            </td>
                          </tr>
                        ) : (
                          donations.map((don) => (
                            <tr key={don.id} className="hover:bg-stone-800/30 transition-colors">
                              <td className="px-4 py-2.5">
                                <span className="font-semibold text-stone-200 block">{don.donorName}</span>
                                <span className="text-[11px] text-stone-400 block">{don.donorPhone || don.donorEmail || '—'}</span>
                              </td>
                              <td className="px-4 py-2.5 font-bold font-mono text-emerald-400">
                                {don.amount} {don.currency}
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="px-2 py-0.5 rounded bg-stone-800 text-[11px] font-medium text-stone-300">
                                  {don.method}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 max-w-[150px] truncate text-stone-300" title={don.purpose}>
                                {don.purpose}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-rose-400 text-[11px]">{don.transactionId}</td>
                              <td className="px-4 py-2.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleDonationStatus(don)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                                    don.status === 'verified'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {don.status === 'verified' ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Verified</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3" />
                                      <span>Pending</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  onClick={() => handleDeleteDonation(don.id)}
                                  className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LOGO UPLOAD & BRANDING */}
            {activeTab === 'logo' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {lang === 'bn'
                        ? 'লোগো সফলভাবে সংরক্ষিত হয়েছে এবং লাইভ ওয়েবসাইটে দৃশ্যমান হয়েছে!'
                        : 'Logo saved successfully and updated live on the website!'}
                    </span>
                  </div>
                )}

                {/* Status Card */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBg}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/30 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-stone-100 flex items-center gap-2">
                        <span>{lang === 'bn' ? 'ফাউন্ডেশন পিএনজি লোগো ব্যবস্থাপনা' : 'Foundation PNG Logo Management'}</span>
                        {editableConfig.customLogoUrl ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {lang === 'bn' ? 'কাস্টম লোগো চালু' : 'Custom PNG Active'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {lang === 'bn' ? 'ডিফল্ট এম্বলেম চালু' : 'Default Emblem Active'}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {lang === 'bn'
                          ? 'আপনার অফিসিয়াল পিএনজি লোগো ফাইল আপলোড করুন। হেডার, মোডাল ও সকল জায়গায় এটি লাইভ দৃশ্যমান হবে।'
                          : 'Upload your official PNG logo file. It will be instantly displayed across the header and modals.'}
                      </p>
                    </div>
                  </div>

                  {editableConfig.customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetToDefaultLogo}
                      className="px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-900/60 text-stone-300 hover:text-white hover:border-rose-500 text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 cursor-pointer"
                      title={lang === 'bn' ? 'ডিফল্ট এম্বলেমে ফিরে যান' : 'Reset to Default Emblem'}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>{lang === 'bn' ? 'ডিফল্ট লোগোতে ফিরুন' : 'Reset to Default'}</span>
                    </button>
                  )}
                </div>

                {/* Upload Zone (Drag & Drop or Click) */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer relative group ${
                    isDragging
                      ? 'border-rose-500 bg-rose-950/30 scale-[1.01]'
                      : 'border-stone-700 hover:border-rose-500/60 hover:bg-stone-900/40 bg-stone-950/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/webp,image/jpeg"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isDragging ? 'bg-rose-600 text-white' : 'bg-rose-600/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {logoUploading ? (
                        <RefreshCw className="w-7 h-7 animate-spin text-rose-400" />
                      ) : (
                        <UploadCloud className="w-7 h-7" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-stone-200">
                        {logoUploading
                          ? (lang === 'bn' ? 'লোগো প্রসেস ও অপ্টিমাইজ করা হচ্ছে...' : 'Optimizing and processing image...')
                          : (lang === 'bn' ? 'আপনার পিএনজি (PNG) লোগো ফাইল নির্বাচন করতে ক্লিক করুন' : 'Click to select your PNG logo or drag & drop')}
                      </p>
                      <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                        {lang === 'bn'
                          ? 'স্বচ্ছ ব্যাকগ্রাউন্ডের (Transparent PNG / SVG / WebP) ফাইল ফাইলটি সবচেয়ে আকর্ষণীয় দেখায়। সর্বোচ্চ ফাইলের আকার: ৫ মেগাবাইট।'
                          : 'Transparent PNG, SVG, or WebP gives the best result. Max size: 5MB.'}
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c93d51] text-white text-xs font-semibold shadow hover:bg-rose-700 transition-colors">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'কম্পিউটার/মোবাইল থেকে ফাইল বাছুন' : 'Choose PNG File'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {logoUploadError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{logoUploadError}</span>
                  </div>
                )}

                {/* Direct Image URL input */}
                <div className={`p-4 rounded-xl border ${cardBg}`}>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-rose-400" />
                    <span>{lang === 'bn' ? 'অথবা সরাসরি লোগো ইমেজ লিঙ্ক (Image URL):' : 'Or enter direct Logo Image URL:'}</span>
                  </label>
                  <input
                    type="url"
                    value={editableConfig.customLogoUrl || ''}
                    onChange={(e) => setEditableConfig({ ...editableConfig, customLogoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${inputBg}`}
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    {lang === 'bn'
                      ? 'যদি আপনার লোগো অনলাইনে কোথাও আপলোড করা থাকে তবে এখানে সরাসরি লিঙ্ক পেস্ট করতে পারেন।'
                      : 'You can also paste a hosted PNG logo URL.'}
                  </p>
                </div>

                {/* Live Real-time Previews */}
                <div className={`p-4 sm:p-5 rounded-xl border space-y-4 ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'লাইভ প্রিভিউ (ওয়েবসাইটে কেমন দেখাবে)' : 'Live Preview (How it appears)'}</span>
                    </label>
                    <span className="text-[11px] text-stone-400">
                      {editableConfig.customLogoUrl ? (lang === 'bn' ? 'আপলোডকৃত কাস্টম পিএনজি' : 'Custom Uploaded') : (lang === 'bn' ? 'ডিফল্ট এম্বলেম' : 'Default Emblem')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dark Preview */}
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 shadow-inner flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800 pb-2">
                        <span className="font-semibold text-stone-300">{lang === 'bn' ? 'ডার্ক মোড / হেডার ভিউ' : 'Dark Mode / Hero Header'}</span>
                        <span className="text-stone-500">Theme: Dark</span>
                      </div>
                      <div className="py-4 flex items-center justify-center">
                        <BrandLogo
                          variant="full"
                          size="md"
                          textColorClass="text-white"
                          customLogoUrl={editableConfig.customLogoUrl}
                          logoDisplayMode={editableConfig.logoDisplayMode}
                          customLogoBadgeBg={editableConfig.customLogoBadgeBg}
                          altText={editableConfig.orgNameEn}
                        />
                      </div>
                      <div className="text-center text-[10px] text-stone-400 pt-1 border-t border-stone-900">
                        {lang === 'bn' ? 'ওয়েবসাইটের মূল হেডারে এই দৃশ্য দেখা যাবে' : 'Appears on the top navigation bar'}
                      </div>
                    </div>

                    {/* Light Preview */}
                    <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-stone-600 border-b border-stone-200 pb-2">
                        <span className="font-semibold text-stone-800">{lang === 'bn' ? 'লাইট মোড / কার্ড ও মডাল' : 'Light Mode / Modals'}</span>
                        <span className="text-stone-400">Theme: Light</span>
                      </div>
                      <div className="py-4 flex items-center justify-center">
                        <BrandLogo
                          variant="full"
                          size="md"
                          textColorClass="text-[#c93d51]"
                          customLogoUrl={editableConfig.customLogoUrl}
                          logoDisplayMode={editableConfig.logoDisplayMode}
                          customLogoBadgeBg={editableConfig.customLogoBadgeBg}
                          altText={editableConfig.orgNameEn}
                        />
                      </div>
                      <div className="text-center text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                        {lang === 'bn' ? 'লাইট থিম বা সাদা ব্যাকগ্রাউন্ডে প্রদর্শন' : 'Appears on light background or dialogs'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display Mode & Badge Styling */}
                <div className={`p-4 rounded-xl border space-y-4 ${cardBg}`}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'লোগো ডিসপ্লে মোড ও স্টাইলিং' : 'Logo Display Mode & Styling'}</span>
                  </label>

                  {/* Mode options */}
                  <div>
                    <span className="text-xs font-medium text-stone-300 block mb-2">
                      {lang === 'bn' ? 'লোগো প্রদর্শনের ধরন (Display Mode):' : 'Display Mode:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          (editableConfig.logoDisplayMode || 'symbol_and_text') === 'symbol_and_text'
                            ? 'border-rose-500 bg-rose-950/20'
                            : 'border-stone-800 hover:border-stone-700 bg-stone-900/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="logoDisplayMode"
                          checked={(editableConfig.logoDisplayMode || 'symbol_and_text') === 'symbol_and_text'}
                          onChange={() => setEditableConfig({ ...editableConfig, logoDisplayMode: 'symbol_and_text' })}
                          className="mt-1 text-rose-600 focus:ring-rose-500"
                        />
                        <div className="text-left">
                          <span className="text-xs font-semibold text-stone-200 block">
                            {lang === 'bn' ? 'আইকন + ফাউন্ডেশন নাম (Emblem + Text)' : 'Emblem Badge + Text'}
                          </span>
                          <span className="text-[11px] text-stone-400 block mt-0.5">
                            {lang === 'bn'
                              ? 'আপনার পিএনজি ইমেজটি সুন্দর ব্যাজে থাকবে এবং পাশে "Roots & Routes Foundation" লেখাটি থাকবে।'
                              : 'Your PNG replaces the emblem, keeping official foundation typography alongside.'}
                          </span>
                        </div>
                      </label>

                      <label
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          editableConfig.logoDisplayMode === 'image_only'
                            ? 'border-rose-500 bg-rose-950/20'
                            : 'border-stone-800 hover:border-stone-700 bg-stone-900/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="logoDisplayMode"
                          checked={editableConfig.logoDisplayMode === 'image_only'}
                          onChange={() => setEditableConfig({ ...editableConfig, logoDisplayMode: 'image_only' })}
                          className="mt-1 text-rose-600 focus:ring-rose-500"
                        />
                        <div className="text-left">
                          <span className="text-xs font-semibold text-stone-200 block">
                            {lang === 'bn' ? 'শুধুমাত্র সম্পূর্ণ পিএনজি ইমেজ (Full Image Only)' : 'Full Image Only'}
                          </span>
                          <span className="text-[11px] text-stone-400 block mt-0.5">
                            {lang === 'bn'
                              ? 'আপনার পিএনজি লোগো ফাইলটিতে যদি আগে থেকেই নাম এবং আইকন একসাথে থাকে, তবে এটি বেছে নিন।'
                              : 'Select if your PNG file already includes both emblem and foundation text.'}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Badge Background selection */}
                  <div>
                    <span className="text-xs font-medium text-stone-300 block mb-2">
                      {lang === 'bn' ? 'আইকন / ব্যাজের ব্যাকগ্রাউন্ড কালার:' : 'Badge Background Color:'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'rose', nameBn: 'রোজ রেড (#c93d51)', nameEn: 'Rose Red', bgPreview: 'bg-[#c93d51]' },
                        { id: 'transparent', nameBn: 'স্বচ্ছ (Transparent)', nameEn: 'Transparent', bgPreview: 'bg-transparent border border-dashed border-stone-500' },
                        { id: 'white', nameBn: 'সাদা (White)', nameEn: 'White', bgPreview: 'bg-white' },
                        { id: 'dark', nameBn: 'গাঢ় (Dark Charcoal)', nameEn: 'Dark Charcoal', bgPreview: 'bg-stone-900 border border-stone-700' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setEditableConfig({ ...editableConfig, customLogoBadgeBg: item.id as any })}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                            (editableConfig.customLogoBadgeBg || 'rose') === item.id
                              ? 'border-rose-500 bg-rose-950/30 text-white shadow'
                              : 'border-stone-800 hover:border-stone-700 text-stone-400 bg-stone-900/40'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full shrink-0 ${item.bgPreview}`} />
                          <span className="text-[11px] font-medium truncate">
                            {lang === 'bn' ? item.nameBn : item.nameEn}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button for Logo */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#c93d51] text-white text-xs sm:text-sm font-semibold hover:bg-rose-700 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'লোগো সংরক্ষণ ও লাইভ আপডেট করুন' : 'Save & Apply Live Logo'}</span>
                  </button>

                  {editableConfig.customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleResetToDefaultLogo}
                      className="py-3 px-4 rounded-xl border border-stone-700 bg-stone-900/60 text-stone-300 hover:text-white hover:border-rose-500 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span>{lang === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset to Default'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SETTINGS & COUNTDOWN */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {lang === 'bn'
                        ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে! কাউন্টডাউন, মিশন, ডোনেশন ও সকল তথ্য লাইভ আপডেট হয়েছে।'
                        : 'Settings saved successfully! Countdown, mission, donation accounts, and info updated live.'}
                    </span>
                  </div>
                )}

                {/* Logo & Branding Quick Banner */}
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBg}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-200 block">
                        {lang === 'bn' ? 'ফাউন্ডেশনের নিজস্ব পিএনজি লোগো' : 'Official PNG Logo'}
                      </span>
                      <span className="text-[11px] text-stone-400 block">
                        {editableConfig.customLogoUrl
                          ? (lang === 'bn' ? 'কাস্টম পিএনজি লোগো সক্রিয় রয়েছে' : 'Custom PNG logo active')
                          : (lang === 'bn' ? 'ডিফল্ট এম্বলেম লোগো সক্রিয়' : 'Default emblem logo active')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('logo')}
                    className="px-3 py-1.5 rounded-lg bg-[#c93d51] text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'লোগো আপলোড ও পরিবর্তন' : 'Upload / Manage Logo'}</span>
                  </button>
                </div>

                {/* 1. Launch Date */}
                <div className={`p-4 rounded-xl border ${cardBg}`}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{lang === 'bn' ? '১. উদ্বোধনের নির্ধারিত তারিখ ও সময় (Countdown Target Date)' : '1. Target Launch Date & Time'}</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={editableConfig.launchDate ? editableConfig.launchDate.slice(0, 16) : ''}
                    onChange={(e) =>
                      setEditableConfig({
                        ...editableConfig,
                        launchDate: new Date(e.target.value).toISOString(),
                      })
                    }
                    className={`w-full sm:w-80 px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    {lang === 'bn'
                      ? 'তারিখ পরিবর্তন করলে ল্যান্ডিং পেজের কাউন্টডাউন তাৎক্ষণিকভাবে নতুন সময় অনুযায়ী চলবে।'
                      : 'Updating this date automatically recalculates the live countdown on the landing page.'}
                  </p>
                </div>

                {/* 2. Mission, Vision & Purpose */}
                <div className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>{lang === 'bn' ? '২. লক্ষ্য, মিশন ও ভিশন (Mission & Vision)' : '2. Mission, Vision & Purpose'}</span>
                  </label>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">আমাদের মিশন (Mission - বাংলা):</span>
                      <textarea
                        rows={2}
                        value={editableConfig.missionBn || ''}
                        onChange={(e) => setEditableConfig({ ...editableConfig, missionBn: e.target.value })}
                        placeholder="মিশনের বিবরণ লিখুন..."
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">Our Mission (English):</span>
                      <textarea
                        rows={2}
                        value={editableConfig.missionEn || ''}
                        onChange={(e) => setEditableConfig({ ...editableConfig, missionEn: e.target.value })}
                        placeholder="Enter mission in English..."
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] text-stone-400 block mb-1">আমাদের লক্ষ্য / ভিশন (Vision - বাংলা):</span>
                        <textarea
                          rows={2}
                          value={editableConfig.visionBn || ''}
                          onChange={(e) => setEditableConfig({ ...editableConfig, visionBn: e.target.value })}
                          placeholder="ভিশনের বিবরণ লিখুন..."
                          className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block mb-1">Our Vision (English):</span>
                        <textarea
                          rows={2}
                          value={editableConfig.visionEn || ''}
                          onChange={(e) => setEditableConfig({ ...editableConfig, visionEn: e.target.value })}
                          placeholder="Enter vision in English..."
                          className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">আমাদের দর্শন ও পরিচিতি (Philosophy - বাংলা):</span>
                      <textarea
                        rows={2}
                        value={editableConfig.philosophyBn || ''}
                        onChange={(e) => setEditableConfig({ ...editableConfig, philosophyBn: e.target.value })}
                        placeholder="সংস্থার দর্শন লিখুন..."
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Donation Accounts (bKash, Nagad, Rocket, Bank) */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${cardBg}`}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <span>{lang === 'bn' ? '৩. ডোনেশন অ্যাকাউন্ট ও নম্বরসমূহ (বিকাশ, নগদ, রকেট ও ব্যাংক)' : '3. Donation Accounts & Mobile Banking Numbers'}</span>
                  </label>

                  {/* Mobile banking accounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-pink-400 font-medium block mb-1">bKash নম্বর (বিকাশ):</span>
                      <input
                        type="text"
                        value={editableConfig.donationAccounts.bkash}
                        onChange={(e) =>
                          setEditableConfig({
                            ...editableConfig,
                            donationAccounts: { ...editableConfig.donationAccounts, bkash: e.target.value },
                          })
                        }
                        placeholder="017xxxxxxxx (পার্সোনাল/মার্চেন্ট)"
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-orange-400 font-medium block mb-1">Nagad নম্বর (নগদ):</span>
                      <input
                        type="text"
                        value={editableConfig.donationAccounts.nagad}
                        onChange={(e) =>
                          setEditableConfig({
                            ...editableConfig,
                            donationAccounts: { ...editableConfig.donationAccounts, nagad: e.target.value },
                          })
                        }
                        placeholder="018xxxxxxxx (পার্সোনাল)"
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-purple-400 font-medium block mb-1">Rocket নম্বর (রকেট):</span>
                      <input
                        type="text"
                        value={editableConfig.donationAccounts.rocket}
                        onChange={(e) =>
                          setEditableConfig({
                            ...editableConfig,
                            donationAccounts: { ...editableConfig.donationAccounts, rocket: e.target.value },
                          })
                        }
                        placeholder="019xxxxxxxx-x (পার্সোনাল)"
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="pt-2 border-t border-stone-800">
                    <span className="text-xs font-semibold text-stone-300 block mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{lang === 'bn' ? 'অফিসিয়াল ব্যাংক অ্যাকাউন্ট তথ্য' : 'Official Bank Account Details'}</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-stone-400 block mb-1">ব্যাংকের নাম:</span>
                        <input
                          type="text"
                          value={editableConfig.donationAccounts.bankName}
                          onChange={(e) =>
                            setEditableConfig({
                              ...editableConfig,
                              donationAccounts: { ...editableConfig.donationAccounts, bankName: e.target.value },
                            })
                          }
                          placeholder="ব্যাংকের নাম"
                          className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block mb-1">হিসাবধারীর নাম (Account Name):</span>
                        <input
                          type="text"
                          value={editableConfig.donationAccounts.bankAccountName}
                          onChange={(e) =>
                            setEditableConfig({
                              ...editableConfig,
                              donationAccounts: { ...editableConfig.donationAccounts, bankAccountName: e.target.value },
                            })
                          }
                          placeholder="Account Name"
                          className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block mb-1">হিসাব নম্বর (A/C No):</span>
                        <input
                          type="text"
                          value={editableConfig.donationAccounts.bankAccountNumber}
                          onChange={(e) =>
                            setEditableConfig({
                              ...editableConfig,
                              donationAccounts: { ...editableConfig.donationAccounts, bankAccountNumber: e.target.value },
                            })
                          }
                          placeholder="Account Number"
                          className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${inputBg}`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] text-stone-400 block mb-1">শাখা (Branch):</span>
                          <input
                            type="text"
                            value={editableConfig.donationAccounts.bankBranch}
                            onChange={(e) =>
                              setEditableConfig({
                                ...editableConfig,
                                donationAccounts: { ...editableConfig.donationAccounts, bankBranch: e.target.value },
                              })
                            }
                            placeholder="Branch"
                            className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                          />
                        </div>
                        <div>
                          <span className="text-[11px] text-stone-400 block mb-1">রাউটিং নম্বর:</span>
                          <input
                            type="text"
                            value={editableConfig.donationAccounts.bankRouting}
                            onChange={(e) =>
                              setEditableConfig({
                                ...editableConfig,
                                donationAccounts: { ...editableConfig.donationAccounts, bankRouting: e.target.value },
                              })
                            }
                            placeholder="Routing No"
                            className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none ${inputBg}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Contact info */}
                <div className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{lang === 'bn' ? '৪. যোগাযোগ নম্বর, হোয়াটসঅ্যাপ ও কার্যালয়ের ঠিকানা' : '4. Contact Phone, WhatsApp & Address'}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">ফোন / হটলাইন:</span>
                      <input
                        type="text"
                        value={editableConfig.contactPhone}
                        onChange={(e) => setEditableConfig({ ...editableConfig, contactPhone: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">অফিসিয়াল ইমেইল:</span>
                      <input
                        type="email"
                        value={editableConfig.contactEmail}
                        onChange={(e) => setEditableConfig({ ...editableConfig, contactEmail: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-400 block mb-1">হোয়াটসঅ্যাপ নম্বর:</span>
                      <input
                        type="text"
                        value={editableConfig.whatsappNumber || ''}
                        onChange={(e) => setEditableConfig({ ...editableConfig, whatsappNumber: e.target.value })}
                        placeholder="+88017..."
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">কার্যালয়ের ঠিকানা (বাংলা):</span>
                      <input
                        type="text"
                        value={editableConfig.contactAddressBn}
                        onChange={(e) => setEditableConfig({ ...editableConfig, contactAddressBn: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">Address (English):</span>
                      <input
                        type="text"
                        value={editableConfig.contactAddressEn || ''}
                        onChange={(e) => setEditableConfig({ ...editableConfig, contactAddressEn: e.target.value })}
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Social media links */}
                <div className={`p-4 rounded-xl border space-y-3 ${cardBg}`}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span>{lang === 'bn' ? '৫. সোশ্যাল মিডিয়া লিংকসমূহ' : '5. Social Media URLs'}</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">Facebook URL:</span>
                      <input
                        type="url"
                        value={editableConfig.socials.facebook}
                        onChange={(e) =>
                          setEditableConfig({
                            ...editableConfig,
                            socials: { ...editableConfig.socials, facebook: e.target.value },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">LinkedIn URL:</span>
                      <input
                        type="url"
                        value={editableConfig.socials.linkedin}
                        onChange={(e) =>
                          setEditableConfig({
                            ...editableConfig,
                            socials: { ...editableConfig.socials, linkedin: e.target.value },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">Instagram URL:</span>
                      <input
                        type="url"
                        value={editableConfig.socials.instagram}
                        onChange={(e) =>
                          setEditableConfig({
                            ...editableConfig,
                            socials: { ...editableConfig.socials, instagram: e.target.value },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">YouTube URL:</span>
                      <input
                        type="url"
                        value={editableConfig.socials.youtube}
                        onChange={(e) =>
                          setEditableConfig({
                            ...editableConfig,
                            socials: { ...editableConfig.socials, youtube: e.target.value },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#c93d51] text-white text-xs sm:text-sm font-semibold hover:bg-rose-700 transition-colors shadow-lg cursor-pointer"
                >
                  {lang === 'bn' ? 'সকল পরিবর্তন সংরক্ষণ করুন' : 'Save All Settings'}
                </button>
              </form>
            )}

            {/* TAB 4: DEPLOY & FIREBASE GUIDE */}
            {activeTab === 'deploy' && (
              <div className="space-y-4 text-xs text-stone-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
                <div className={`p-4 rounded-xl border ${cardBg}`}>
                  <h4 className="font-semibold text-sm text-rose-400 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>GitHub দিয়ে Vercel-এ হোস্ট করার সহজ নিয়ম:</span>
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-stone-300 text-[11px]">
                    <li>
                      প্রথমে আপনার গিটহাবে একটি নতুন রিপোজিটরি তৈরি করুন (e.g. <code className="text-rose-300">roots-routes-coming-soon</code>)।
                    </li>
                    <li>
                      লোকাল বা প্রজেক্ট কোড গিটহাবে পুশ করুন:
                      <pre className="bg-stone-950 p-2.5 rounded-lg font-mono text-[10px] text-stone-300 my-1">
                        git init<br />
                        git add .<br />
                        git commit -m "Initial commit for Roots &amp; Routes Coming Soon"<br />
                        git branch -M main<br />
                        git remote add origin https://github.com/YOUR_USER/roots-routes-coming-soon.git<br />
                        git push -u origin main
                      </pre>
                    </li>
                    <li>
                      <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-rose-400 underline">Vercel.com</a>-এ লগইন করে <strong>"Add New Project"</strong> নির্বাচন করুন এবং আপনার রিপোটি সিলেক্ট করুন।
                    </li>
                    <li>
                      আমরা ইতোমধ্যে <strong>vercel.json</strong> ফাইলটি তৈরি করে দিয়েছি, ফলে Vercel স্বয়ংক্রিয়ভাবে Vite ফ্রেমওয়ার্ক ডিটেক্ট করবে। কোনো এক্সট্রা সেটিংস পরিবর্তন করার প্রয়োজন নেই—শুধু <strong>"Deploy"</strong> বাটনে ক্লিক করলেই মুহূর্তের মধ্যে সাইট লাইভ হয়ে যাবে!
                    </li>
                  </ol>
                </div>

                <div className={`p-4 rounded-xl border ${cardBg}`}>
                  <h4 className="font-semibold text-sm text-rose-400 mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>ফায়ারবেস (Firebase Firestore) ইন্টিগ্রেশন নির্দেশনা:</span>
                  </h4>
                  <p className="text-[11px] text-stone-300 mb-2">
                    এই অ্যাপটি এমনভাবে তৈরি যাতে এটি ফায়ারবেস ছাড়াও স্বয়ংক্রিয়ভাবে লোকাল স্টোরেজে নিখুঁতভাবে চলে, আবার ফায়ারবেস ক্রেডেনশিয়াল দিলে সাথে সাথে রিয়েলটাইম ফায়ারবেস ডাটাবেজের সাথে সিঙ্ক হয়।
                  </p>
                  <p className="text-[11px] text-stone-300 mb-2">
                    ফায়ারবেস যুক্ত করতে <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-rose-400 underline">Firebase Console</a> থেকে একটি ওয়েব অ্যাপ তৈরি করে Vercel-এর Environment Variables-এ নিচের কিগুলো যোগ করে দিন:
                  </p>
                  <pre className="bg-stone-950 p-2.5 rounded-lg font-mono text-[10px] text-stone-300">
                    VITE_FIREBASE_API_KEY=AIzaSy...<br />
                    VITE_FIREBASE_AUTH_DOMAIN=roots-routes.firebaseapp.com<br />
                    VITE_FIREBASE_PROJECT_ID=roots-routes<br />
                    VITE_FIREBASE_STORAGE_BUCKET=roots-routes.appspot.com<br />
                    VITE_FIREBASE_MESSAGING_SENDER_ID=123456789<br />
                    VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
                  </pre>
                  <p className="text-[11px] text-stone-400 mt-2">
                    * সিকিউরিটি রুলস এর জন্য <code className="text-rose-300">firestore.rules</code> এবং ডাটা মডেলের জন্য <code className="text-rose-300">firebase-blueprint.json</code> তৈরি করে রাখা আছে।
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
