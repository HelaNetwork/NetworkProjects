import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, Edit2 } from 'lucide-react';
import { useState } from 'react';

export function PersonalSetup() {
  const [isEditing, setIsEditing] = useState(false);
  const [conversionRate, setConversionRate] = useState(1.0);
  
  const userDetails = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India',
    position: 'Senior Software Engineer',
    joinDate: 'January 15, 2024',
    employeeId: 'EMP-2024-001',
    department: 'Engineering',
  };

  return (
    <div className="space-y-6">
      {/* Personal Details Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Edit
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="text-gray-900 font-medium">{userDetails.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email Address</p>
              <p className="text-gray-900 font-medium">{userDetails.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone Number</p>
              <p className="text-gray-900 font-medium">{userDetails.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="text-gray-900 font-medium">{userDetails.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Position</p>
              <p className="text-gray-900 font-medium">{userDetails.position}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Calendar className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Join Date</p>
              <p className="text-gray-900 font-medium">{userDetails.joinDate}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Employee ID</p>
            <p className="text-lg font-semibold text-purple-900">{userDetails.employeeId}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Department</p>
            <p className="text-lg font-semibold text-purple-900">{userDetails.department}</p>
          </div>
        </div>
      </div>

      {/* Conversion Amount Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Conversion Settings</h3>
        <p className="text-gray-600 mb-6">Set your preferred currency conversion rate for international transactions</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Currency
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>INR - Indian Rupee</option>
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversion Rate (to USD)
            </label>
            <input
              type="number"
              value={conversionRate}
              onChange={(e) => setConversionRate(parseFloat(e.target.value))}
              step="0.001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Current conversion rate: ₹1 = ${conversionRate.toFixed(3)} USD
          </p>
        </div>
      </div>
    </div>
  );
}
