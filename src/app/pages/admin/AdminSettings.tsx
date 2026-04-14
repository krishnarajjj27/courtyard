import { useEffect, useState } from 'react';
import { DollarSign, Save, Image, MapPin, Phone, Mail, Star, Clock, Layout, Plus, Trash2, Eye, Settings as SettingsIcon, Palette } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useLandingPage } from '../../context/LandingPageContext';
import { useBooking } from '../../context/BookingContext';
import { Calendar, CreditCard, Shield, Zap, Users, Award } from 'lucide-react';
import { showSuccessToast } from '../../utils/notificationHelpers';

const iconOptions = [
  { value: 'Calendar', label: 'Calendar', Icon: Calendar },
  { value: 'CreditCard', label: 'Credit Card', Icon: CreditCard },
  { value: 'Clock', label: 'Clock', Icon: Clock },
  { value: 'Shield', label: 'Shield', Icon: Shield },
  { value: 'Zap', label: 'Zap', Icon: Zap },
  { value: 'Users', label: 'Users', Icon: Users },
  { value: 'Award', label: 'Award', Icon: Award },
  { value: 'Star', label: 'Star', Icon: Star },
];

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'landing'>('general');
  const { content, updateContent } = useLandingPage();
  const { appSettings, refreshAppSettings, updateAppSettings } = useBooking();
  const [landingFormData, setLandingFormData] = useState(content);
  const [showPreview, setShowPreview] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [pricingDirty, setPricingDirty] = useState(false);

  const [pricing, setPricing] = useState({
    weekdayPrice: '500',
    weekendPrice: '800',
    monthlySubscription: '2500',
  });

  const [courtDetails, setCourtDetails] = useState({
    name: 'thecourtyard Sports Arena',
    address: '123 Sports Complex Road, Sector 21, Bangalore, Karnataka 560001',
    phone: '+91 98765 43210',
    email: 'info@thecourtyard.com',
    operatingHours: '5:00 AM - 11:00 PM',
    rating: 4.7,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pricingDirty) {
      return;
    }

    setPricing({
      weekdayPrice: String(appSettings.pricing.offPeak),
      weekendPrice: String(appSettings.pricing.peak),
      monthlySubscription: String(appSettings.pricing.subscription),
    });

    setCourtDetails(prev => ({
      ...prev,
      name: typeof appSettings.landing?.venueName === 'string' ? appSettings.landing.venueName : prev.name,
      address: typeof appSettings.landing?.venueAddress === 'string' ? appSettings.landing.venueAddress : prev.address,
      phone: typeof appSettings.landing?.venuePhone === 'string' ? appSettings.landing.venuePhone : prev.phone,
      email: typeof appSettings.landing?.venueEmail === 'string' ? appSettings.landing.venueEmail : prev.email,
      operatingHours: typeof appSettings.landing?.venueOperatingHoursText === 'string'
        ? appSettings.landing.venueOperatingHoursText
        : prev.operatingHours,
      rating: typeof appSettings.landing?.venueRating === 'number' ? appSettings.landing.venueRating : prev.rating,
    }));
  }, [appSettings, pricingDirty]);

  useEffect(() => {
    void refreshAppSettings();
  }, []);

  const handlePricingChange = (field: 'weekdayPrice' | 'weekendPrice' | 'monthlySubscription', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setPricingDirty(true);
      setPricing(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSavePricing = async () => {
    try {
      const offPeak = Number(pricing.weekdayPrice);
      const peak = Number(pricing.weekendPrice);
      const subscription = Number(pricing.monthlySubscription);

      if (!offPeak || !peak || !subscription) {
        alert('Please enter valid prices before saving.');
        return;
      }

      setSavingPricing(true);
      await updateAppSettings({
        pricing: {
          offPeak,
          peak,
          subscription,
        },
      });

      setPricing({
        weekdayPrice: String(offPeak),
        weekendPrice: String(peak),
        monthlySubscription: String(subscription),
      });
      setPricingDirty(false);

      setSaved(true);
      showSuccessToast('Pricing updated successfully!');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save pricing');
    } finally {
      setSavingPricing(false);
    }
  };

  const handleSaveDetails = async () => {
    try {
      setSavingDetails(true);
      await updateAppSettings({
        landing: {
          venueName: courtDetails.name,
          venueAddress: courtDetails.address,
          venuePhone: courtDetails.phone,
          venueEmail: courtDetails.email,
          venueOperatingHoursText: courtDetails.operatingHours,
          venueRating: courtDetails.rating,
        },
      });

      setSaved(true);
      showSuccessToast('Court details updated successfully!');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save court details');
    } finally {
      setSavingDetails(false);
    }
  };

  // Landing page handlers
  const handleInputChange = (field: string, value: string) => {
    setLandingFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const newFeatures = [...landingFormData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setLandingFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const handleStatChange = (index: number, field: string, value: string) => {
    const newStats = [...landingFormData.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setLandingFormData((prev) => ({ ...prev, stats: newStats }));
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      icon: 'Calendar',
      title: 'New Feature',
      description: 'Feature description',
    };
    setLandingFormData((prev) => ({ ...prev, features: [...prev.features, newFeature] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = landingFormData.features.filter((_, i) => i !== index);
    setLandingFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addStat = () => {
    const newStat = {
      id: Date.now().toString(),
      value: '0',
      label: 'New Stat',
    };
    setLandingFormData((prev) => ({ ...prev, stats: [...prev.stats, newStat] }));
  };

  const removeStat = (index: number) => {
    const newStats = landingFormData.stats.filter((_, i) => i !== index);
    setLandingFormData((prev) => ({ ...prev, stats: newStats }));
  };

  const handleSaveLanding = () => {
    updateContent(landingFormData);
    showSuccessToast('Landing page updated successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: SettingsIcon },
    { id: 'landing', label: 'Landing Page', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your court booking system</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'general' | 'landing')}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pricing Settings */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Pricing Configuration</h2>
                  <p className="text-sm text-gray-600">Set pricing for different time slots</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekday Price (Per Hour)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={pricing.weekdayPrice}
                      onChange={(e) => handlePricingChange('weekdayPrice', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Monday to Friday (5 AM - 5 PM)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekend Price (Per Hour)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={pricing.weekendPrice}
                      onChange={(e) => handlePricingChange('weekendPrice', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Saturday and Sunday (All day)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Subscription
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={pricing.monthlySubscription}
                      onChange={(e) => handlePricingChange('monthlySubscription', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Monthly subscription for regular users</p>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSavePricing}
                  loading={savingPricing}
                >
                  <Save className="w-5 h-5" />
                  {saved ? 'Saved!' : 'Save Pricing'}
                </Button>
              </div>
            </GlassCard>

            {/* Court Details */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Court Information</h2>
                  <p className="text-sm text-gray-600">Update court details</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Court Name"
                  value={courtDetails.name}
                  onChange={(e) => setCourtDetails({ ...courtDetails, name: e.target.value })}
                  icon={<Star className="w-5 h-5" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={courtDetails.address}
                    onChange={(e) => setCourtDetails({ ...courtDetails, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent min-h-[80px]"
                  />
                </div>

                <Input
                  label="Contact Phone"
                  value={courtDetails.phone}
                  onChange={(e) => setCourtDetails({ ...courtDetails, phone: e.target.value })}
                  icon={<Phone className="w-5 h-5" />}
                />

                <Input
                  label="Email"
                  type="email"
                  value={courtDetails.email}
                  onChange={(e) => setCourtDetails({ ...courtDetails, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                />

                <Input
                  label="Operating Hours"
                  value={courtDetails.operatingHours}
                  onChange={(e) => setCourtDetails({ ...courtDetails, operatingHours: e.target.value })}
                  icon={<Clock className="w-5 h-5" />}
                />

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSaveDetails}
                  loading={savingDetails}
                >
                  <Save className="w-5 h-5" />
                  {saved ? 'Saved!' : 'Save Details'}
                </Button>
              </div>
            </GlassCard>

            {/* Court Images Management */}
            <GlassCard className="p-6 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Court Images</h2>
                  <p className="text-sm text-gray-600">Manage court photos displayed on homepage</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-1766675122854-28fc70f50132?w=400&h=300&fit=crop`}
                        alt={`Court ${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">Edit</Button>
                      <Button size="sm" variant="danger">Delete</Button>
                    </div>
                  </div>
                ))}
                
                {/* Add New Image */}
                <button className="aspect-video bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#10b981] hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-2">
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Add Image</span>
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Landing Page Tab */}
        {activeTab === 'landing' && (
          <div className="space-y-6">
            {/* Header with Save Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Landing Page Editor</h2>
                <p className="text-gray-600">Customize the content shown to visitors</p>
              </div>
              <Button
                onClick={handleSaveLanding}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Hero Section */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-emerald-600" />
                  Hero Section
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                    <input
                      type="text"
                      value={landingFormData.heroTitle}
                      onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                    <input
                      type="text"
                      value={landingFormData.heroSubtitle}
                      onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                    <textarea
                      value={landingFormData.heroDescription}
                      onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </GlassCard>

              {/* Features Section */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-emerald-600" />
                    Features
                  </h3>
                  <Button size="sm" onClick={addFeature} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {landingFormData.features.map((feature, index) => (
                    <div key={feature.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <select
                          value={feature.icon}
                          onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                          className="text-sm px-3 py-1 border border-gray-300 rounded-lg"
                        >
                          {iconOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                        placeholder="Feature Title"
                        className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 rounded-lg"
                      />
                      <textarea
                        value={feature.description}
                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                        placeholder="Feature Description"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Stats Section */}
              <GlassCard className="p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    Statistics
                  </h3>
                  <Button size="sm" onClick={addStat} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  {landingFormData.stats.map((stat, index) => (
                    <div key={stat.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => removeStat(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                        placeholder="1000+"
                        className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 rounded-lg font-bold text-center"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                        placeholder="Stat Label"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-center"
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
