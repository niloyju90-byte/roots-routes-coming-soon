import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import type { Subscriber, DonationRecord, SiteConfig } from '../types';

const STORAGE_KEYS = {
  SUBSCRIBERS: 'rr_foundation_subscribers',
  DONATIONS: 'rr_foundation_donations',
  CONFIG: 'rr_foundation_site_config',
};

// Target date: approx 75 days in future from Sept 2026 -> Dec 16, 2026 (Victory Day / Launch)
const DEFAULT_CONFIG: SiteConfig = {
  launchDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
  orgNameBn: 'রুটস অ্যান্ড রুটস ফাউন্ডেশন',
  orgNameEn: 'Roots & Routes Foundation',
  headlineBn: 'শীঘ্রই আসছি',
  headlineEn: 'Coming Soon',
  subheadlineBn: 'সহমর্মিতা ও সম্ভাবনার নতুন দিগন্ত। অসহায় মানুষের পাশে দাঁড়াতে, শিক্ষাকে ছড়িয়ে দিতে এবং স্বাবলম্বী সমাজ বিনির্মাণে আমাদের সার্বিক কার্যক্রমের মূল ওয়েবসাইট দ্রুত উন্মুক্ত হতে যাচ্ছে।',
  subheadlineEn: 'Nurturing deep community roots, cultivating transformative pathways. Our comprehensive humanitarian platform is launching soon to champion education, dignity, and sustainable grassroots empowerment.',
  missionBn: 'সমাজের পিছিয়ে পড়া ও সুবিধাবঞ্চিত জনগোষ্ঠীর জীবনমান উন্নয়ন, মানসম্মত শিক্ষা নিশ্চিতকরণ এবং তরুণ প্রজন্মকে স্বাবলম্বী ও দক্ষ মানবসম্পদ হিসেবে গড়ে তোলা।',
  missionEn: 'To uplift marginalized communities through grassroots empowerment, ensure quality inclusive education, and cultivate skilled, self-reliant youth.',
  visionBn: 'একটি আত্মমর্যাদাশীল, বৈষম্যহীন ও স্বাবলম্বী মানবিক সমাজ বিনির্মাণ, যেখানে প্রতিটি মানুষের নিজস্ব শিকড় থাকবে সুরক্ষিত এবং ভবিষ্যতের গতিপথ থাকবে উন্মুক্ত।',
  visionEn: 'A resilient, dignified, and inclusive society where community roots are fortified and transformative pathways to prosperity are accessible to all.',
  philosophyBn: 'রুটস অ্যান্ড রুটস ফাউন্ডেশন একটি অলাভজনক ও সহায়তামূলক মানবিক প্রতিষ্ঠান। আমরা বিশ্বাস করি, মানুষের ঐতিহ্য, সংস্কৃতি ও সামাজিক শিকড়কে মজবুত রেখেই কেবল সম্ভাবনাময় ভবিষ্যৎ ও সফল জীবনের গতিপথ তৈরি করা সম্ভব।',
  philosophyEn: 'Roots & Routes Foundation is a non-profit humanitarian initiative dedicated to nurturing community resilience from the ground up while carving clear pathways toward education, dignity, and sustainable growth.',
  customLogoUrl: '',
  logoDisplayMode: 'symbol_and_text',
  customLogoBadgeBg: 'rose',
  videoUrl: '/video.mp4',
  contactEmail: 'contact@rootsroutes.org',
  contactPhone: '+880 1711-234567',
  contactAddressBn: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ',
  contactAddressEn: 'House 12, Road 5, Dhanmondi, Dhaka-1209, Bangladesh',
  whatsappNumber: '+8801711234567',
  socials: {
    facebook: 'https://facebook.com/rootsroutesfdn',
    twitter: 'https://twitter.com/rootsroutesfdn',
    linkedin: 'https://linkedin.com/company/roots-routes-foundation',
    instagram: 'https://instagram.com/rootsroutesfdn',
    youtube: 'https://youtube.com/@rootsroutesfoundation',
  },
  donationAccounts: {
    bkash: '01711-234567 (মার্চেন্ট / পার্সোনাল)',
    nagad: '01811-234567 (পার্সোনাল)',
    rocket: '01911-234567-9 (পার্সোনাল)',
    bankName: 'City Bank PLC / Islami Bank Bangladesh',
    bankAccountName: 'Roots & Routes Foundation Bangladesh',
    bankAccountNumber: '1502-3984-7291-0001',
    bankBranch: 'Dhanmondi Branch, Dhaka',
    bankRouting: '225271892',
  },
};

const INITIAL_SUBSCRIBERS: Subscriber[] = [];

const INITIAL_DONATIONS: DonationRecord[] = [];

// Helper to get local storage item safely
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

// 1. Site Configuration
export async function getSiteConfig(): Promise<SiteConfig> {
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'siteConfig', 'main');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const remoteData = snap.data() as Partial<SiteConfig>;
        return {
          ...DEFAULT_CONFIG,
          ...remoteData,
          socials: { ...DEFAULT_CONFIG.socials, ...(remoteData.socials || {}) },
          donationAccounts: { ...DEFAULT_CONFIG.donationAccounts, ...(remoteData.donationAccounts || {}) },
        };
      }
    } catch (e) {
      console.warn('Firestore fetch siteConfig fallback:', e);
    }
  }
  const cached = getLocal<Partial<SiteConfig>>(STORAGE_KEYS.CONFIG, {});
  return {
    ...DEFAULT_CONFIG,
    ...cached,
    socials: { ...DEFAULT_CONFIG.socials, ...(cached.socials || {}) },
    donationAccounts: { ...DEFAULT_CONFIG.donationAccounts, ...(cached.donationAccounts || {}) },
  };
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  setLocal(STORAGE_KEYS.CONFIG, config);
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'siteConfig', 'main');
      await setDoc(docRef, config, { merge: true });
    } catch (e) {
      console.warn('Firestore save siteConfig error:', e);
    }
  }
}

// 2. Subscribers
export async function getSubscribers(): Promise<Subscriber[]> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'subscribers'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subscriber));
      }
    } catch (e) {
      console.warn('Firestore subscribers fetch error:', e);
    }
  }
  return getLocal<Subscriber[]>(STORAGE_KEYS.SUBSCRIBERS, INITIAL_SUBSCRIBERS);
}

export async function addSubscriber(email: string, source: string = 'Hero Input'): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const existing = await getSubscribers();
  
  if (existing.some(s => s.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'এই ইমেইলটি আগেই নিবন্ধিত হয়েছে! (This email is already subscribed.)' };
  }

  const newSub: Subscriber = {
    id: 'sub-' + Date.now(),
    email: cleanEmail,
    createdAt: new Date().toISOString(),
    source,
    status: 'active',
  };

  const updated = [newSub, ...existing];
  setLocal(STORAGE_KEYS.SUBSCRIBERS, updated);

  if (db && isFirebaseConfigured) {
    try {
      await addDoc(collection(db, 'subscribers'), newSub);
    } catch (e) {
      console.warn('Firestore add subscriber error:', e);
    }
  }

  return { success: true, message: 'অভিনন্দন! আপনাকে শীঘ্রই আপডেট জানানো হবে।' };
}

export async function removeSubscriber(id: string): Promise<void> {
  const current = await getSubscribers();
  const filtered = current.filter(s => s.id !== id);
  setLocal(STORAGE_KEYS.SUBSCRIBERS, filtered);

  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'subscribers', id));
    } catch (e) {
      console.warn('Firestore delete subscriber error:', e);
    }
  }
}

// 3. Donations
export async function getDonations(): Promise<DonationRecord[]> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'donations'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as DonationRecord));
      }
    } catch (e) {
      console.warn('Firestore donations fetch error:', e);
    }
  }
  return getLocal<DonationRecord[]>(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
}

export async function recordDonation(data: Omit<DonationRecord, 'id' | 'createdAt' | 'status'>): Promise<DonationRecord> {
  const record: DonationRecord = {
    ...data,
    id: 'don-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  const current = await getDonations();
  const updated = [record, ...current];
  setLocal(STORAGE_KEYS.DONATIONS, updated);

  if (db && isFirebaseConfigured) {
    try {
      await addDoc(collection(db, 'donations'), record);
    } catch (e) {
      console.warn('Firestore add donation error:', e);
    }
  }

  return record;
}

export async function updateDonationStatus(id: string, status: 'verified' | 'pending'): Promise<void> {
  const current = await getDonations();
  const updated = current.map(d => d.id === id ? { ...d, status } : d);
  setLocal(STORAGE_KEYS.DONATIONS, updated);

  if (db && isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'donations', id), { status });
    } catch (e) {
      console.warn('Firestore update donation status error:', e);
    }
  }
}

export async function removeDonation(id: string): Promise<void> {
  const current = await getDonations();
  const filtered = current.filter(d => d.id !== id);
  setLocal(STORAGE_KEYS.DONATIONS, filtered);

  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'donations', id));
    } catch (e) {
      console.warn('Firestore delete donation error:', e);
    }
  }
}
