import React, { useState } from 'react';
import type { ServiceProvider } from '../types';

interface RatingModalProps {
  provider: ServiceProvider;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  onNeverHappened: () => void;
  limitReached?: boolean;
}

const Star: React.FC<{ filled: boolean; onClick: () => void; onHover: () => void }> = ({ filled, onClick, onHover }) => (
    <svg onClick={onClick} onMouseEnter={onHover} className={`w-8 h-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const RatingModal: React.FC<RatingModalProps> = ({ provider, onClose, onSubmit, onNeverHappened, limitReached = false }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs mx-4 text-center">
                {limitReached ? (
                    <>
                        <h2 className="text-lg font-bold mb-2">Please Rate to Continue</h2>
                        <p className="text-gray-600 mb-4">You have reached the contact limit. Please rate your experience with <span className="font-semibold">{provider.name}</span> to contact more providers.</p>
                    </>
                ) : (
                    <>
                        <img src={provider.avatarUrl} alt={provider.name} className="w-16 h-16 rounded-full mx-auto -mt-12 border-4 border-white" />
                        <h2 className="text-lg font-bold mt-4 mb-2">How was your experience with <span className="font-semibold">{provider.name}?</span></h2>
                    </>
                )}
                
                <div className="flex justify-center my-4" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                            key={star} 
                            filled={hoverRating >= star || rating >= star} 
                            onClick={() => setRating(star)} 
                            onHover={() => setHoverRating(star)}
                        />
                    ))}
                </div>

                <button 
                    onClick={handleSubmit} 
                    disabled={rating === 0}
                    className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-3"
                >
                    Submit Rating
                </button>

                {!limitReached && (
                    <button onClick={onClose} className="w-full text-gray-600 font-semibold py-2">
                        Later
                    </button>
                )}
                
                <button onClick={onNeverHappened} className="text-xs text-gray-400 mt-2 hover:underline">
                    The contact never happened.
                </button>
            </div>
        </div>
    );
};

export default RatingModal;