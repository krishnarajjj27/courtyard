import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface LandingPageContent {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroCTA: string;
  heroSecondaryButton: string;
  heroImage: string;

  // Features Section
  features: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];

  // Stats Section
  stats: {
    id: string;
    value: string;
    label: string;
  }[];

  // About Section
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;

  // Gallery Section
  galleryTitle: string;
  gallerySubtitle: string;
  gallery: {
    id: string;
    url: string;
    caption: string;
  }[];
}

interface LandingPageContextType {
  content: LandingPageContent;
  updateContent: (content: Partial<LandingPageContent>) => void;
}

const LandingPageContext = createContext<LandingPageContextType | undefined>(undefined);

const STORAGE_KEY = 'tcy.landing-page.content';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';

const defaultContent: LandingPageContent = {
  heroTitle: 'Book Your Perfect Court',
  heroSubtitle: 'Experience Next-Level Sports',
  heroDescription: 'Premium court booking system with real-time availability, flexible subscriptions, and seamless payment integration. Your game, your schedule, your way.',
  heroCTA: 'Login',
  heroSecondaryButton: 'Signup',
  heroImage: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop',
  
  features: [
    {
      id: '1',
      icon: 'Calendar',
      title: 'Real-Time Booking',
      description: 'Instantly book courts with live availability updates across all locations.',
    },
    {
      id: '2',
      icon: 'CreditCard',
      title: 'Flexible Subscriptions',
      description: 'Monthly plans with fixed time slots designed for regular players.',
    },
    {
      id: '3',
      icon: 'Clock',
      title: '5 AM to 11 PM',
      description: 'Extended hours across 3 premium courts to fit your schedule.',
    },
    {
      id: '4',
      icon: 'Shield',
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with instant confirmation.',
    },
  ],
  
  stats: [
    { id: '1', value: '1000+', label: 'Happy Players' },
    { id: '2', value: '3', label: 'Premium Courts' },
    { id: '3', value: '18hrs', label: 'Daily Availability' },
    { id: '4', value: '24/7', label: 'Support Available' },
  ],
  
  aboutTitle: 'Why Choose thecourtyard?',
  aboutDescription: 'We provide state-of-the-art sports facilities with a seamless booking experience. Our modern courts are equipped with professional-grade surfaces, lighting, and amenities. Whether you\'re a casual player or a serious athlete, thecourtyard offers the perfect environment for your game.',
  aboutImage: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800&h=600&fit=crop',
  
  galleryTitle: 'Our Premium Courts',
  gallerySubtitle: 'Experience the best in sports facilities',
  gallery: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800&h=600&fit=crop',
      caption: 'Court 1',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1594623930572-300a3011d9ae?w=800&h=600&fit=crop',
      caption: 'Court 2',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop',
      caption: 'Court 3',
    },
  ],
};

const loadStoredContent = () => {
  if (typeof window === 'undefined') {
    return defaultContent;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return defaultContent;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<LandingPageContent>;
    return {
      ...defaultContent,
      ...parsed,
      features: Array.isArray(parsed.features) ? parsed.features : defaultContent.features,
      stats: Array.isArray(parsed.stats) ? parsed.stats : defaultContent.stats,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : defaultContent.gallery,
    };
  } catch {
    return defaultContent;
  }
};

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<LandingPageContent>(loadStoredContent());

  useEffect(() => {
    let active = true;

    const loadRemoteContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        const payload = await response.json();
        const remoteContent = payload?.settings?.landing;

        if (!active || !remoteContent || typeof remoteContent !== 'object') {
          return;
        }

        setContent(prev => {
          const nextContent = {
            ...defaultContent,
            ...prev,
            ...remoteContent,
            features: Array.isArray(remoteContent.features) ? remoteContent.features : prev.features,
            stats: Array.isArray(remoteContent.stats) ? remoteContent.stats : prev.stats,
            gallery: Array.isArray(remoteContent.gallery) ? remoteContent.gallery : prev.gallery,
          };

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextContent));
          }

          return nextContent;
        });
      } catch {
        // Keep the local fallback if the backend is temporarily unavailable.
      }
    };

    void loadRemoteContent();

    const pollTimer = window.setInterval(() => {
      void loadRemoteContent();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(pollTimer);
    };
  }, []);

  const updateContent = (newContent: Partial<LandingPageContent>) => {
    setContent((prev) => {
      const nextContent = { ...prev, ...newContent };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextContent));
      }

      void (async () => {
        try {
          if (!supabase) {
            return;
          }

          const { data } = await supabase.auth.getSession();
          const accessToken = data.session?.access_token;
          if (!accessToken) {
            return;
          }

          await fetch(`${API_BASE_URL}/settings`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ landing: nextContent }),
          });
        } catch {
          // Ignore sync failures; local state has already been updated.
        }
      })();

      return nextContent;
    });
  };

  return (
    <LandingPageContext.Provider value={{ content, updateContent }}>
      {children}
    </LandingPageContext.Provider>
  );
};

export const useLandingPage = () => {
  const context = useContext(LandingPageContext);
  if (!context) {
    throw new Error('useLandingPage must be used within LandingPageProvider');
  }
  return context;
};