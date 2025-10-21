import React, { useState, useMemo } from 'react';
import type { Event, Ticket, ServiceProvider } from '../types';
import { MOCK_EVENTS } from '../constants';
import GatePass from './GatePass';

type EventCategory = Event['category'] | 'All';

interface EventsPageProps {
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onTicketAcquired: (ticket: Ticket) => void;
    currentUser: Partial<ServiceProvider> | null;
    searchTerm: string;
}

// --- Icons ---
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const DistanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ReminderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>

const EventCard: React.FC<{ event: Event; onClick: () => void }> = ({ event, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer flex flex-col group">
        <img src={event.coverImageUrl} alt={event.name} className="w-full h-24 object-cover" />
        <div className="p-3 flex flex-col flex-grow">
            <p className="text-xs font-bold text-brand-primary uppercase">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <h3 className="text-sm font-bold text-gray-800 mt-1 flex-grow group-hover:text-brand-primary transition-colors">{event.name}</h3>
            
            <div className="text-xs text-gray-600 mt-2 space-y-1">
                 <div className="flex items-center gap-1.5">
                    <LocationIcon/> <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <DistanceIcon/> <span>{event.distanceKm}km away</span>
                </div>
            </div>
        </div>
    </div>
);

const EventDetailModal: React.FC<{
    event: Event;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ event, onClose, onConfirm }) => {
    const [reminderSet, setReminderSet] = useState(false);

    const handleRemind = () => {
        setReminderSet(true);
        // In a real app, this would trigger a notification service
        alert("Reminder set! We'll notify you 2 days before the event.");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50 p-0" onClick={onClose}>
            <div className="bg-white rounded-t-2xl shadow-xl w-full max-w-sm h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 relative">
                    <img src={event.coverImageUrl} alt={event.name} className="w-full h-48 object-cover rounded-t-2xl" />
                    <button onClick={onClose} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg z-10">&times;</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                    <p className="text-sm text-gray-600 mt-2 font-semibold">{new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                        <LocationIcon/> <span>{event.location}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-4 leading-relaxed">{event.description}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t flex-shrink-0 space-y-3">
                    <button 
                        onClick={handleRemind} 
                        disabled={reminderSet}
                        className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        <ReminderIcon /> {reminderSet ? 'Reminder Set!' : 'Remind me 2 days to the event'}
                    </button>
                     <button onClick={onConfirm} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                        Confirm Attendance
                    </button>
                </div>
            </div>
        </div>
    );
};

const TicketPurchaseModal: React.FC<{ 
    event: Event, 
    onClose: () => void, 
    onTicketAcquired: (ticket: Ticket) => void,
    currentUser: Partial<ServiceProvider> | null
}> = ({ event, onClose, onTicketAcquired, currentUser }) => {
    const [step, setStep] = useState<'details' | 'success'>('details');
    const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);
    const [showGatePass, setShowGatePass] = useState(false);

    const handleConfirm = () => {
        const ticketId = `TKT-${event.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newTicket: Ticket = {
            id: ticketId,
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            eventLocation: event.location,
            userName: currentUser?.name || 'Guest',
            qrCodeData: `https://nikosoko.app/event/${event.id}`
        };
        onTicketAcquired(newTicket);
        setGeneratedTicket(newTicket);
        setStep('success');
    };

    if (showGatePass && generatedTicket) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setShowGatePass(false)}>
                 <div onClick={e => e.stopPropagation()}>
                    <GatePass ticket={generatedTicket} />
                 </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                {step === 'details' ? (
                    <>
                        <div className="p-4">
                            <h2 className="text-xl font-bold text-gray-900">Confirm Your Ticket</h2>
                            <p className="text-sm font-semibold mt-2">{event.name}</p>
                            <div className="mt-4 bg-gray-100 p-3 rounded-lg text-sm space-y-2">
                                <div className="flex justify-between"><span>Ticket:</span> <strong>FREE</strong></div>
                                <div className="flex justify-between"><span>Quantity:</span> <strong>1</strong></div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t">
                            <button onClick={handleConfirm} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                Get Ticket
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-xl font-bold">Success!</h2>
                        <p className="text-gray-600 mt-2">Your ticket for "{event.name}" has been confirmed.</p>
                        <div className="mt-6 flex flex-col gap-3">
                             <button onClick={() => setShowGatePass(true)} className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                                View Gate Pass
                            </button>
                            <button onClick={onClose} className="w-full text-gray-600 font-semibold py-2">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const CreateEventForm: React.FC<{ onSave: (event: Event) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [ticketType, setTicketType] = useState<'single'|'multiple'>('single');
    const [coverImage, setCoverImage] = useState('https://picsum.photos/seed/newevent/600/400');

    const handleSave = () => {
        if(!name || !date || !location || !description) {
            alert('Please fill all fields');
            return;
        }
        const newEvent: Event = {
            id: Date.now(),
            name, date, location, description, coverImageUrl: coverImage, entryFee: 0, ticketType,
            createdBy: 'You',
            category: 'Community',
            distanceKm: Math.round(Math.random() * 10)
        };
        onSave(newEvent);
    }
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
             <h2 className="text-xl font-bold text-gray-800 mb-4">Create a New Event</h2>
             <div className="space-y-4">
                <input type="text" placeholder="Event Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded"/>
                <div>
                    <label className="text-xs text-gray-500">Date & Time</label>
                    <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded"/>
                </div>
                 <div className="relative">
                     <label className="text-xs text-gray-500">Location</label>
                    <input type="text" placeholder="e.g. KICC, Nairobi" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded pl-8"/>
                    <div className="absolute top-8 left-2 text-gray-400"><LocationIcon /></div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Ticket Reservation</label>
                    <div className="flex gap-4">
                        <label className="flex items-center text-sm"><input type="radio" name="ticketType" value="single" checked={ticketType === 'single'} onChange={() => setTicketType('single')} className="mr-2 text-brand-primary focus:ring-brand-primary"/> One pass, one access</label>
                        <label className="flex items-center text-sm"><input type="radio" name="ticketType" value="multiple" checked={ticketType === 'multiple'} onChange={() => setTicketType('multiple')} className="mr-2 text-brand-primary focus:ring-brand-primary"/> Multiple access</label>
                    </div>
                </div>

                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full p-2 border rounded"/>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Create</button>
                </div>
             </div>
        </div>
    )
}

const InviteGuestsModal: React.FC<{ eventName: string; onClose: () => void }> = ({ eventName, onClose }) => {
    const [phones, setPhones] = useState('');
    
    const handleSend = () => {
        if (phones.trim() === '') {
            alert('Please enter at least one phone number.');
            return;
        }
        alert(`Invitations for "${eventName}" sent successfully!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-900">Invite Guests</h2>
                    <p className="text-sm text-gray-600 mt-1">Event: {eventName}</p>
                    <textarea 
                        value={phones} 
                        onChange={e => setPhones(e.target.value)} 
                        rows={5} 
                        className="w-full p-2 border rounded mt-4" 
                        placeholder="Enter phone numbers, separated by commas..."
                    />
                </div>
                <div className="p-4 bg-gray-50 border-t flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-200 font-bold py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSend} className="flex-1 bg-brand-primary text-white font-bold py-2 rounded-lg">Send Invites</button>
                </div>
            </div>
        </div>
    );
};


const EventsPage: React.FC<EventsPageProps> = ({ isAuthenticated, onAuthClick, onTicketAcquired, currentUser, searchTerm }) => {
    const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
    const [activeCategory, setActiveCategory] = useState<EventCategory>('All');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [eventToPurchase, setEventToPurchase] = useState<Event | null>(null);
    const [eventToInvite, setEventToInvite] = useState<Event | null>(null);

    const eventCategories: EventCategory[] = ['All', 'Music', 'Conference', 'Wedding', 'Community'];
    
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
            const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [events, activeCategory, searchTerm]);

    const handleEventCreated = (event: Event) => {
        setEvents(prev => [event, ...prev]);
        setIsCreating(false);
        setEventToInvite(event);
    };

    const handleProtectedAction = (action: () => void) => {
        if (!isAuthenticated) {
            onAuthClick();
        } else {
            action();
        }
    };
    
    const handleConfirmFromDetail = () => {
        if (selectedEvent) {
            setEventToPurchase(selectedEvent);
            setSelectedEvent(null);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <main className="p-4 space-y-4">
                {isCreating ? (
                    <CreateEventForm onSave={handleEventCreated} onCancel={() => setIsCreating(false)} />
                ) : (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <button onClick={() => handleProtectedAction(() => setIsCreating(true))} className="w-full text-left text-gray-500">
                           Start creating an event...
                        </button>
                    </div>
                )}
                
                <div className="sticky top-[68px] z-10 bg-gray-100 py-2 -mx-4 px-4">
                    <div className="flex space-x-3 overflow-x-auto no-scrollbar">
                        {eventCategories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => handleProtectedAction(() => setActiveCategory(cat))}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 ${activeCategory === cat ? 'bg-brand-dark text-white' : 'bg-white shadow-sm'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {filteredEvents.map(event => (
                        <EventCard key={event.id} event={event} onClick={() => handleProtectedAction(() => setSelectedEvent(event))} />
                    ))}
                     {filteredEvents.length === 0 && <p className="col-span-2 text-center text-gray-500 mt-8">No events found.</p>}
                </div>
            </main>
            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onConfirm={handleConfirmFromDetail}
                />
            )}
            {eventToPurchase && (
                <TicketPurchaseModal 
                    event={eventToPurchase} 
                    onClose={() => setEventToPurchase(null)} 
                    onTicketAcquired={onTicketAcquired}
                    currentUser={currentUser}
                />
            )}
             {eventToInvite && (
                <InviteGuestsModal 
                    eventName={eventToInvite.name} 
                    onClose={() => setEventToInvite(null)}
                />
            )}
        </div>
    );
};

export default EventsPage;