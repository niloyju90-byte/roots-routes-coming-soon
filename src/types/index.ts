export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  source?: string;
  status?: 'active' | 'unsubscribed';
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: 'BDT' | 'USD';
  method: 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Card';
  purpose: string;
  transactionId: string;
  createdAt: string;
  status: 'verified' | 'pending';
  note?: string;
}

export interface SiteConfig {
  launchDate: string; // ISO string e.g. "2026-11-01T00:00:00.000Z"
  headlineBn: string;
  headlineEn: string;
  subheadlineBn: string;
  subheadlineEn: string;
  orgNameBn: string;
  orgNameEn: string;
  missionBn: string;
  missionEn: string;
  visionBn: string;
  visionEn: string;
  philosophyBn: string;
  philosophyEn: string;
  customLogoUrl?: string;
  logoDisplayMode?: 'symbol_and_text' | 'image_only';
  customLogoBadgeBg?: 'rose' | 'transparent' | 'white' | 'dark';
  videoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  contactAddressBn: string;
  contactAddressEn: string;
  whatsappNumber: string;
  socials: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
  donationAccounts: {
    bkash: string;
    nagad: string;
    rocket: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankBranch: string;
    bankRouting: string;
  };
}
