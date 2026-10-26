import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    nav_work: 'Work',
    nav_services: 'Services',
    nav_about: 'About',
    nav_process: 'Process',
    nav_insights: 'Insights',
    nav_contact: 'Contact',
    nav_start_project: 'Start a Project',
    hero_available: 'Accepting select client collaborations',
    hero_title_1: 'WE MAKE DIGITAL',
    hero_title_2: 'FEEL DIFFERENT.',
    hero_subheadline: 'Creative thinking. Digital experiences. Measurable growth.',
    hero_cta_primary: 'Start a Project',
    hero_cta_secondary: 'Explore Our Work',
    selected_work_title: 'SELECTED WORK',
    selected_work_subtitle: 'Art-directed digital experiences and high-growth creative systems.',
    services_title: 'SERVICES & DISCIPLINES',
    services_subtitle: 'Integrated creative engineering built for market impact.',
    process_title: 'CREATIVE PROCESS',
    process_subtitle: 'A disciplined, 4-step framework from vision to launch.',
    estimator_title: 'PROJECT BUDGET ESTIMATOR',
    estimator_subtitle: 'Calculate an indicative scope for your next creative initiative.',
    contact_title: 'HAVE SOMETHING GOOD IN MIND?',
    contact_subtitle: 'Tell us what you’re building. We’ll help you figure out the next step.',
    contact_direct: 'Direct Channels',
    cookie_title: 'Cookie Preferences',
    cookie_desc: 'We use cookies and ambient browser storage to ensure optimal navigation and analyze site performance.',
    cookie_accept_all: 'Accept All',
    cookie_save: 'Save Preferences',
    cookie_necessary: 'Strictly Necessary',
    cookie_analytics: 'Analytics & Performance',
    cookie_marketing: 'Marketing & Attribution',
  },
  bn: {
    nav_work: 'প্রজেক্টসমূহ',
    nav_services: 'সার্ভিসসমূহ',
    nav_about: 'আমাদের সম্পর্কে',
    nav_process: 'কাজের পদ্ধতি',
    nav_insights: 'ব্লগ ও ভাবনা',
    nav_contact: 'যোগাযোগ',
    nav_start_project: 'প্রজেক্ট শুরু করুন',
    hero_available: 'নির্বাচিত ক্লায়েন্টদের সাথে কাজ চলমান',
    hero_title_1: 'ডিজিটাল অভিজ্ঞতাকে',
    hero_title_2: 'করুন অনন্য ও স্মরণীয়।',
    hero_subheadline: 'সৃজনশীল ভাবনা। ডিজিটাল অভিজ্ঞতা। পরিমাপযোগ্য ব্যবসায়িক বৃদ্ধি।',
    hero_cta_primary: 'প্রজেক্ট শুরু করুন',
    hero_cta_secondary: 'আমাদের কাজ দেখুন',
    selected_work_title: 'নির্বাচিত প্রজেক্ট',
    selected_work_subtitle: 'আন্তর্জাতিক মানের আধুনিক ব্র্যান্ড ও ডিজিটাল অভিজ্ঞতা।',
    services_title: 'আমাদের সার্ভিসসমূহ',
    services_subtitle: 'ওয়েব ডেভেলপমেন্ট, ব্র্যান্ডিং, মোশন ও ডিজিটাল গ্রোথ সমাধান।',
    process_title: 'কাজের ধাপসমূহ',
    process_subtitle: 'পরিকল্পনা থেকে বাস্তবায়ন—একটি সুশৃঙ্খল ৪-ধাপের প্রক্রিয়া।',
    estimator_title: 'প্রজেক্ট বাজেট ক্যালকুলেটর',
    estimator_subtitle: 'আপনার প্রজেক্টের প্রাথমিক সম্ভাব্য বাজেট ও সময়সীমা জানুন।',
    contact_title: 'নতুন কিছু শুরু করতে চান?',
    contact_subtitle: 'আপনার পরিকল্পনা আমাদের জানান। আমরা পরবর্তী ধাপ নির্ধারণে সাহায্য করব।',
    contact_direct: 'সরাসরি যোগাযোগ',
    cookie_title: 'কুকি সেটিংস',
    cookie_desc: 'ওয়েবসাইটের সঠিক পরিচালনা এবং উন্নত অভিজ্ঞতার জন্য আমরা কুকি ব্যবহার করি।',
    cookie_accept_all: 'সব অনুমোদন করুন',
    cookie_save: 'সেটিংস সংরক্ষণ করুন',
    cookie_necessary: 'অপরিহার্য কুকি',
    cookie_analytics: 'অ্যানালিটিক্স',
    cookie_marketing: 'মার্কেটিং',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('boostify_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('boostify_lang', language);
    if (language === 'bn') {
      document.body.classList.add('font-bengali');
    } else {
      document.body.classList.remove('font-bengali');
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
