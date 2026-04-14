const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  asyncHandler,
  requireAuth,
  requireRole,
  ApiError,
} = require('./middleware');
const {
  registerUser,
  loginUser,
  loginWithGoogle,
  getProfile,
  getAppSettings,
  updateAppSettings,
  getAvailability,
  createBookingRecord,
  createSubscriptionRecord,
  listBookings,
  getBookingById,
  cancelBooking,
  listSubscriptions,
  getSubscriptionById,
  cancelSubscription,
  createPaymentOrder,
  verifyPayment,
  getDashboardStats,
  getRevenueSeries,
  setAuthCookie,
  clearAuthCookie,
} = require('./services');

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

function buildResponseUser(user) {
  return user;
}

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tcy-backend',
    message: 'API is running',
    health: '/api/health',
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tcy-backend' });
});

router.post('/auth/register', authLimiter, asyncHandler(async (req, res) => {
  const { user, token } = await registerUser(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user: buildResponseUser(user), token });
}));

router.post('/auth/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password, role = 'user' } = req.body;
  const { user, token } = await loginUser({ email, password, role });
  setAuthCookie(res, token);
  res.json({ user: buildResponseUser(user), token });
}));

router.post('/auth/google', authLimiter, asyncHandler(async (req, res) => {
  const { idToken, role = 'user' } = req.body;
  const { user, token } = await loginWithGoogle({ idToken, role });
  setAuthCookie(res, token);
  res.json({ user: buildResponseUser(user), token });
}));

router.post('/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

router.get('/auth/profile', requireAuth, asyncHandler(async (req, res) => {
  const user = await getProfile(req.auth.sub);
  res.json({ user });
}));

router.get('/availability', asyncHandler(async (req, res) => {
  const { date, court } = req.query;
  const slots = await getAvailability(date, court);
  res.json({ date, court: Number(court), slots });
}));

router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await getAppSettings();
  res.json(settings);
}));

router.get('/bookings', requireAuth, asyncHandler(async (req, res) => {
  const bookings = await listBookings(req.auth, req.query);
  res.json({ bookings });
}));

router.post('/bookings', requireAuth, asyncHandler(async (req, res) => {
  const booking = await createBookingRecord({
    userId: req.auth.sub,
    userName: req.body.userName || req.auth.name,
    userEmail: req.body.userEmail || req.auth.email,
    userPhone: req.body.userPhone,
    courtName: req.body.courtName,
    date: req.body.date,
    slots: req.body.slots,
    totalAmount: req.body.totalAmount,
    paymentId: req.body.paymentId,
    status: req.body.status,
    idempotencyKey: req.body.idempotencyKey,
  });

  res.status(201).json({ booking });
}));

router.get('/bookings/:id', requireAuth, asyncHandler(async (req, res) => {
  const booking = await getBookingById(req.auth, req.params.id);
  res.json({ booking });
}));

router.delete('/bookings/:id', requireAuth, asyncHandler(async (req, res) => {
  const booking = await cancelBooking(req.auth, req.params.id, req.body?.reason || 'Cancelled by user');
  res.json({ booking });
}));

router.get('/subscriptions', requireAuth, asyncHandler(async (req, res) => {
  const subscriptions = await listSubscriptions(req.auth, req.query);
  res.json({ subscriptions });
}));

router.post('/subscriptions', requireAuth, asyncHandler(async (req, res) => {
  const subscription = await createSubscriptionRecord({
    userId: req.auth.sub,
    userName: req.body.userName || req.auth.name,
    userEmail: req.body.userEmail || req.auth.email,
    userPhone: req.body.userPhone,
    courtName: req.body.courtName,
    court: req.body.court,
    timeSlot: req.body.timeSlot,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    weekdaysCount: req.body.weekdaysCount,
    amount: req.body.amount,
    paymentId: req.body.paymentId,
    status: req.body.status,
    idempotencyKey: req.body.idempotencyKey,
  });

  res.status(201).json({ subscription });
}));

router.delete('/subscriptions/:id', requireAuth, asyncHandler(async (req, res) => {
  const subscription = await cancelSubscription(req.auth, req.params.id);
  res.json({ subscription });
}));

router.post('/payments/create-order', requireAuth, asyncHandler(async (req, res) => {
  const order = await createPaymentOrder({
    userId: req.auth.sub,
    bookingType: req.body.bookingType,
    amount: req.body.amount,
    payload: req.body.payload,
    idempotencyKey: req.body.idempotencyKey,
  });

  res.status(201).json({
    orderId: order.providerOrderId,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID || null,
  });
}));

router.post('/payments/verify', requireAuth, authLimiter, asyncHandler(async (req, res) => {
  const result = await verifyPayment({
    userId: req.auth.sub,
    orderId: req.body.orderId,
    paymentId: req.body.paymentId,
    signature: req.body.signature,
    bookingType: req.body.bookingType,
    payload: req.body.payload,
    idempotencyKey: req.body.idempotencyKey,
  });

  res.json({
    verified: true,
    resourceType: result.resourceType,
    resourceId: result.resourceId,
  });
}));

router.get('/admin/dashboard/stats', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  res.json(stats);
}));

router.get('/admin/dashboard/revenue', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const series = await getRevenueSeries(req.query.month);
  res.json({ data: series });
}));

router.get('/admin/settings', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const settings = await getAppSettings();
  res.json(settings);
}));

router.put('/admin/settings', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const settings = await updateAppSettings(req.body);
  res.json(settings);
}));

router.get('/admin/bookings', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const bookings = await listBookings({ role: 'admin', sub: req.auth.sub }, req.query);
  res.json({ bookings });
}));

router.post('/admin/bookings', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const booking = await createBookingRecord({
    userId: req.body.userId || req.auth.sub,
    userName: req.body.userName,
    userEmail: req.body.userEmail,
    userPhone: req.body.userPhone,
    courtName: req.body.courtName,
    date: req.body.date,
    slots: req.body.slots,
    totalAmount: req.body.totalAmount,
    paymentId: req.body.paymentId,
    status: req.body.status || 'upcoming',
    idempotencyKey: req.body.idempotencyKey,
  });

  res.status(201).json({ booking });
}));

router.delete('/admin/bookings/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const booking = await cancelBooking({ role: 'admin', sub: req.auth.sub }, req.params.id, req.body?.reason || 'Cancelled by admin');
  res.json({ booking });
}));

router.get('/admin/subscriptions', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const subscriptions = await listSubscriptions({ role: 'admin', sub: req.auth.sub }, req.query);
  res.json({ subscriptions });
}));

router.post('/admin/subscriptions', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const subscription = await createSubscriptionRecord({
    userId: req.body.userId || req.auth.sub,
    userName: req.body.userName,
    userEmail: req.body.userEmail,
    userPhone: req.body.userPhone,
    courtName: req.body.courtName,
    court: req.body.court,
    timeSlot: req.body.timeSlot,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    weekdaysCount: req.body.weekdaysCount,
    amount: req.body.amount,
    paymentId: req.body.paymentId,
    status: req.body.status || 'active',
    idempotencyKey: req.body.idempotencyKey,
  });

  res.status(201).json({ subscription });
}));

router.delete('/admin/subscriptions/:id', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const subscription = await cancelSubscription({ role: 'admin', sub: req.auth.sub }, req.params.id);
  res.json({ subscription });
}));

router.post('/admin/auth/seed', requireAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  throw new ApiError(501, 'Admin seeding is not exposed through the API');
}));

module.exports = router;
