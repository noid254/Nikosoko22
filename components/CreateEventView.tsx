import React, { useState, useRef } from 'react';
import type { Event, ServiceProvider } from '../types';

interface CreateEventViewProps {
    onBack: () => void;
    onSave: (eventData: Omit<Event, 'id'>) => void;
    currentUser: Partial<ServiceProvider> | null;
}

const CreateEventView: React.FC<CreateEventViewProps> = ({ onBack, onSave, currentUser }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Event['category']>('Community');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setCoverImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !date || !location || !price || !description || !coverImage) {
            alert('Please fill all fields and upload a cover image.');
            return;
        }

        const eventData: Omit<Event, 'id'> = {
            name,
            date: new Date(date).toISOString(),
            location,
            description,
            coverImageUrl: coverImage,
            createdBy: currentUser?.name || 'Community Member',
            category,
            price: parseFloat(price),
            currency: '$',
            ticketType: 'single',
            distanceKm: 0,
            organizer: {
                name: currentUser?.name || 'Organizer',
                avatarUrl: currentUser?.avatarUrl || 'https://picsum.photos/seed/organizer/100/100'
            },
            attendees: []
        };
        onSave(eventData);
    };

    const eventCategories: Event['category'][] = ['Music', 'Food', 'Sport', 'Conference', 'Party', 'Wedding', 'Community', 'Arts', 'Business', 'Fashion', 'Gaming'];

    return (
        <div className="bg-gray-50 min-h-full font-sans">
             <header className="p-4 bg-white shadow-sm flex items-center gap-4">
                <button onClick={onBack} className="text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">Create New Event</h1>
            </header>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div 
                    className="h-48 bg-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {coverImage ? (
                        <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover rounded-xl"/>
                    ) : (
                        <div className="text-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="mt-1 text-sm">Upload Cover Image</p>
                        </div>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden"/>

                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Event Name" className="w-full p-3 border rounded-lg" required/>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 border rounded-lg" required/>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (e.g., Uhuru Park, Nairobi)" className="w-full p-3 border rounded-lg" required/>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price ($)" className="w-full p-3 border rounded-lg" required/>
                <select value={category} onChange={e => setCategory(e.target.value as Event['category'])} className="w-full p-3 border rounded-lg bg-white">
                    {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Event Description" rows={4} className="w-full p-3 border rounded-lg" required/>
                
                <button type="submit" className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-full shadow-lg">
                    Publish Event
                </button>
            </form>
        </div>
    );
};

export default CreateEventView;
