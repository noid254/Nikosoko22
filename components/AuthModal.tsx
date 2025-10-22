import React, { useState } from 'react';
import * as api from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (data: api.VerifyOtpResponse) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Directly verify without sending OTP for development
      const response = await api.verifyOtp(phone);
      onLogin(response);
      onClose();
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const input = e.target.value.replace(/\D/g, '');
    setPhone(input.slice(0, 10));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sign In / Sign Up</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
        
        <form onSubmit={handleContinue}>
          <p className="text-gray-600 mb-4">Enter your phone number to continue.</p>
          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-primary">
                <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
                <input 
                    type="tel" 
                    id="phone" 
                    value={phone} 
                    onChange={handlePhoneChange} 
                    required 
                    autoFocus
                    placeholder="722123456"
                    className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm"
                />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400">
            {isLoading ? 'Signing In...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;