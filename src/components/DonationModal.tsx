import React, { useState } from 'react';
import { X, Heart, Check, Copy, ShieldCheck, CreditCard, Building2, Smartphone, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordDonation } from '../lib/storage';
import type { SiteConfig } from '../types';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  lang?: 'bn' | 'en';
  theme?: 'dark' | 'light';
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  config,
  lang = 'bn',
  theme = 'dark',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank' | 'card'>('bkash');
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    lang === 'bn' ? 'পথশিশু ও সুবিধাবঞ্চিতদের শিক্ষা' : 'Children & Youth Education'
  );
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [donorNote, setDonorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const methodLabels: Record<typeof selectedMethod, 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Card'> = {
        bkash: 'bKash',
        nagad: 'Nagad',
        rocket: 'Rocket',
        bank: 'Bank',
        card: 'Card',
      };

      await recordDonation({
        donorName: donorName.trim() || (lang === 'bn' ? 'বেনামী দাতা' : 'Anonymous Donor'),
        donorPhone: donorPhone.trim(),
        donorEmail: donorEmail.trim(),
        amount: finalAmount,
        currency: 'BDT',
        method: methodLabels[selectedMethod],
        purpose: selectedPurpose,
        transactionId: transactionId.trim() || 'PLEDGE-' + Math.floor(100000 + Math.random() * 900000),
        note: donorNote.trim(),
      });

      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c93d51', '#e11d48', '#f43f5e', '#ffffff'],
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Donation submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBg = theme === 'dark' ? 'bg-stone-900 border-white/10 text-stone-100' : 'bg-white border-stone-200 text-stone-900';
  const cardBg = theme === 'dark' ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200';
  const inputBg = theme === 'dark' ? 'bg-stone-950 border-stone-700 text-white focus:border-rose-500' : 'bg-white border-stone-300 text-stone-900 focus:border-rose-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-6 ${modalBg}`}>
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-stone-700/40 bg-gradient-to-r from-rose-950/40 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-rose-500">
                {lang === 'bn' ? 'মানবতার সেবায় এগিয়ে আসুন' : 'Support Our Humanitarian Mission'}
              </h3>
              <p className="text-xs text-stone-400">
                {lang === 'bn' ? 'Roots & Routes Foundation - ডোনেশন ও সহায়তা তহবিল' : 'Roots & Routes Foundation - Official Donation Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[78vh] overflow-y-auto">
          {submitted ? (
            <div className="py-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-emerald-400 mb-2">
                {lang === 'bn' ? 'আপনার সহায়তার জন্য আন্তরিক ধন্যবাদ!' : 'Thank You For Your Generous Support!'}
              </h4>
              <p className="text-sm text-stone-300 max-w-md mb-6 leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার অবদান সমাজে ইতিবাচক পরিবর্তন আনতে এবং সুবিধাবঞ্চিতদের মুখে হাসি ফোটাতে অগ্রণী ভূমিকা রাখবে। আমাদের টিম ট্রানজেকশনটি ভেরিফাই করে কনফার্মেশন পাঠাবে।'
                  : 'Your generous pledge helps provide life-changing resources, education, and essential support to those who need it most.'}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-[#c93d51] text-white text-sm font-semibold hover:bg-rose-700 transition-colors shadow-lg"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close Window'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Cause / Purpose */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  {lang === 'bn' ? '১. সহায়তার খাত নির্বাচন করুন' : '1. Select Humanitarian Cause'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { bn: 'পথশিশু ও সুবিধাবঞ্চিতদের শিক্ষা', en: 'Children & Youth Education' },
                    { bn: 'খাদ্য ও পুষ্টি সহায়তা কর্মসূচি', en: 'Food & Nutrition Relief' },
                    { bn: 'বিনামূল্যে স্বাস্থ্যসেবা ও ওষুধ', en: 'Free Healthcare & Medicine' },
                    { bn: 'স্বাবলম্বীকরণ ও জরুরি তহবিল', en: 'Grassroots Livelihood Fund' },
                  ].map((item, idx) => {
                    const label = lang === 'bn' ? item.bn : item.en;
                    const isSelected = selectedPurpose === label;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedPurpose(label)}
                        className={`px-3.5 py-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-semibold'
                            : 'border-stone-700/60 hover:border-stone-500 text-stone-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Amount */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  {lang === 'bn' ? '২. সহায়তার পরিমাণ (BDT)' : '2. Contribution Amount (BDT)'}
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2.5">
                  {predefinedAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-[#c93d51] border-[#c93d51] text-white shadow-md'
                          : 'border-stone-700/60 hover:border-stone-500 text-stone-300'
                      }`}
                    >
                      {amt}৳
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder={lang === 'bn' ? 'অথবা আপনার ইচ্ছামতো পরিমাণ লিখুন (টাকা)' : 'Or enter custom amount in BDT'}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none transition-colors ${inputBg}`}
                />
              </div>

              {/* Step 3: Payment Method */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                  {lang === 'bn' ? '৩. পেমেন্ট মাধ্যম নির্বাচন করুন' : '3. Payment Channel'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'bkash', name: 'bKash', icon: Smartphone, color: 'text-pink-500' },
                    { id: 'nagad', name: 'Nagad', icon: Smartphone, color: 'text-orange-500' },
                    { id: 'rocket', name: 'Rocket', icon: Smartphone, color: 'text-purple-500' },
                    { id: 'bank', name: 'Bank A/C', icon: Building2, color: 'text-blue-500' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as any)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          active
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                            : 'border-stone-700/60 hover:border-stone-500 text-stone-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-1 ${m.color}`} />
                        {m.name}
                      </button>
                    );
                  })}
                </div>

                {/* Method instructions */}
                <div className={`mt-3 p-4 rounded-xl border ${cardBg}`}>
                  {selectedMethod === 'bkash' && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-medium">bKash নম্বর:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-400 text-sm">{config.donationAccounts.bkash}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(config.donationAccounts.bkash.split(' ')[0], 'bkash')}
                            className="p-1 rounded bg-stone-800 text-stone-300 hover:text-white"
                            title="Copy number"
                          >
                            {copiedKey === 'bkash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-stone-400 text-[11px]">
                        * bKash অ্যাপ বা *247# থেকে সেন্ড মানি অথবা পেমেন্ট করুন এবং প্রাপ্ত Transaction ID নিচে লিখুন।
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'nagad' && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-medium">Nagad নম্বর:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-400 text-sm">{config.donationAccounts.nagad}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(config.donationAccounts.nagad.split(' ')[0], 'nagad')}
                            className="p-1 rounded bg-stone-800 text-stone-300 hover:text-white"
                          >
                            {copiedKey === 'nagad' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-stone-400 text-[11px]">
                        * Nagad অ্যাপ বা *167# থেকে সেন্ড মানি করে প্রাপ্ত TrxID নিচে লিখুন।
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'rocket' && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-medium">Rocket নম্বর:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-400 text-sm">{config.donationAccounts.rocket}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(config.donationAccounts.rocket.split(' ')[0], 'rocket')}
                            className="p-1 rounded bg-stone-800 text-stone-300 hover:text-white"
                          >
                            {copiedKey === 'rocket' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-stone-400 text-[11px]">
                        * DBBL Rocket অ্যাপ থেকে সেন্ড মানি করুন।
                      </p>
                    </div>
                  )}

                  {selectedMethod === 'bank' && (
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-stone-400 block">ব্যাংকের নাম:</span>
                          <span className="font-semibold text-stone-200">{config.donationAccounts.bankName}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">অ্যাকাউন্ট নাম:</span>
                          <span className="font-semibold text-stone-200">{config.donationAccounts.bankAccountName}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">হিসাব নম্বর (A/C No):</span>
                          <span className="font-mono font-bold text-rose-400">{config.donationAccounts.bankAccountNumber}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">শাখা ও রাউটিং:</span>
                          <span className="text-stone-200">{config.donationAccounts.bankBranch} ({config.donationAccounts.bankRouting})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Donor Details & TXN Submission */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {lang === 'bn' ? '৪. আপনার তথ্য ও ট্রানজেকশন রেফারেন্স' : '4. Donor Info & Transaction Reference'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? 'আপনার নাম / প্রতিষ্ঠানের নাম *' : 'Your Name / Org Name *'}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none ${inputBg}`}
                  />
                  <input
                    type="tel"
                    placeholder={lang === 'bn' ? 'মোবাইল নম্বর (এসএমএস কনফার্মেশনের জন্য)' : 'Phone Number'}
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none ${inputBg}`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder={lang === 'bn' ? 'ইমেইল অ্যাড্রেস (রিসিপ্টের জন্য)' : 'Email for receipt'}
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none ${inputBg}`}
                  />
                  <input
                    type="text"
                    placeholder={lang === 'bn' ? 'Transaction ID (TrxID) / রেফারেন্স' : 'Transaction ID / Reference'}
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none font-mono ${inputBg}`}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder={lang === 'bn' ? 'কোনো বার্তা বা মন্তব্য থাকলে লিখুন (ঐচ্ছিক)' : 'Optional note or prayer message'}
                  value={donorNote}
                  onChange={(e) => setDonorNote(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none resize-none ${inputBg}`}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#c93d51] text-white font-semibold text-sm hover:bg-rose-700 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {lang === 'bn'
                        ? `নিশ্চিত করুন (${customAmount || selectedAmount}৳)`
                        : `Confirm Donation (${customAmount || selectedAmount} BDT)`}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
