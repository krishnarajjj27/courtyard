import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Phone, Mail, Star, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

const courtImages = [
  'https://images.unsplash.com/photo-1766675122854-28fc70f50132?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW5uaXMlMjBjb3VydCUyMG91dGRvb3IlMjBzcG9ydHN8ZW58MXx8fHwxNzc1MTE0MzcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1559369064-c4d65141e408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY291cnQlMjBpbmRvb3IlMjBhcmVuYXxlbnwxfHx8fDE3NzUxMTQzNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1758634025517-782312745372?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWRtaW50b24lMjBjb3VydCUyMGZhY2lsaXR5fGVufDF8fHx8MTc3NTExNDM3MXww&ixlib=rb-4.1.0&q=80&w=1080',
];

const reviews = [
  { name: 'Rajesh Kumar', rating: 5, comment: 'Excellent facilities and easy booking process!', date: '2026-03-25' },
  { name: 'Priya Sharma', rating: 5, comment: 'Best courts in the city. Well maintained and affordable.', date: '2026-03-20' },
  { name: 'Amit Patel', rating: 4, comment: 'Great experience. Would recommend to everyone!', date: '2026-03-18' },
];

export const UserHome = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const { appSettings } = useBooking();
  const { user } = useAuth();

  const landing = appSettings.landing as Record<string, unknown>;
  const venueName = typeof landing.venueName === 'string' ? landing.venueName : 'thecourtyard Sports Arena';
  const venueAddress = typeof landing.venueAddress === 'string'
    ? landing.venueAddress
    : '123 Sports Complex Road, Sector 21, Bangalore, Karnataka 560001';
  const venuePhone = typeof landing.venuePhone === 'string' ? landing.venuePhone : '+91 98765 43210';
  const venueEmail = typeof landing.venueEmail === 'string' ? landing.venueEmail : 'info@courtyard.com';
  const venueHours = typeof landing.venueOperatingHoursText === 'string'
    ? landing.venueOperatingHoursText
    : '5:00 AM - 11:00 PM (All Days)';
  const ratingValue = typeof landing.venueRating === 'number' ? landing.venueRating : 4.7;
  const availableCourts = appSettings.courts.length;
  const priceRange = `₹${appSettings.pricing.offPeak} - ₹${appSettings.pricing.peak}/hr`;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % courtImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + courtImages.length) % courtImages.length);
  };

  const handleSubmitFeedback = () => {
    if (feedback.trim() && rating > 0) {
      alert('Thank you for your feedback!');
      setFeedback('');
      setRating(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section with Carousel */}
        <GlassCard className="mb-8 overflow-hidden">
          <div className="relative h-[400px] md:h-[500px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={courtImages[currentImage]}
                alt="Court"
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>

            {/* Carousel Controls */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {courtImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImage ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
              <h1 className="text-4xl font-bold text-white mb-2">{venueName}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2">{ratingValue} (127 ratings)</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Court Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Location & Contact */}
            <GlassCard className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Court Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#10b981] mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Location</p>
                    <p className="text-gray-600 whitespace-pre-line">{venueAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#10b981] mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Contact Number</p>
                    <p className="text-gray-600">{venuePhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#10b981] mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Email</p>
                    <p className="text-gray-600">{venueEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#10b981] mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Operating Hours</p>
                    <p className="text-gray-600">{venueHours}</p>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="mt-6 h-48 bg-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.1!2d77.5!3d12.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU0JzAwLjAiTiA3N8KwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Court Location"
                ></iframe>
              </div>
            </GlassCard>

            {/* Reviews Section */}
            <GlassCard className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">{review.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Booking & Feedback Sidebar */}
          <div className="space-y-6">
            {/* Book Now Card */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Ready to Play?</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Available Courts</span>
                  <span className="font-semibold text-gray-800">{availableCourts} Courts</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Price Range</span>
                  <span className="font-semibold text-gray-800">{priceRange}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Time Slots</span>
                  <span className="font-semibold text-gray-800">1 Hour</span>
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={() => navigate('/user/booking')}
              >
                Book Now
              </Button>
            </GlassCard>

            {/* Feedback Card */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Share Your Feedback</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all min-h-[100px]"
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim() || rating === 0}
              >
                Submit Feedback
              </Button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};