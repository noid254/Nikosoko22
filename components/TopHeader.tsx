import React, { useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (phone: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && phone.length >= 9) {
      setStep(2);
    } else {
      alert("Please enter a valid phone number (9 or 10 digits).");
    }
  };
  
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '1234') {
      onLogin(phone);
      onClose();
    } else {
      alert("Please enter the correct 4-digit OTP.");
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPhone(input.slice(0, 10)); // Limit to 10 digits
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sign In / Sign Up</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        
        {step === 1 && (
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
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Continue</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirm}>
            <p className="text-gray-600 mb-4">Enter the 4-digit OTP sent to +254{phone}.</p>
            <p className="text-xs text-center text-gray-500 mb-4">(Hint: use 1234)</p>
            <div className="mb-6">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
              <input type="text" id="otp" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} required autoFocus className="mt-1 block w-full text-center tracking-[1em] px-3 py-3 border-0 bg-gray-100 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-primary sm:text-sm"/>
            </div>
             <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Confirm</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;