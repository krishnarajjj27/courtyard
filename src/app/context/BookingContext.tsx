import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export interface TimeSlot {
  id: string;
  time: string;
  court: number;
  date: string;
  status: 'available' | 'booked' | 'selected';
  price: number;
}

export interface Booking {
  id: string;
  courtName: string;
  date: string;
  slots: TimeSlot[];
  totalAmount: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentId?: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  courtName: string;
  court: number;
  timeSlot: string;
  startDate: string;
  endDate: string;
  weekdaysCount: number;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  paymentId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  createdAt: string;
}

export interface AppSettings {
  pricing: {
    offPeak: number;
    peak: number;
    subscription: number;
  };
  courts: string[];
  operatingHours: {
    startHour: number;
    endHour: number;
  };
  landing?: Record<string, string | number>;
}

interface BookingContextType {
  selectedSlots: TimeSlot[];
  bookings: Booking[];
  subscriptions: Subscription[];
  appSettings: AppSettings;
  refreshAppSettings: () => Promise<void>;
  updateAppSettings: (payload: Partial<AppSettings>) => Promise<AppSettings>;
  addSlot: (slot: TimeSlot) => void;
  removeSlot: (slotId: string) => void;
  clearSlots: () => void;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>, options?: { asAdmin?: boolean }) => Promise<Booking>;
  createSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>, options?: { asAdmin?: boolean }) => Promise<Subscription>;
  cancelBooking: (bookingId: string, options?: { asAdmin?: boolean }) => Promise<void>;
  cancelSubscription: (subscriptionId: string, options?: { asAdmin?: boolean }) => Promise<void>;
  isSlotBooked: (date: string, court: number, time: string) => boolean;
  getTotalAmount: () => number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api';
const SETTINGS_SYNC_KEY = 'tcy.settings.updatedAt';
const SETTINGS_REFRESH_INTERVAL_MS = 15000;

const DEFAULT_APP_SETTINGS: AppSettings = {
  pricing: {
    offPeak: 500,
    peak: 800,
    subscription: 2500,
  },
  courts: ['Court 1', 'Court 2', 'Court 3'],
  operatingHours: {
    startHour: 5,
    endHour: 22,
  },
  landing: {},
};

const readStoredAccessToken = async () => {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (!error && data.session?.access_token) {
    return data.session.access_token;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const authTokenKey = Object.keys(window.localStorage).find(key => key.endsWith('-auth-token'));
  if (!authTokenKey) {
    return null;
  }

  const rawSession = window.localStorage.getItem(authTokenKey);
  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as { access_token?: string };
    return parsedSession.access_token || null;
  } catch {
    return null;
  }
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`);

const normalizeTimeSlot = (timeSlot: string) => {
  const [startPart, endPart] = timeSlot.split(' - ').map(part => part.trim());

  if (endPart) {
    return `${startPart} - ${endPart}`;
  }

  const startMatch = startPart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!startMatch) {
    return timeSlot;
  }

  const startHour = Number(startMatch[1]);
  const meridiem = startMatch[3].toUpperCase();
  let hour24 = startHour % 12;

  if (meridiem === 'PM') {
    hour24 += 12;
  }

  const endHour24 = (hour24 + 1) % 24;
  const endMeridiem = endHour24 >= 12 ? 'PM' : 'AM';
  const endHour12 = endHour24 % 12 || 12;

  return `${startPart} - ${endHour12}:00 ${endMeridiem}`;
};

const isWeekday = (dateKey: string) => {
  const day = parseDateKey(dateKey).getDay();
  return day !== 0 && day !== 6;
};

const isWithinInclusiveRange = (dateKey: string, startDate: string, endDate: string) => {
  const target = parseDateKey(dateKey).getTime();
  const start = parseDateKey(startDate).getTime();
  const end = parseDateKey(endDate).getTime();
  return target >= start && target <= end;
};

const getDateRange = (startDate: string, endDate: string) => {
  const dates: string[] = [];
  const current = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  while (current <= end) {
    dates.push(toDateKey(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  const getAccessToken = async () => {
    const token = await readStoredAccessToken();

    if (!token) {
      throw new Error('Please sign in to continue');
    }
    return token;
  };

  const refreshAppSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (!response.ok) {
        throw new Error('Unable to fetch app settings');
      }

      const payload = await response.json();
      setAppSettings({
        pricing: {
          offPeak: Number(payload?.pricing?.offPeak ?? DEFAULT_APP_SETTINGS.pricing.offPeak),
          peak: Number(payload?.pricing?.peak ?? DEFAULT_APP_SETTINGS.pricing.peak),
          subscription: Number(payload?.pricing?.subscription ?? DEFAULT_APP_SETTINGS.pricing.subscription),
        },
        courts: Array.isArray(payload?.courts) && payload.courts.length ? payload.courts : DEFAULT_APP_SETTINGS.courts,
        operatingHours: {
          startHour: Number(payload?.operatingHours?.startHour ?? DEFAULT_APP_SETTINGS.operatingHours.startHour),
          endHour: Number(payload?.operatingHours?.endHour ?? DEFAULT_APP_SETTINGS.operatingHours.endHour),
        },
        landing: payload?.landing && typeof payload.landing === 'object' ? payload.landing : {},
      });
    } catch {
      setAppSettings(DEFAULT_APP_SETTINGS);
    }
  };

  const updateAppSettings = async (payload: Partial<AppSettings>) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const rawBody = await response.text();
    let body: Record<string, unknown> | null = null;

    try {
      body = rawBody ? JSON.parse(rawBody) as Record<string, unknown> : null;
    } catch {
      body = null;
    }

    if (!response.ok) {
      const errorPayload = body?.error as { message?: string } | undefined;

      if (errorPayload?.message) {
        throw new Error(errorPayload.message);
      }

      if (response.status >= 500) {
        throw new Error('Backend API is unavailable. Please start the server and try again.');
      }

      throw new Error('Unable to update settings');
    }

    const nextSettings: AppSettings = {
      pricing: {
        offPeak: Number(body?.pricing?.offPeak ?? DEFAULT_APP_SETTINGS.pricing.offPeak),
        peak: Number(body?.pricing?.peak ?? DEFAULT_APP_SETTINGS.pricing.peak),
        subscription: Number(body?.pricing?.subscription ?? DEFAULT_APP_SETTINGS.pricing.subscription),
      },
      courts: Array.isArray(body?.courts) && body.courts.length ? body.courts : DEFAULT_APP_SETTINGS.courts,
      operatingHours: {
        startHour: Number(body?.operatingHours?.startHour ?? DEFAULT_APP_SETTINGS.operatingHours.startHour),
        endHour: Number(body?.operatingHours?.endHour ?? DEFAULT_APP_SETTINGS.operatingHours.endHour),
      },
      landing: body?.landing && typeof body.landing === 'object' ? body.landing : {},
    };

    setAppSettings(nextSettings);
    window.localStorage.setItem(SETTINGS_SYNC_KEY, String(Date.now()));
    return nextSettings;
  };

  const fetchData = async () => {
    try {
      const accessToken = await getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const [bookingsResponse, subscriptionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/bookings`, { headers }),
        fetch(`${API_BASE_URL}/subscriptions`, { headers }),
      ]);

      if (bookingsResponse.ok) {
        const payload = await bookingsResponse.json();
        setBookings(payload.bookings || []);
      }

      if (subscriptionsResponse.ok) {
        const payload = await subscriptionsResponse.json();
        setSubscriptions(payload.subscriptions || []);
      }
    } catch {
      setBookings([]);
      setSubscriptions([]);
    }
  };

  useEffect(() => {
    void refreshAppSettings();
  }, []);

  useEffect(() => {
    const refresh = () => {
      void refreshAppSettings();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_SYNC_KEY) {
        refresh();
      }
    };

    const onFocus = () => {
      refresh();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    const interval = window.setInterval(refresh, SETTINGS_REFRESH_INTERVAL_MS);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setSubscriptions([]);
      return;
    }

    void fetchData();
  }, [user]);

  const isSlotBooked = (date: string, court: number, time: string) => {
    const normalizedTime = normalizeTimeSlot(time);

    const bookingConflict = bookings.some(booking => {
      if (booking.status === 'cancelled') {
        return false;
      }

      return booking.slots.some(slot => {
        return slot.date === date && slot.court === court && normalizeTimeSlot(slot.time) === normalizedTime;
      });
    });

    if (bookingConflict) {
      return true;
    }

    return subscriptions.some(subscription => {
      if (subscription.status !== 'active') {
        return false;
      }

      if (subscription.court !== court) {
        return false;
      }

      if (normalizeTimeSlot(subscription.timeSlot) !== normalizedTime) {
        return false;
      }

      if (!isWithinInclusiveRange(date, subscription.startDate, subscription.endDate)) {
        return false;
      }

      return isWeekday(date);
    });
  };

  const addSlot = (slot: TimeSlot) => {
    if (isSlotBooked(slot.date, slot.court, slot.time)) {
      return;
    }

    setSelectedSlots(prev => {
      const exists = prev.find(s => s.id === slot.id);
      if (exists) return prev;
      return [...prev, { ...slot, status: 'selected' }];
    });
  };

  const removeSlot = (slotId: string) => {
    setSelectedSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  const clearSlots = () => {
    setSelectedSlots([]);
  };

  const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>, options?: { asAdmin?: boolean }) => {
    const conflictingSlot = booking.slots.find(slot => isSlotBooked(slot.date, slot.court, slot.time));

    if (conflictingSlot) {
      throw new Error('One or more selected slots are already booked. Please refresh the booking page and choose another slot.');
    }

    const accessToken = await getAccessToken();
    const endpoint = options?.asAdmin ? `${API_BASE_URL}/admin/bookings` : `${API_BASE_URL}/bookings`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(booking),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.booking) {
      throw new Error(payload?.error?.message || 'Unable to create booking');
    }

    const newBooking: Booking = payload.booking;
    setBookings(prev => [newBooking, ...prev.filter(existing => existing.id !== newBooking.id)]);
    clearSlots();

    return newBooking;
  };

  const createSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt'>, options?: { asAdmin?: boolean }) => {
    const normalizedTimeSlot = normalizeTimeSlot(subscription.timeSlot);
    const dates = getDateRange(subscription.startDate, subscription.endDate).filter(isWeekday);
    const conflictingDate = dates.find(date => isSlotBooked(date, subscription.court, normalizedTimeSlot));

    if (conflictingDate) {
      throw new Error('This subscription slot is already booked for part of the selected month. Please choose a different court or time slot.');
    }

    const accessToken = await getAccessToken();
    const endpoint = options?.asAdmin ? `${API_BASE_URL}/admin/subscriptions` : `${API_BASE_URL}/subscriptions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...subscription,
        timeSlot: normalizedTimeSlot,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.subscription) {
      throw new Error(payload?.error?.message || 'Unable to create subscription');
    }

    const newSubscription: Subscription = payload.subscription;
    setSubscriptions(prev => [newSubscription, ...prev.filter(existing => existing.id !== newSubscription.id)]);

    return newSubscription;
  };

  const cancelBooking = async (bookingId: string, options?: { asAdmin?: boolean }) => {
    const accessToken = await getAccessToken();
    const endpoint = options?.asAdmin
      ? `${API_BASE_URL}/admin/bookings/${bookingId}`
      : `${API_BASE_URL}/bookings/${bookingId}`;

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.booking) {
      throw new Error(payload?.error?.message || 'Unable to cancel booking');
    }

    setBookings(prev => prev.map(existing => (existing.id === payload.booking.id ? payload.booking : existing)));
  };

  const cancelSubscription = async (subscriptionId: string, options?: { asAdmin?: boolean }) => {
    const accessToken = await getAccessToken();
    const endpoint = options?.asAdmin
      ? `${API_BASE_URL}/admin/subscriptions/${subscriptionId}`
      : `${API_BASE_URL}/subscriptions/${subscriptionId}`;

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.subscription) {
      throw new Error(payload?.error?.message || 'Unable to cancel subscription');
    }

    setSubscriptions(prev => prev.map(existing => (existing.id === payload.subscription.id ? payload.subscription : existing)));
  };

  const getTotalAmount = () => {
    return selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedSlots,
        bookings,
        subscriptions,
        appSettings,
        refreshAppSettings,
        updateAppSettings,
        addSlot,
        removeSlot,
        clearSlots,
        createBooking,
        createSubscription,
        cancelBooking,
        cancelSubscription,
        isSlotBooked,
        getTotalAmount,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};