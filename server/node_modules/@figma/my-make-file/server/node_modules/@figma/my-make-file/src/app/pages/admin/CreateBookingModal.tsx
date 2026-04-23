import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
}

export const CreateBookingModal = ({ isOpen, onClose, onCreate }: CreateBookingModalProps) => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    court: 'Court 1',
    date: '',
    timeSlots: [] as string[],
    paymentMethod: 'cash',
  });

  const timeSlots = [
    '5:00 AM', '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  const handleTimeSlotToggle = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName || !formData.userPhone || !formData.date || formData.timeSlots.length === 0) {
      alert('Please fill all required fields and select at least one time slot');
      return;
    }

    // Calculate amount (mock pricing)
    const slotPrice = 500;
    const subtotal = formData.timeSlots.length * slotPrice;
    const totalAmount = subtotal;

    onCreate({
      ...formData,
      totalAmount,
      paymentId: formData.paymentMethod === 'cash' ? 'CASH-' + Date.now() : 'CARD-' + Date.now(),
    });
    
    // Reset form
    setFormData({
      userName: '',
      userEmail: '',
      userPhone: '',
      court: 'Court 1',
      date: '',
      timeSlots: [],
      paymentMethod: 'cash',
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-gray-800">Create Onsite Booking</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Details */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Customer Details</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.userPhone}
                  onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <Input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Booking Details</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                  required
                >
                  <option value="Court 1">Court 1</option>
                  <option value="Court 2">Court 2</option>
                  <option value="Court 3">Court 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Time Slots <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleTimeSlotToggle(slot)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    formData.timeSlots.includes(slot)
                      ? 'bg-[#10b981] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Selected: {formData.timeSlots.length} slot(s)
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-4 h-4 text-[#10b981] focus:ring-[#10b981]"
                />
                <span className="text-sm font-medium text-gray-700">Cash</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-4 h-4 text-[#10b981] focus:ring-[#10b981]"
                />
                <span className="text-sm font-medium text-gray-700">Card/UPI</span>
              </label>
            </div>
          </div>

          {/* Summary */}
          {formData.timeSlots.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Slots ({formData.timeSlots.length})</span>
                  <span className="font-medium">₹{formData.timeSlots.length * 500}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-bold text-[#10b981]">
                    ₹{formData.timeSlots.length * 500}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
