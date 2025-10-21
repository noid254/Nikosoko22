import React, { useState } from 'react';
import type { CatalogueItem, ServiceProvider } from '../types';

interface CatalogueItemDetailModalProps {
  item: CatalogueItem;
  onClose: () => void;
  provider: ServiceProvider | null;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
}

const CallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;

const CatalogueItemDetailModal: React.FC<CatalogueItemDetailModalProps> = ({ item, onClose, provider, isAuthenticated, onAuthClick, onInitiateContact }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = item.imageUrls && item.imageUrls.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % item.imageUrls.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + item.imageUrls.length) % item.imageUrls.length);
  };

  const handleCall = () => {
    if (!provider) return;
    if (!isAuthenticated) {
        onAuthClick();
    } else {
        if (onInitiateContact(provider)) {
            window.location.href = `tel:${provider.phone}`;
        }
    }
  }

  const handleWhatsApp = () => {
    if (!provider || !provider.whatsapp) return;
    if (!isAuthenticated) {
        onAuthClick();
    } else {
        if (onInitiateContact(provider)) {
            window.open(`https://wa.me/${provider.whatsapp}`, '_blank');
        }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-t-2xl shadow-xl w-full max-w-sm h-[80vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 relative">
          <img 
            src={item.imageUrls[currentImageIndex] || 'https://picsum.photos/seed/placeholder/800/600'} 
            alt={`${item.title} ${currentImageIndex + 1}`} 
            className="w-full h-48 object-cover rounded-t-2xl" 
          />
           {hasMultipleImages && (
              <>
                  <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1 z-10 hover:bg-opacity-60 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1 z-10 hover:bg-opacity-60 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                      {item.imageUrls.map((_, index) => (
                          <div key={index} className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}></div>
                      ))}
                  </div>
              </>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg z-10">&times;</button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-sm font-bold text-brand-primary uppercase">{item.category}</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{item.title}</h2>
          <p className="text-2xl font-bold text-brand-dark mt-3">{item.price}</p>
          <p className="text-sm text-gray-700 mt-4 leading-relaxed">{item.description}</p>
        </div>
        <div className="p-4 bg-gray-50 border-t flex-shrink-0 flex items-center gap-3">
          {provider?.phone && (
              <button onClick={handleCall} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                  <CallIcon /> Call
              </button>
          )}
          {provider?.whatsapp && (
              <button onClick={handleWhatsApp} className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <WhatsAppIcon /> WhatsApp
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueItemDetailModal;