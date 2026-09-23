import React, { useState } from 'react';
import {
  Heart,
  Mail,
  Check,
  Share2,
  Lock,
  Moon,
  Sun,
  Globe,
  Info,
  PhoneCall,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from './BrandLogo';
import { CountdownTimer } from './CountdownTimer';
import { addSubscriber } from '../lib/storage';
import type { SiteConfig } from '../types';

interface HeroSectionProps {
  config: SiteConfig;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenDonate: () => void;
  onOpenContact: () => void;
  onOpenAbout: () => void;
  onOpenAdmin: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  lang,
  setLang,
  theme,
  setTheme,
  onOpenDonate,
  onOpenContact,
  onOpenAbout,
  onOpenAdmin,
}) => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [logoVariant, setLogoVariant] = useState<'full' | 'mark'>('full');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubscribing(true);
    setSubscribeMessage(null);

    try {
      const res = await addSubscriber(email, 'Coming Soon Hero');
      setSubscribeMessage({ text: res.message, success: res.success });
      if (res.success) {
        setEmail('');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c93d51', '#f43f5e', '#fb7185', '#ffffff'],
        });
      }
    } catch {
      setSubscribeMessage({
        text: lang === 'bn' ? 'দুঃখিত, আবার চেষ্টা করুন।' : 'Failed to subscribe. Please try again.',
        success: false,
      });
    } finally {
      setSubscribing(false);
    }
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: config.socials.facebook },
    { name: 'LinkedIn', icon: Linkedin, url: config.socials.linkedin },
    { name: 'Twitter', icon: Twitter, url: config.socials.twitter },
    { name: 'Instagram', icon: Instagram, url: config.socials.instagram },
    { name: 'YouTube', icon: Youtube, url: config.socials.youtube },
  ];

  const overlayClass =
    theme === 'dark'
      ? 'bg-gradient-to-b from-black/85 via-black/75 to-black/92'
      : 'bg-gradient-to-b from-white/90 via-stone-50/85 to-stone-100/90';

  const textColorClass = theme === 'dark' ? 'text-stone-100' : 'text-stone-900';
  const subtitleColorClass = theme === 'dark' ? 'text-stone-300' : 'text-stone-700';

  return (
    <div className={`relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-stone-950 text-stone-100' : 'bg-stone-100 text-stone-900'}`}>
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-out transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('/images/foundation_hero_bg.jpg')`,
        }}
      />

      {/* Atmospheric Vignette & Color Overlay */}
      <div className={`absolute inset-0 z-0 ${overlayClass} backdrop-blur-[1.5px]`} />

      {/* Soft Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-5 sm:py-6 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setLogoVariant(logoVariant === 'full' ? 'mark' : 'full')}
            className="flex items-center text-left focus:outline-none group"
            title={lang === 'bn' ? 'লোগো স্টাইল পরিবর্তন করতে ক্লিক করুন' : 'Click to toggle logo view'}
          >
            <BrandLogo
              variant={logoVariant}
              size="md"
              textColorClass={theme === 'dark' ? 'text-white' : 'text-[#c93d51]'}
              customLogoUrl={config.customLogoUrl}
              logoDisplayMode={config.logoDisplayMode}
              customLogoBadgeBg={config.customLogoBadgeBg}
              altText={lang === 'bn' ? config.orgNameBn : config.orgNameEn}
            />
          </button>
        </div>

        {/* Action Controls & Donate CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              theme === 'dark'
                ? 'bg-stone-900/70 border border-white/10 text-stone-200 hover:bg-stone-800'
                : 'bg-white/80 border border-stone-200 text-stone-800 hover:bg-white shadow-xs'
            }`}
            title="Switch Language (বাংলা / English)"
          >
            <Globe className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'bn' ? 'ENG' : 'বাংলা'}</span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg text-xs transition-all ${
              theme === 'dark'
                ? 'bg-stone-900/70 border border-white/10 text-amber-300 hover:bg-stone-800'
                : 'bg-white/80 border border-stone-200 text-stone-700 hover:bg-white shadow-xs'
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* About Us Button */}
          <button
            onClick={onOpenAbout}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === 'dark'
                ? 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'bn' ? 'আমাদের লক্ষ্য' : 'About'}</span>
          </button>

          {/* Contact Button */}
          <button
            onClick={onOpenContact}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              theme === 'dark'
                ? 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
            <span>{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</span>
          </button>

          {/* Prominent Donation CTA (Echoing the reference layout top-right button) */}
          <button
            onClick={onOpenDonate}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#c93d51] text-white text-xs sm:text-sm font-semibold tracking-wide hover:bg-rose-700 active:scale-95 transition-all duration-200 shadow-lg shadow-rose-900/30 flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>{lang === 'bn' ? 'সহায়তা করুন' : 'Donate Now'}</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN HERO SECTION ================= */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16 flex flex-col items-center justify-center text-center my-auto">
        {/* Subtle Brand Kicker */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-600/10 border border-rose-500/20 text-rose-400 text-xs font-medium tracking-wide uppercase mb-4 sm:mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {lang === 'bn'
              ? 'শিকড়ে বন্ধন • গন্তব্যে সম্ভাবনার আলো'
              : 'Nurturing Roots • Empowering Routes'}
          </span>
        </div>

        {/* Master Heading: "Coming Soon" with Grand Serif Elegance */}
        <h1
          className={`font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight drop-shadow-md mb-4 sm:mb-5 transition-colors ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}
        >
          {lang === 'bn' ? config.headlineBn : config.headlineEn}
        </h1>

        {/* Subtitle / Foundation Purpose */}
        <p
          className={`max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed mb-8 sm:mb-10 font-light ${subtitleColorClass}`}
        >
          {lang === 'bn' ? config.subheadlineBn : config.subheadlineEn}
        </p>

        {/* Email Subscribe / Notification Box */}
        <div className="w-full max-w-md">
          <form
            onSubmit={handleSubscribe}
            className={`p-1.5 rounded-2xl border transition-all shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ${
              theme === 'dark'
                ? 'bg-stone-900/80 border-white/15 focus-within:border-rose-500'
                : 'bg-white/90 border-stone-300 focus-within:border-rose-500'
            }`}
          >
            <div className="flex items-center flex-1 px-3 py-1.5 gap-2">
              <Mail className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="email"
                required
                placeholder={
                  lang === 'bn'
                    ? 'আপনার ইমেইল অ্যাড্রেস লিখুন...'
                    : 'Enter your email for launch alerts...'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-transparent text-xs sm:text-sm focus:outline-none placeholder:text-stone-400 ${
                  theme === 'dark' ? 'text-white' : 'text-stone-900'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={subscribing}
              className="px-5 py-2.5 rounded-xl bg-[#c93d51] text-white text-xs sm:text-sm font-semibold hover:bg-rose-700 transition-all shrink-0 flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
            >
              {subscribing ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{lang === 'bn' ? 'আমাকে জানান' : 'Notify Me'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Feedback message */}
          {subscribeMessage && (
            <div
              className={`mt-2.5 px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all ${
                subscribeMessage.success
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {subscribeMessage.success ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{subscribeMessage.text}</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {lang === 'bn'
                ? '১০০% স্প্যাম-মুক্ত। আমরা শুধুমাত্র সাইট উন্মোচনের আপডেট জানাবো।'
                : '100% spam-free. We only notify you upon launch.'}
            </span>
          </div>
        </div>
      </main>

      {/* ================= BOTTOM BAR (Echoing Reference Image) ================= */}
      {/* Reference: Bottom left has "Launching In" + 4 glass digit cards; Bottom right has Social Icons + Copyright */}
      <footer className="relative z-20 w-full px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-t border-white/5">
        {/* Bottom Left: Countdown Timer */}
        <div className="w-full md:w-auto flex flex-col items-center md:items-start">
          <CountdownTimer
            targetDate={config.launchDate}
            lang={lang}
            theme={theme}
          />
        </div>

        {/* Bottom Right: Social Links & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-2.5 text-center md:text-right">
          {/* Social icons row */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
              {lang === 'bn' ? 'যুক্ত থাকুন :' : 'Follow Us :'}
            </span>
            <div className="flex items-center gap-2">
              {socialLinks.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      theme === 'dark'
                        ? 'bg-stone-900/80 border border-white/10 text-stone-300 hover:text-white hover:border-rose-500 hover:bg-rose-950/40'
                        : 'bg-white/90 border border-stone-300 text-stone-700 hover:text-rose-600 hover:border-rose-400 shadow-xs'
                    }`}
                    title={s.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
              {/* WhatsApp direct chat link */}
              <a
                href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Copyright & Quick Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs text-stone-400">
            <span>
              &copy; {new Date().getFullYear()} {lang === 'bn' ? config.orgNameBn : config.orgNameEn}.{' '}
              {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All Rights Reserved.'}
            </span>
            <span aria-hidden="true">•</span>
            <button
              onClick={onOpenContact}
              className="text-stone-400 hover:text-rose-400 transition-colors"
            >
              {lang === 'bn' ? 'যোগাযোগ' : 'Contact'}
            </button>
            <span aria-hidden="true">•</span>
            <button
              onClick={onOpenAbout}
              className="text-stone-400 hover:text-rose-400 transition-colors"
            >
              {lang === 'bn' ? 'আমাদের মিশন' : 'Mission'}
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Discreet Admin Trigger in Bottom Corner */}
      <button
        onClick={onOpenAdmin}
        className={`fixed bottom-3 right-3 z-30 p-2 rounded-full border shadow-lg transition-all ${
          theme === 'dark'
            ? 'bg-stone-950/80 border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-500/50'
            : 'bg-white/90 border-stone-300 text-stone-600 hover:text-rose-600 hover:border-rose-400 shadow-md'
        }`}
        title={lang === 'bn' ? 'অ্যাডমিন প্যানেল (লগইন)' : 'Admin Portal (Login)'}
        aria-label="Admin Portal"
      >
        <Lock className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
