import React from 'react';
import type { ServiceProvider } from '../types';

interface ServiceCardProps {
  provider: ServiceProvider;
  onClick: () => void;
}

const VerifiedIcon = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);

const StarIcon = () => (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr',
    'per day': 'day',
    'per task': 'task',
    'per month': 'mo',
    'per piece work': 'item',
    'per km': 'km',
    'per sqm': 'm²',
    'per cbm': 'm³',
    'per appearance': 'show'
};

const ServiceCard: React.FC<ServiceCardProps> = ({ provider, onClick }) => {
  return (
    <div onClick={onClick} className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative">
        <img className="h-24 w-full object-cover" src={provider.coverImageUrl} alt={provider.service} />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">{provider.distanceKm}KM</div>
        <div className="absolute -bottom-6 left-3">
          <img className="h-12 w-12 rounded-full border-2 border-white shadow-md object-cover" src={provider.avatarUrl} alt={provider.name} />
        </div>
      </div>
      <div className="p-3 pt-8">
        <div className="flex items-center">
          <h3 className="text-base font-bold text-gray-900 truncate">{provider.name}</h3>
          {provider.isVerified && (
            <div className="ml-1.5 bg-blue-500 rounded-full p-0.5 flex-shrink-0" title="Verified">
              <VerifiedIcon />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600 mt-0.5">
          <p className="truncate">{provider.service}</p>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${provider.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} title={provider.isOnline ? 'Online' : 'Offline'}></div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <StarIcon />
            <span className="text-gray-600 font-semibold ml-1 text-xs">{provider.rating}</span>
          </div>
          <p className="text-brand-dark font-bold text-sm">{provider.currency}{provider.hourlyRate}/{rateSuffix[provider.rateType]}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;