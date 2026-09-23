import React from 'react';
import { X, Target, Compass, Sprout, ShieldAlert, Award } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { SiteConfig } from '../types';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  lang?: 'bn' | 'en';
  theme?: 'dark' | 'light';
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  config,
  lang = 'bn',
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const modalBg = theme === 'dark' ? 'bg-stone-900 border-white/10 text-stone-100' : 'bg-white border-stone-200 text-stone-900';
  const cardBg = theme === 'dark' ? 'bg-stone-950/60 border-stone-800' : 'bg-stone-50 border-stone-200';

  const pillars = [
    {
      icon: Sprout,
      titleBn: 'শিকড় (Roots): তৃণমূলের ক্ষমতায়ন',
      titleEn: 'Roots: Grassroots Empowerment',
      descBn: 'সমাজের একেবারে প্রান্তিক মানুষদের জীবনযাত্রার মান উন্নয়ন, মৌলিক অধিকার নিশ্চিতকরণ এবং টেকসই সামাজিক কাঠামো তৈরি।',
      descEn: 'Anchoring vulnerable communities through basic rights, nutritional support, and dignity.',
    },
    {
      icon: Compass,
      titleBn: 'গতিপথ (Routes): ভবিষ্যতের দিগন্ত',
      titleEn: 'Routes: Future Pathways',
      descBn: 'সুবিধাবঞ্চিত শিশুদের গুণগত আধুনিক শিক্ষা, তথ্যপ্রযুক্তি প্রশিক্ষণ এবং তরুণদের কর্মমুখী স্বাবলম্বীকরণ।',
      descEn: 'Opening transformative pathways through education, digital literacy, and youth livelihood creation.',
    },
    {
      icon: Award,
      titleBn: 'স্বচ্ছতা ও পেশাদারিত্ব',
      titleEn: 'Integrity & Transparency',
      descBn: 'প্রতিটি দান ও সহায়তার ১০০% স্বচ্ছ ব্যবহার এবং নিয়মিত অডিট ও সামাজিক প্রভাব মূল্যায়ন।',
      descEn: '100% accountable allocation of funds with regular impact audits and real-time community reporting.',
    },
  ];

  const missionText = lang === 'bn' ? (config.missionBn || config.subheadlineBn) : (config.missionEn || config.subheadlineEn);
  const visionText = lang === 'bn' ? config.visionBn : config.visionEn;
  const philosophyText = lang === 'bn' ? config.philosophyBn : config.philosophyEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-6 ${modalBg}`}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-700/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo
              variant="mark"
              size="sm"
              customLogoUrl={config.customLogoUrl}
              logoDisplayMode={config.logoDisplayMode}
              customLogoBadgeBg={config.customLogoBadgeBg}
              altText={lang === 'bn' ? config.orgNameBn : config.orgNameEn}
            />
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-rose-500">
                {lang === 'bn' ? 'আমাদের লক্ষ্য ও মিশন' : 'Our Mission & Vision'}
              </h3>
              <p className="text-xs text-stone-400">
                {lang === 'bn' ? config.orgNameBn : config.orgNameEn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Philosophy / Overview */}
          {philosophyText && (
            <div className={`p-4 rounded-xl border leading-relaxed text-xs sm:text-sm text-stone-300 ${cardBg}`}>
              <p>{philosophyText}</p>
            </div>
          )}

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Mission */}
            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <Target className="w-4 h-4 text-rose-500" />
                <h4 className="font-serif font-bold text-sm">
                  {lang === 'bn' ? 'আমাদের মিশন (Mission)' : 'Our Mission'}
                </h4>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {missionText}
              </p>
            </div>

            {/* Vision */}
            <div className={`p-4 rounded-xl border ${cardBg}`}>
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <h4 className="font-serif font-bold text-sm">
                  {lang === 'bn' ? 'আমাদের লক্ষ্য ও ভিশন (Vision)' : 'Our Vision'}
                </h4>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {visionText}
              </p>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              {lang === 'bn' ? 'আমাদের মূল কর্মস্তম্ভ' : 'Core Strategic Pillars'}
            </span>
            <div className="grid grid-cols-1 gap-3">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3.5 ${cardBg}`}>
                    <div className="w-9 h-9 rounded-lg bg-rose-600/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-rose-400">
                        {lang === 'bn' ? p.titleBn : p.titleEn}
                      </h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        {lang === 'bn' ? p.descBn : p.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
