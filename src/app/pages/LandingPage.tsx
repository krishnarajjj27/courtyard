import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Calendar, CreditCard, Clock, Shield, CheckCircle, ArrowRight, Zap, Users, Award, Star } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { useLandingPage } from '../context/LandingPageContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const iconMap: Record<string, any> = {
  Calendar,
  CreditCard,
  Clock,
  Shield,
  Zap,
  Users,
  Award,
  Star,
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const { content } = useLandingPage();

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Calendar;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-cyan-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-emerald-200 mb-6">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Fast & Easy Booking</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                {content.heroTitle.split(' ').map((word, index) => (
                  <span key={index}>
                    {index === content.heroTitle.split(' ').length - 2 ? (
                      <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        {word}{' '}
                      </span>
                    ) : (
                      `${word} `
                    )}
                  </span>
                ))}
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                {content.heroDescription}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate('/user/booking')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
                >
                  {content.heroCTA}
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/user/register')}
                  className="px-8 py-4 bg-white/60 backdrop-blur-sm border-2 border-emerald-200 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  {content.heroSecondaryButton}
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                {content.stats.slice(0, 3).map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        {stat.value}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-400 rounded-2xl opacity-50 blur-lg"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400 rounded-2xl opacity-50 blur-lg"></div>

                {/* Main Image Card */}
                <GlassCard className="p-4 hover:shadow-2xl transition-shadow duration-500">
                  <div className="rounded-2xl overflow-hidden">
                    <ImageWithFallback
                      src={content.heroImage}
                      alt="Sports Court"
                      className="w-full h-64 md:h-96 object-cover"
                    />
                  </div>

                  {/* Floating Badge */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-6 py-3 shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-gray-800">Instant Booking</span>
                    </div>
                  </motion.div>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make court booking effortless
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.features.map((feature, index) => {
              const IconComponent = getIcon(feature.icon);
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <GlassCard className="p-4 hover:shadow-2xl transition-shadow duration-500">
                <div className="rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src={content.aboutImage}
                    alt="About thecourtyard"
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {content.aboutTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {content.aboutDescription}
              </p>

              <div className="space-y-4">
                {[
                  'Professional-grade court surfaces',
                  'Modern lighting and facilities',
                  'Easy online booking system',
                  'Flexible payment options',
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/user/booking')}
                className="mt-8 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
              >
                Start Booking Now
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {content.stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-emerald-100 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {content.gallery && content.gallery.length > 0 && (
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {content.galleryTitle}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {content.gallerySubtitle}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.gallery.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 hover:shadow-2xl transition-all duration-300 group overflow-hidden">
                    <div className="relative rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={image.url}
                        alt={image.caption}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white font-semibold">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 md:p-12 text-center bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-200">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Book Your Court?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join hundreds of players who trust thecourtyard for their sports needs
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => navigate('/user/booking')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
                >
                  Book Your First Court
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/user/subscription')}
                  className="px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 hover:shadow-lg transition-all duration-300 font-semibold text-lg"
                >
                  View Subscriptions
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            thecourtyard
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 thecourtyard. All rights reserved. Your game, your schedule, your way.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};