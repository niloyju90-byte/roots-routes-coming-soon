import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, MessageSquare, Send, Check } from 'lucide-react';
import type { SiteConfig } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  lang?: 'bn' | 'en';
  theme?: 'dark' | 'light';
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  config,
  lang = 'bn',
  theme = 'dark',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSent(false);
      onClose();
    }, 2500);
  };

  const modalBg = theme === 'dark' ? 'bg-stone-900 border-white/10 text-stone-100' : 'bg-white border-stone-200 text-stone-900';
  const cardBg = theme === 'dark' ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200';
  const inputBg = theme === 'dark' ? 'bg-stone-950 border-stone-700 text-white focus:border-rose-500' : 'bg-white border-stone-300 text-stone-900 focus:border-rose-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden my-6 ${modalBg}`}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-700/40 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-rose-500">
              {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
            </h3>
            <p className="text-xs text-stone-400">
              {lang === 'bn' ? 'যেকোনো জিজ্ঞাসা, পরামর্শ বা সহযোগিতার জন্য আমরা পাশে আছি' : 'Get in touch for inquiries, collaborations, or volunteering'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${config.contactPhone.replace(/\s+/g, '')}`}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors hover:border-rose-500 ${cardBg}`}
            >
              <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] block text-stone-400">{lang === 'bn' ? 'হটলাইন নম্বর' : 'Phone / Hotline'}</span>
                <span className="text-xs sm:text-sm font-semibold text-rose-400 truncate block">{config.contactPhone}</span>
              </div>
            </a>

            <a
              href={`mailto:${config.contactEmail}`}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors hover:border-rose-500 ${cardBg}`}
            >
              <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] block text-stone-400">{lang === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Email'}</span>
                <span className="text-xs sm:text-sm font-semibold text-rose-400 truncate block">{config.contactEmail}</span>
              </div>
            </a>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${cardBg}`}>
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] block text-stone-400">{lang === 'bn' ? 'প্রধান কার্যালয়ের ঠিকানা' : 'Headquarters Address'}</span>
              <p className="text-xs sm:text-sm text-stone-200 mt-0.5">
                {lang === 'bn' ? config.contactAddressBn : config.contactAddressEn}
              </p>
            </div>
          </div>

          {/* Direct Message Box */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-stone-700/40">
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              {lang === 'bn' ? 'সরাসরি বার্তা পাঠান' : 'Send a Quick Message'}
            </span>

            {sent ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>{lang === 'bn' ? 'আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে। ধন্যবাদ!' : 'Your message has been received. Thank you!'}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                  />
                  <input
                    type="email"
                    required
                    placeholder={lang === 'bn' ? 'আপনার ইমেইল' : 'Your Email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`px-3 py-2 rounded-xl text-xs border focus:outline-none ${inputBg}`}
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder={lang === 'bn' ? 'আপনার বার্তা বা প্রস্তাবনা এখানে লিখুন...' : 'Write your message or inquiry here...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none resize-none ${inputBg}`}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#c93d51] text-white text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}</span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
