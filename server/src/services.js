const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const { env } = require('./config');
const supabaseServices = require('./supabaseServices');
const {
  User,
  Booking,
  Subscription,
  PaymentOrder,
  Settings,
  ensureDefaultSettings,
} = require('./models');
const {
  ApiError,
  buildCookieOptions,
} = require('./middleware');
const {
  addDays,
  buildDailySlots,
  getDateRange,
  getSubscriptionWeekdays,
  isWeekday,
  normalizeTimeRange,
  toUtcDateKey,
} = require('./lib');

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const plainUser = typeof user.toObject === 'function' ? user.toObject() : user;
  const { passwordHash, __v, ...rest } = plainUser;
  return rest;
}

function issueAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function setAuthCookie(res, token) {
  res.cookie(env.jwtCookieName, token, buildCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(env.jwtCookieName, { ...buildCookieOptions(), maxAge: undefined });
}

async function registerUser({ name, email, phone, password }) {
  if (!name || !email || !phone || !password) {
    throw new ApiError(400, 'Name, email, phone, and password are required');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new ApiError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash,
    role: 'user',
    oauthProviders: ['email'],
  });

  const token = issueAuthToken(user);
  return { user: sanitizeUser(user), token };
}

async function loginUser({ email, password, role }) {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim(), role });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = issueAuthToken(user);
  return { user: sanitizeUser(user), token };
}

async function loginWithGoogle({ idToken, role }) {
  if (!idToken) {
    throw new ApiError(400, 'Google idToken is required');
  }

  if (!googleClient) {
    throw new ApiError(501, 'Google sign-in is not configured on the server');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new ApiError(400, 'Google token did not contain an email address');
  }

  const email = payload.email.toLowerCase().trim();
  let user = await User.findOne({ email, role });

  if (!user) {
    user = await User.create({
      name: payload.name || payload.given_name || 'Google User',
      email,
      phone: payload.phone_number || undefined,
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 12),
      role,
      googleId: payload.sub,
      oauthProviders: ['google'],
    });
  } else {
    user.googleId = payload.sub;
    if (!user.oauthProviders.includes('google')) {
      user.oauthProviders.push('google');
    }
    await user.save();
  }

  const token = issueAuthToken(user);
  return { user: sanitizeUser(user), token };
}

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sanitizeUser(user);
}

async function getAppSettings() {
  return ensureDefaultSettings();
}

async function updateAppSettings(payload) {
  const settings = await ensureDefaultSettings();

  if (payload.pricing) {
    settings.pricing = {
      ...settings.pricing,
      ...payload.pricing,
    };
  }

  if (Array.isArray(payload.courts) && payload.courts.length > 0) {
    settings.courts = payload.courts;
  }

  if (payload.operatingHours) {
    settings.operatingHours = {
      ...settings.operatingHours,
      ...payload.operatingHours,
    };
  }

  if (payload.landing) {
    settings.landing = {
      ...settings.landing,
      ...payload.landing,
    };
  }

  await settings.save();
  return settings;
}

async function getAvailability(date, court) {
  if (!date || !court) {
    throw new ApiError(400, 'date and court are required');
  }

  const settings = await getAppSettings();
  const courtNumber = Number(court);
  const dateKey = toUtcDateKey(date);
  const allSlots = buildDailySlots(dateKey, courtNumber, settings.pricing, settings.operatingHours.startHour, settings.operatingHours.endHour);

  const bookingDocs = await Booking.find({
    date: dateKey,
    status: { $ne: 'cancelled' },
    slots: {
      $elemMatch: {
        date: dateKey,
        court: courtNumber,
      },
    },
  });

  const activeSubscriptions = await Subscription.find({
    court: courtNumber,
    status: 'active',
    startDate: { $lte: dateKey },
    endDate: { $gte: dateKey },
  });

  const blockedTimes = new Set();

  for (const booking of bookingDocs) {
    for (const slot of booking.slots) {
      if (slot.date === dateKey && slot.court === courtNumber) {
        blockedTimes.add(normalizeTimeRange(slot.time));
      }
    }
  }

  const weekday = isWeekday(dateKey);
  if (weekday) {
    for (const subscription of activeSubscriptions) {
      if (normalizeTimeRange(subscription.timeSlot)) {
        blockedTimes.add(normalizeTimeRange(subscription.timeSlot));
      }
    }
  }

  return allSlots.map(slot => ({
    ...slot,
    status: blockedTimes.has(normalizeTimeRange(slot.time)) ? 'booked' : 'available',
  }));
}

async function checkBookingConflicts({ slots }, session) {
  for (const slot of slots) {
    const bookingConflict = await Booking.findOne({
      status: { $ne: 'cancelled' },
      slots: {
        $elemMatch: {
          date: slot.date,
          court: slot.court,
        },
      },
    }).session(session);

    if (bookingConflict && bookingConflict.slots.some(existing => existing.date === slot.date && existing.court === slot.court && normalizeTimeRange(existing.time) === normalizeTimeRange(slot.time))) {
      throw new ApiError(409, `Slot ${slot.time} on ${slot.date} is already booked`);
    }

    const subscriptionConflict = await Subscription.findOne({
      status: 'active',
      court: slot.court,
      startDate: { $lte: slot.date },
      endDate: { $gte: slot.date },
    }).session(session);

    if (subscriptionConflict && isWeekday(slot.date) && normalizeTimeRange(subscriptionConflict.timeSlot) === normalizeTimeRange(slot.time)) {
      throw new ApiError(409, `Slot ${slot.time} on ${slot.date} is blocked by a subscription`);
    }
  }
}

async function createBookingRecord({ userId, userName, userEmail, userPhone, courtName, date, slots, totalAmount, paymentId, status = 'upcoming', idempotencyKey }, session) {
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!Array.isArray(slots) || slots.length === 0) {
    throw new ApiError(400, 'At least one slot is required');
  }

  const normalizedDate = toUtcDateKey(date);
  const normalizedSlots = slots.map((slot, index) => ({
    slotId: slot.slotId || slot.id || `${normalizedDate}-${index}`,
    time: slot.time,
    court: Number(slot.court),
    date: toUtcDateKey(slot.date || normalizedDate),
    price: Number(slot.price || 0),
    status: 'booked',
    lockedBySubscriptionId: slot.lockedBySubscriptionId || undefined,
  }));

  const courts = new Set(normalizedSlots.map(slot => slot.court));
  const dates = new Set(normalizedSlots.map(slot => slot.date));

  if (courts.size !== 1 || dates.size !== 1) {
    throw new ApiError(400, 'A booking must contain slots for a single date and court');
  }

  await checkBookingConflicts({ slots: normalizedSlots }, session);

  if (idempotencyKey) {
    const existing = await Booking.findOne({ idempotencyKey }).session(session);
    if (existing) {
      return existing;
    }
  }

  const booking = await Booking.create([
    {
      userId,
      userName,
      userEmail,
      userPhone,
      courtName,
      date: normalizedDate,
      slots: normalizedSlots,
      totalAmount,
      status,
      paymentId,
      idempotencyKey,
    },
  ], { session });

  return booking[0];
}

async function createSubscriptionRecord({ userId, userName, userEmail, userPhone, courtName, court, timeSlot, startDate, endDate, weekdaysCount, amount, paymentId, status = 'active', idempotencyKey }, session) {
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const normalizedStart = toUtcDateKey(startDate);
  const normalizedEnd = toUtcDateKey(endDate);

  if (!isWeekday(normalizedStart)) {
    throw new ApiError(400, 'Subscription start date must be a weekday');
  }

  const weekdayDates = getSubscriptionWeekdays(normalizedStart, normalizedEnd);
  const normalizedTimeSlot = normalizeTimeRange(timeSlot);

  if (!normalizedTimeSlot) {
    throw new ApiError(400, 'Invalid time slot');
  }

  const bookingConflict = await Booking.findOne({
    status: { $ne: 'cancelled' },
    slots: {
      $elemMatch: {
        court: Number(court),
      },
    },
  }).session(session);

  if (bookingConflict) {
    const conflictSlot = bookingConflict.slots.find(slot => Number(slot.court) === Number(court) && normalizeTimeRange(slot.time) === normalizedTimeSlot && weekdayDates.includes(slot.date));
    if (conflictSlot) {
      throw new ApiError(409, `Slot occupied on ${conflictSlot.date}, please choose a different slot/date range`);
    }
  }

  const overlappingSubscriptions = await Subscription.find({
    status: 'active',
    court: Number(court),
    timeSlot: normalizedTimeSlot,
    startDate: { $lte: normalizedEnd },
    endDate: { $gte: normalizedStart },
  }).session(session);

  for (const subscription of overlappingSubscriptions) {
    const overlappingDate = weekdayDates.find(date => date >= subscription.startDate && date <= subscription.endDate);
    if (overlappingDate) {
      throw new ApiError(409, `Slot occupied on ${overlappingDate}, please choose a different slot/date range`);
    }
  }

  if (idempotencyKey) {
    const existing = await Subscription.findOne({ idempotencyKey }).session(session);
    if (existing) {
      return existing;
    }
  }

  const subscription = await Subscription.create([
    {
      userId,
      userName,
      userEmail,
      userPhone,
      courtName,
      court: Number(court),
      timeSlot: normalizedTimeSlot,
      startDate: normalizedStart,
      endDate: normalizedEnd,
      weekdaysCount,
      amount,
      paymentId,
      status,
      idempotencyKey,
      lockedDates: weekdayDates,
    },
  ], { session });

  return subscription[0];
}

async function listBookings(user, filters = {}) {
  const query = {};

  if (user.role !== 'admin') {
    query.userId = user.sub;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.date) {
    query.date = toUtcDateKey(filters.date);
  }

  if (filters.court) {
    query['slots.court'] = Number(filters.court);
  }

  return Booking.find(query).sort({ createdAt: -1 });
}

async function getBookingById(user, bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (user.role !== 'admin' && String(booking.userId) !== String(user.sub)) {
    throw new ApiError(403, 'Forbidden');
  }

  return booking;
}

async function cancelBooking(user, bookingId, reason = 'Cancelled by user') {
  const booking = await getBookingById(user, bookingId);
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancelReason = reason;
  await booking.save();
  return booking;
}

async function listSubscriptions(user, filters = {}) {
  const query = {};

  if (user.role !== 'admin') {
    query.userId = user.sub;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.court) {
    query.court = Number(filters.court);
  }

  return Subscription.find(query).sort({ createdAt: -1 });
}

async function getSubscriptionById(user, subscriptionId) {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  if (user.role !== 'admin' && String(subscription.userId) !== String(user.sub)) {
    throw new ApiError(403, 'Forbidden');
  }

  return subscription;
}

async function cancelSubscription(user, subscriptionId) {
  const subscription = await getSubscriptionById(user, subscriptionId);
  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  await subscription.save();
  return subscription;
}

async function createPaymentOrder({ userId, bookingType, amount, payload, idempotencyKey }) {
  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!bookingType || !amount) {
    throw new ApiError(400, 'bookingType and amount are required');
  }

  if (idempotencyKey) {
    const existing = await PaymentOrder.findOne({ idempotencyKey });
    if (existing) {
      return existing;
    }
  }

  const providerOrderId = `PO_${crypto.randomUUID()}`;
  const order = await PaymentOrder.create({
    userId,
    bookingType,
    amount,
    providerOrderId,
    idempotencyKey,
    payload,
  });

  return order;
}

async function verifyPayment({ userId, orderId, paymentId, signature, bookingType, payload, idempotencyKey }) {
  if (!orderId || !paymentId) {
    throw new ApiError(400, 'orderId and paymentId are required');
  }

  const order = await PaymentOrder.findOne({ providerOrderId: orderId, userId });
  if (!order) {
    throw new ApiError(404, 'Payment order not found');
  }

  if (order.status === 'paid' && order.resourceId) {
    return {
      order,
      resourceType: order.resourceType,
      resourceId: order.resourceId,
    };
  }

  const session = await mongoose.startSession();
  let resource = null;

  await session.withTransaction(async () => {
    if (bookingType === 'booking') {
      resource = await createBookingRecord({
        userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        userPhone: payload.userPhone,
        courtName: payload.courtName,
        date: payload.date,
        slots: payload.slots,
        totalAmount: payload.totalAmount,
        paymentId,
        status: 'upcoming',
        idempotencyKey,
      }, session);
    } else if (bookingType === 'subscription') {
      resource = await createSubscriptionRecord({
        userId,
        userName: payload.userName,
        userEmail: payload.userEmail,
        userPhone: payload.userPhone,
        courtName: payload.courtName,
        court: payload.court,
        timeSlot: payload.timeSlot,
        startDate: payload.startDate,
        endDate: payload.endDate,
        weekdaysCount: payload.weekdaysCount,
        amount: payload.amount,
        paymentId,
        status: 'active',
        idempotencyKey,
      }, session);
    } else {
      throw new ApiError(400, 'Invalid booking type');
    }

    order.status = 'paid';
    order.providerPaymentId = paymentId;
    order.providerSignature = signature;
    order.resourceType = bookingType;
    order.resourceId = String(resource._id);
    order.payload = payload;
    await order.save({ session });
  });

  session.endSession();

  return {
    order,
    resourceType: order.resourceType,
    resourceId: order.resourceId,
    resource,
  };
}

async function expireSubscriptions() {
  const today = toUtcDateKey(new Date());
  await Subscription.updateMany(
    {
      status: 'active',
      endDate: { $lt: today },
    },
    {
      $set: { status: 'expired' },
    }
  );
}

async function getDashboardStats() {
  const [bookingCount, activeSubscriptionCount, cancelledBookingCount, revenueTotals] = await Promise.all([
    Booking.countDocuments({ status: { $ne: 'cancelled' } }),
    Subscription.countDocuments({ status: 'active' }),
    Booking.countDocuments({ status: 'cancelled' }),
    Promise.all([
      Booking.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Subscription.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]),
  ]);

  const bookingRevenue = revenueTotals[0][0]?.total || 0;
  const subscriptionRevenue = revenueTotals[1][0]?.total || 0;

  return {
    totalBookings: bookingCount,
    activeSubscriptions: activeSubscriptionCount,
    cancelledBookings: cancelledBookingCount,
    totalRevenue: bookingRevenue + subscriptionRevenue,
    bookingRevenue,
    subscriptionRevenue,
  };
}

async function getRevenueSeries(month) {
  const monthKey = month || toUtcDateKey(new Date()).slice(0, 7);
  const startDate = `${monthKey}-01`;
  const startMonth = new Date(`${startDate}T00:00:00.000Z`);
  const endMonth = new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + 1, 0));
  const endDate = toUtcDateKey(endMonth);
  const bookings = await Booking.find({
    status: { $ne: 'cancelled' },
    date: { $gte: startDate, $lte: endDate },
  });

  const subscriptions = await Subscription.find({
    status: { $ne: 'cancelled' },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  const byDate = new Map();

  for (const booking of bookings) {
    const current = byDate.get(booking.date) || { date: booking.date, revenue: 0, bookings: 0 };
    current.revenue += booking.totalAmount;
    current.bookings += 1;
    byDate.set(booking.date, current);
  }

  for (const subscription of subscriptions) {
    const current = byDate.get(subscription.startDate) || { date: subscription.startDate, revenue: 0, bookings: 0 };
    current.revenue += subscription.amount;
    byDate.set(subscription.startDate, current);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

module.exports = {
  sanitizeUser,
  issueAuthToken,
  setAuthCookie,
  clearAuthCookie,
  registerUser,
  loginUser,
  loginWithGoogle,
  getProfile,
  getAppSettings: env.useSupabase ? supabaseServices.getAppSettings : getAppSettings,
  updateAppSettings: env.useSupabase ? supabaseServices.updateAppSettings : updateAppSettings,
  getAvailability: env.useSupabase ? supabaseServices.getAvailability : getAvailability,
  createBookingRecord: env.useSupabase ? supabaseServices.createBookingRecord : createBookingRecord,
  createSubscriptionRecord: env.useSupabase ? supabaseServices.createSubscriptionRecord : createSubscriptionRecord,
  listBookings: env.useSupabase ? supabaseServices.listBookings : listBookings,
  getBookingById: env.useSupabase ? supabaseServices.getBookingById : getBookingById,
  cancelBooking: env.useSupabase ? supabaseServices.cancelBooking : cancelBooking,
  listSubscriptions: env.useSupabase ? supabaseServices.listSubscriptions : listSubscriptions,
  getSubscriptionById: env.useSupabase ? supabaseServices.getSubscriptionById : getSubscriptionById,
  cancelSubscription: env.useSupabase ? supabaseServices.cancelSubscription : cancelSubscription,
  createPaymentOrder,
  verifyPayment,
  expireSubscriptions,
  getDashboardStats: env.useSupabase ? supabaseServices.getDashboardStats : getDashboardStats,
  getRevenueSeries: env.useSupabase ? supabaseServices.getRevenueSeries : getRevenueSeries,
};
