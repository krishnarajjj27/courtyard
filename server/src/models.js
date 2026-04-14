const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    googleId: { type: String, unique: true, sparse: true, index: true },
    oauthProviders: [{ type: String }],
  },
  { timestamps: true }
);

const BookingSlotSchema = new mongoose.Schema(
  {
    slotId: { type: String, required: true },
    time: { type: String, required: true },
    court: { type: Number, required: true },
    date: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'booked', 'selected'], default: 'booked' },
    lockedBySubscriptionId: { type: String },
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courtName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    slots: { type: [BookingSlotSchema], default: [] },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming', index: true },
    paymentId: { type: String, index: true },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    userName: { type: String },
    userEmail: { type: String },
    userPhone: { type: String },
  },
  { timestamps: true }
);

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courtName: { type: String, required: true },
    court: { type: Number, required: true, index: true },
    timeSlot: { type: String, required: true },
    startDate: { type: String, required: true, index: true },
    endDate: { type: String, required: true, index: true },
    weekdaysCount: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active', index: true },
    paymentId: { type: String, index: true },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
    lockedDates: [{ type: String }],
    cancelledAt: { type: Date },
    userName: { type: String },
    userEmail: { type: String },
    userPhone: { type: String },
  },
  { timestamps: true }
);

const PaymentOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingType: { type: String, enum: ['booking', 'subscription'], required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created', index: true },
    providerOrderId: { type: String, required: true, unique: true, index: true },
    providerPaymentId: { type: String },
    providerSignature: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
    resourceId: { type: String },
    resourceType: { type: String, enum: ['booking', 'subscription'] },
    payload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true, index: true },
    pricing: {
      offPeak: { type: Number, default: 500 },
      peak: { type: Number, default: 800 },
      subscription: { type: Number, default: 2500 },
    },
    courts: {
      type: [String],
      default: ['Court 1', 'Court 2', 'Court 3'],
    },
    operatingHours: {
      startHour: { type: Number, default: 5 },
      endHour: { type: Number, default: 22 },
    },
    landing: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
const Booking = mongoose.model('Booking', BookingSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const PaymentOrder = mongoose.model('PaymentOrder', PaymentOrderSchema);
const Settings = mongoose.model('Settings', SettingsSchema);

async function ensureDefaultSettings() {
  const existing = await Settings.findOne({ key: 'default' });

  if (existing) {
    return existing;
  }

  return Settings.create({ key: 'default' });
}

module.exports = {
  User,
  Booking,
  Subscription,
  PaymentOrder,
  Settings,
  ensureDefaultSettings,
};
