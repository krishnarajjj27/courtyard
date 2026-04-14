import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Navbar } from '../../components/Navbar';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { showSuccessToast, showPromiseToast } from '../../utils/notificationHelpers';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const { selectedSlots, createBooking, appSettings } = useBooking();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [processing, setProcessing] = useState(false);

  // Use useEffect to handle navigation during render
  useEffect(() => {
    if (selectedSlots.length === 0) {
      navigate('/user/booking');
    }
  }, [selectedSlots.length, navigate]);

  // Return early if no slots to prevent rendering with empty data
  if (selectedSlots.length === 0) {
    return null;
  }

  const subtotal = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  const total = subtotal;
  const venueName = typeof appSettings.landing?.venueName === 'string'
    ? appSettings.landing.venueName
    : 'thecourtyard Sports Arena';

  const handlePayment = async () => {
    setProcessing(true);
    
    // Mock Razorpay payment processing
    const paymentPromise = new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await showPromiseToast(paymentPromise, {
        loading: 'Processing Payment...',
        success: 'Payment Successful!',
        error: 'Payment Failed',
      });

      const booking = await createBooking({
        courtName: venueName,
        date: selectedSlots[0].date,
        slots: selectedSlots,
        totalAmount: total,
        status: 'upcoming',
        paymentId: `PAY${Date.now()}`,
        userName: user?.name,
        userEmail: user?.email,
        userPhone: user?.phone,
      });
      
      // Add in-app notification
      addNotification({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Your court booking for ${format(new Date(selectedSlots[0].date), 'MMM d, yyyy')} has been confirmed. Booking ID: ${booking.id}`,
        action: {
          label: 'View Booking',
          onClick: () => navigate('/user/history'),
        },
      });
      
      navigate('/user/booking-confirmation');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Booking Failed';
      addNotification({
        type: 'error',
        title: 'Booking Not Available',
        message,
      });
      alert(message);
      navigate('/user/booking');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <button
          onClick={() => navigate('/user/booking')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 md:mb-6 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          Back to Booking
        </button>

        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Payment</h1>
          <p className="text-sm md:text-base text-gray-600">Complete your booking payment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Booking Summary */}
          <GlassCard className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Booking Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs md:text-sm text-gray-600">Court</p>
                <p className="font-medium text-sm md:text-base">{venueName}</p>
              </div>
              
              <div>
                <p className="text-xs md:text-sm text-gray-600">Selected Slots</p>
                <div className="mt-2 space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                  {selectedSlots.map((slot) => (
                    <div key={slot.id} className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded-lg">
                      <div>
                        <p className="font-medium text-xs md:text-sm">Court {slot.court} - {slot.time}</p>
                        <p className="text-[10px] md:text-xs text-gray-600">{format(new Date(slot.date), 'MMM d, yyyy')}</p>
                      </div>
                      <p className="font-semibold text-sm md:text-base">₹{slot.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 md:space-y-3">
              <div className="flex justify-between text-xs md:text-base text-gray-700">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-lg md:text-2xl font-bold text-gray-800 pt-3 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-[#10b981]">₹{total}</span>
              </div>
            </div>
          </GlassCard>

          {/* Payment Method - Mock Razorpay */}
          <GlassCard className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold">Payment Method</h2>
                <p className="text-xs md:text-sm text-gray-600">Secured by Razorpay</p>
              </div>
            </div>

            {/* Mock Razorpay UI */}
            <div className="space-y-4 mb-6">
              <div className="p-3 md:p-4 border-2 border-blue-500 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm md:text-base">Razorpay Payment Gateway</span>
                  <Lock className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-4">
                  You will be redirected to Razorpay's secure payment gateway
                </p>
                
                <div className="flex gap-2">
                  <div className="w-10 h-7 md:w-12 md:h-8 bg-white rounded shadow-sm flex items-center justify-center">
                    <span className="text-[10px] md:text-xs font-bold text-blue-600">VISA</span>
                  </div>
                  <div className="w-10 h-7 md:w-12 md:h-8 bg-white rounded shadow-sm flex items-center justify-center">
                    <span className="text-[10px] md:text-xs font-bold text-red-600">MC</span>
                  </div>
                  <div className="w-10 h-7 md:w-12 md:h-8 bg-white rounded shadow-sm flex items-center justify-center">
                    <span className="text-[10px] md:text-xs font-bold text-purple-600">UPI</span>
                  </div>
                  <div className="w-10 h-7 md:w-12 md:h-8 bg-white rounded shadow-sm flex items-center justify-center">
                    <span className="text-[10px] md:text-xs font-bold text-gray-600">NET</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full text-sm md:text-base"
                onClick={handlePayment}
                loading={processing}
                disabled={processing}
              >
                {processing ? 'Processing Payment...' : `Pay ₹${total}`}
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
                <Lock className="w-3 h-3 md:w-4 md:h-4" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
              <p className="text-[10px] md:text-xs text-gray-500 text-center">
                100% Secure Payment | Instant Confirmation | Easy Refunds
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};