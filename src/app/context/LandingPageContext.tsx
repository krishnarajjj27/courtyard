import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const defaultContent: LandingPageContent = {
  heroTitle: 'Book Your Perfect Court',
  heroSubtitle: 'Experience Next-Level Sports',
  heroDescription: 'Premium court booking system with real-time availability, flexible subscriptions, and seamless payment integration. Your game, your schedule, your way.',
  heroCTA: 'Get Started Free',
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

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<LandingPageContent>(defaultContent);

  const updateContent = (newContent: Partial<LandingPageContent>) => {
    setContent((prev) => ({ ...prev, ...newContent }));
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