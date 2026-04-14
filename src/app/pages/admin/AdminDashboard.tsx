import { Users, Calendar, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { GlassCard } from '../../components/GlassCard';
import { useBooking } from '../../context/BookingContext';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { BookingStatusChart } from '../../components/charts/BookingStatusChart';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export const AdminDashboard = () => {
  const { bookings } = useBooking();
  const navigate = useNavigate();
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const stats = [
    {
      label: 'Total Bookings',
      value: '156',
      change: '+12%',
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Revenue (This Month)',
      value: '₹61,000',
      change: '+18%',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Active Users',
      value: '89',
      change: '+5%',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Avg. Utilization',
      value: '73%',
      change: '+8%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming').slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Overview of your sports facility</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <GlassCard key={index} className="p-4 md:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <span className="text-xs md:text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">{stat.label}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</p>
            </GlassCard>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Revenue Chart */}
          <GlassCard className="p-4 md:p-6 lg:col-span-2">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Revenue Overview</h2>
            <RevenueChart />
          </GlassCard>

          {/* Booking Status Pie Chart */}
          <GlassCard className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Booking Status</h2>
            <BookingStatusChart />
          </GlassCard>

          {/* Upcoming Bookings */}
          <GlassCard className="p-4 md:p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold">Upcoming Bookings</h2>
              <button className="text-xs md:text-sm text-[#10b981] hover:text-[#059669] font-medium">
                View All
              </button>
            </div>
            <div className="space-y-2 md:space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm md:text-base truncate">{booking.id}</p>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{booking.date} • {booking.slots.length} slots</p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#10b981] text-sm md:text-base ml-2 flex-shrink-0">₹{booking.totalAmount}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Quick Actions</h2>
            <div className="space-y-2 md:space-y-3">
              <button 
                onClick={() => navigate('/admin/bookings')}
                className="w-full p-3 md:p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center md:justify-start gap-3 text-sm md:text-base"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                <span>View All Bookings</span>
              </button>
              <button 
                onClick={() => setShowRevenueModal(true)}
                className="w-full p-3 md:p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center md:justify-start gap-3 text-sm md:text-base"
              >
                <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                <span>Revenue Report</span>
              </button>
              <button 
                onClick={() => setShowUserModal(true)}
                className="w-full p-3 md:p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center md:justify-start gap-3 text-sm md:text-base"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5" />
                <span>User Management</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Revenue Report Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Revenue Report</h2>
                <p className="text-gray-600 text-sm mt-1">Detailed financial analysis</p>
              </div>
              <button
                onClick={() => setShowRevenueModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <p className="text-green-600 text-sm font-medium mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-800">₹61,000</p>
                  <p className="text-xs text-green-600 mt-2">↑ 18% from last month</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-blue-600 text-sm font-medium mb-2">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-800">156</p>
                  <p className="text-xs text-blue-600 mt-2">↑ 12% from last month</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                  <p className="text-purple-600 text-sm font-medium mb-2">Avg. Booking Value</p>
                  <p className="text-3xl font-bold text-gray-800">₹391</p>
                  <p className="text-xs text-purple-600 mt-2">↑ 5% from last month</p>
                </div>
              </div>

              {/* Revenue Breakdown */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Court Bookings', amount: 45000, percentage: 73.8, color: 'bg-blue-500' },
                    { label: 'Subscriptions', amount: 12000, percentage: 19.7, color: 'bg-green-500' },
                    { label: 'Tournaments', amount: 4000, percentage: 6.5, color: 'bg-purple-500' },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-sm font-semibold text-gray-800">₹{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Comparison */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Comparison</h3>
                <div className="space-y-2">
                  {[
                    { month: 'January 2026', revenue: 48000 },
                    { month: 'February 2026', revenue: 52000 },
                    { month: 'March 2026', revenue: 51700 },
                    { month: 'April 2026', revenue: 61000 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{item.month}</span>
                      <span className="text-sm font-semibold text-green-600">₹{item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <p className="text-gray-600 text-sm mt-1">Manage registered users</p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-blue-600 text-sm font-medium mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">89</p>
                  <p className="text-xs text-blue-600 mt-2">↑ 5% this month</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <p className="text-green-600 text-sm font-medium mb-2">Active Users</p>
                  <p className="text-3xl font-bold text-gray-800">72</p>
                  <p className="text-xs text-green-600 mt-2">81% of total</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                  <p className="text-purple-600 text-sm font-medium mb-2">Subscribers</p>
                  <p className="text-3xl font-bold text-gray-800">24</p>
                  <p className="text-xs text-purple-600 mt-2">27% of total</p>
                </div>
              </div>

              {/* User List */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
                <div className="space-y-2">
                  {[
                    { name: 'John Doe', email: 'john.doe@example.com', status: 'Active', bookings: 12, joined: 'Jan 2026' },
                    { name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Active', bookings: 8, joined: 'Feb 2026' },
                    { name: 'Mike Johnson', email: 'mike.j@example.com', status: 'Subscriber', bookings: 24, joined: 'Dec 2025' },
                    { name: 'Sarah Williams', email: 'sarah.w@example.com', status: 'Active', bookings: 6, joined: 'Mar 2026' },
                    { name: 'Tom Brown', email: 'tom.brown@example.com', status: 'Inactive', bookings: 2, joined: 'Nov 2025' },
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-gray-500">Bookings</p>
                          <p className="font-semibold text-gray-800">{user.bookings}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' :
                          user.status === 'Subscriber' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-700 transition-all font-medium">
                  Export Users
                </button>
                <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};