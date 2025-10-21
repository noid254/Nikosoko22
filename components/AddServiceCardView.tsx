import React, { useState, useRef, useMemo } from 'react';
import type { ServiceProvider } from '../types';

interface SignUpViewProps {
    onBack: () => void;
    onSave: (
        profileData: Omit<ServiceProvider, 'id' | 'name' | 'phone' | 'avatarUrl' | 'whatsapp' | 'flagCount' | 'views' | 'coverImageUrl' | 'isVerified' | 'cta'>, 
        name: string,
        avatar: string | null,
        referralCode: string,
        cta: ServiceProvider['cta'],
    ) => void;
    categories: string[];
    currentUser: Partial<ServiceProvider> | null;
}

const FormInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    isTextarea?: boolean;
    readOnly?: boolean;
}> = ({ label, value, onChange, isTextarea = false, readOnly = false }) => {
    return (
        <div className="relative border-b border-gray-200 py-3">
            <label className="block text-xs text-gray-400 font-medium mb-1">{label}</label>
            {isTextarea ? (
                 <textarea
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    className="w-full text-base text-gray-800 bg-transparent focus:outline-none resize-none"
                    rows={4}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    className="w-full text-base text-gray-800 bg-transparent focus:outline-none"
                />
            )}
        </div>
    );
};


const SignUpView: React.FC<SignUpViewProps> = ({ onBack, onSave, categories, currentUser }) => {
    const [name, setName] = useState(currentUser?.name || '');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [service, setService] = useState('');
    const [charge, setCharge] = useState('');
    const [rateType, setRateType] = useState<ServiceProvider['rateType']>('per hour');
    const [location, setLocation] = useState('');
    const [about, setAbout] = useState('');
    const [category, setCategory] = useState(categories[0] || 'Professional');
    const [customCategory, setCustomCategory] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [ctas, setCtas] = useState<ServiceProvider['cta']>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCtaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const ctaValue = value as ServiceProvider['cta'][number];
        
        setCtas(prev => {
            if (checked) {
                if (prev.length < 2) {
                    return [...prev, ctaValue];
                }
                return prev; // Limit to 2
            } else {
                return prev.filter(c => c !== ctaValue);
            }
        });
    }

    const handleSubmit = () => {
        const finalCategory = category === 'other' ? customCategory : category;

        if (!name || !service || !charge || !location || !about || !finalCategory) {
            alert("Please fill in all fields to create your profile.");
            return;
        }
        if (ctas.length === 0) {
            alert("Please select at least one Call to Action button.");
            return;
        }
        const hourlyRate = parseInt(charge, 10) || 0;
        const profileData = {
            service,
            location,
            rating: 0,
            distanceKm: Math.round(Math.random() * 5 * 10)/10, // Placeholder
            hourlyRate,
            rateType,
            currency: 'Ksh',
            about,
            works: [],
            category: finalCategory,
            isOnline: true,
            accountType: 'individual' as const,
        };
        onSave(profileData, name, avatarPreview, referralCode, ctas);
    };

    const ctaOptions: {value: ServiceProvider['cta'][number], label: string}[] = [
        {value: 'call', label: 'Call'},
        {value: 'whatsapp', label: 'WhatsApp'},
        {value: 'book', label: 'Book'},
        {value: 'catalogue', label: 'Catalogue'},
    ];

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24 pt-16">
            <header className="fixed top-0 left-0 right-0 max-w-sm mx-auto p-4 bg-gray-50 z-10 flex justify-end">
                <button onClick={onBack} className="text-sm font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-lg">Skip for now</button>
            </header>
            <main className="p-4 space-y-6">
                <div className="flex flex-col items-center justify-center">
                     <div
                        onClick={handleImageUploadClick}
                        className="relative w-32 h-32 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 cursor-pointer overflow-hidden shadow-lg group"
                    >
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/gif, image/webp, image/jpeg"
                            className="hidden"
                        />
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                            Change
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Upload Profile Picture</p>
                </div>


                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Your Details</h2>

                    <div className="space-y-2">
                        <FormInput 
                            label={"Your Full Name"}
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                        <FormInput label="Your Profession / Service" value={service} onChange={(e) => setService(e.target.value)} />
                        <div className="relative border-b border-gray-200 py-3">
                            <label className="block text-xs text-gray-400 font-medium mb-1">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-base text-gray-800 bg-transparent focus:outline-none">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                <option value="other">Other (Please specify)</option>
                            </select>
                        </div>
                        {category === 'other' && (
                            <div className="relative border-b border-gray-200 py-3">
                                <label className="block text-xs text-gray-400 font-medium mb-1">Custom Category Name</label>
                                <input
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    className="w-full text-base text-gray-800 bg-transparent focus:outline-none"
                                />
                            </div>
                        )}
                         <div className="border-b border-gray-200 py-3">
                             <label className="block text-xs text-gray-400 font-medium mb-1">Charge</label>
                             <div className="flex items-center gap-2">
                                <span className="text-base text-gray-500">Ksh</span>
                                <input type="number" placeholder="1000" value={charge} onChange={(e) => setCharge(e.target.value)} className="text-base text-gray-800 bg-transparent focus:outline-none w-24"/>
                                <select value={rateType} onChange={(e) => setRateType(e.target.value as ServiceProvider['rateType'])} className="text-base text-gray-800 bg-transparent focus:outline-none border-l pl-2">
                                    <option value="per hour">per hour</option>
                                    <option value="per day">per day</option>
                                    <option value="per task">per task</option>
                                    <option value="per month">per month</option>
                                    <option value="per piece work">per piece</option>
                                    <option value="per km">per km</option>
                                    <option value="per sqm">per sqm</option>
                                    <option value="per cbm">per cbm</option>
                                    <option value="per appearance">per appearance</option>
                                </select>
                            </div>
                         </div>
                        <FormInput label="Your Location (e.g. Westlands, Nairobi)" value={location} onChange={(e) => setLocation(e.target.value)} />
                        <FormInput label="About Me" value={about} onChange={(e) => setAbout(e.target.value)} isTextarea/>

                         <div className="py-3">
                            <label className="block text-xs text-gray-400 font-medium mb-2">Call to Action Buttons (Select up to 2)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ctaOptions.map(option => (
                                     <label key={option.value} className="flex items-center p-2 border rounded-md">
                                        <input 
                                            type="checkbox" 
                                            value={option.value} 
                                            checked={ctas.includes(option.value)}
                                            onChange={handleCtaChange}
                                            disabled={!ctas.includes(option.value) && ctas.length >= 2}
                                            className="text-brand-primary focus:ring-brand-primary"
                                        />
                                        <span className="ml-2 text-sm">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <FormInput label="Referral Code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto p-4 bg-gray-50 border-t border-gray-200">
                 <button onClick={handleSubmit} className="w-full bg-brand-dark text-white font-bold py-4 px-4 rounded-2xl hover:bg-gray-700 transition-colors shadow-lg">
                    Create Profile
                </button>
            </footer>
        </div>
    );
};

export default SignUpView;