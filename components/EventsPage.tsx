import React, { useState, useMemo, useRef } from 'react';
import type { Event, ServiceProvider, Ticket } from '../types';

// --- Sub-components for the new EventsPage ---

const EventCard: React.FC<{ event: Event; variant: 'popular' | 'foryou' | 'special'; onClick: () => void }> = ({ event, variant, onClick }) => {
    if (variant === 'popular') {
        return (
            <div onClick={onClick} className="relative w-64 h-40 rounded-2xl overflow-hidden cursor-pointer group flex-shrink-0">
                <img src={event.coverImageUrl} alt={event.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3 text-white">
                    <h3 className="font-bold text-md leading-tight">{event.name}</h3>
                    <p className="text-xs mt-1">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {event.location}</p>
                </div>
                 <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white font-bold text-lg p-2 rounded-lg leading-none">${event.price}</div>
            </div>
        );
    }

    if (variant === 'foryou') {
        return (
            <div onClick={onClick} className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer w-48 flex-shrink-0">
                <img src={event.coverImageUrl} alt={event.name} className="w-full h-24 object-cover" />
                <div className="p-3">
                    <h3 className="font-bold text-sm truncate">{event.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {event.location}</p>
                    <p className="font-bold text-gray-800 mt-2">${event.price}</p>
                </div>
            </div>
        );
    }
    
    // special variant
    return (
         <div onClick={onClick} className="bg-white p-3 rounded-2xl shadow-md flex items-center gap-4">
            <img src={event.coverImageUrl} alt={event.name} className="w-20 h-20 rounded-xl object-cover" />
            <div className="flex-1 overflow-hidden">
                <p className="text-xs text-gray-500">{event.category}</p>
                <h3 className="font-bold truncate">{event.name}</h3>
                 <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}, {event.location}</p>
            </div>
             <div className="text-right">
                {event.originalPrice && <p className="text-sm text-gray-400 line-through">${event.originalPrice}</p>}
                <p className="font-bold text-gray-800">${event.price}</p>
            </div>
        </div>
    );
};


const EventDetailModal: React.FC<{ event: Event; onClose: () => void; onBookNow: () => void }> = ({ event, onClose, onBookNow }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-40" onClick={onClose}>
        <div className="bg-white rounded-t-3xl shadow-xl w-full max-w-sm h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-2 flex-shrink-0 text-center relative" onTouchStart={onClose}>
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto my-2"></div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                 <img src={event.coverImageUrl} alt={event.name} className="w-full h-48 object-cover rounded-2xl" />
                 <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-700"><span className="text-gray-800">&#9200;</span> <span>{new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span></div>
                    <div className="flex items-center gap-3 text-sm text-gray-700"><span className="text-gray-800">&#128205;</span> <span>{event.location}</span></div>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">About Event</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{event.description}</p>
                </div>
            </div>
            <div className="p-4 bg-white border-t flex-shrink-0 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-bold text-xl text-gray-800">${event.price.toLocaleString()}</p>
                </div>
                <button onClick={onBookNow} className="bg-brand-dark text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700 transition-colors">
                    Book Now
                </button>
            </div>
        </div>
    </div>
);

const PaymentSimulationModal: React.FC<{ event: Event; onClose: () => void; onConfirm: () => void; }> = ({ event, onClose, onConfirm }) => (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold">Confirm Booking</h2>
            <p className="text-gray-600 mt-2 text-sm">You are booking a ticket for <br/><span className="font-semibold">{event.name}</span></p>
            <div className="my-6 bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-gray-800">${event.price}</p>
            </div>
            <p className="text-xs text-gray-500 mb-4">This is a simulated payment process. No real payment will be made.</p>
            <button onClick={onConfirm} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-dark transition-colors">
                Confirm & Get Ticket
            </button>
        </div>
    </div>
);

// --- Main EventsPage Component ---
interface EventsPageProps {
    events: Event[];
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onTicketAcquired: (ticket: Ticket) => void;
    currentUser: Partial<ServiceProvider> | null;
    onNavigateToCreate: () => void;
    onBack: () => void;
}
type EventFilter = 'All' | Event['category'];

const EventsPage: React.FC<EventsPageProps> = ({ events, isAuthenticated, onAuthClick, onTicketAcquired, currentUser, onNavigateToCreate, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<EventFilter>('All');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    
    const filters: EventFilter[] = ['All', 'Music', 'Food', 'Sport', 'Arts'];
    
    const filteredEvents = useMemo(() => {
        let eventsToList = events.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (activeFilter !== 'All') {
            eventsToList = eventsToList.filter(e => e.category === activeFilter);
        }
        return eventsToList;
    }, [events, activeFilter, searchTerm]);

    const handleProtectedAction = <T,>(action: (...args: T[]) => void) => {
        return (...args: T[]) => {
            if (!isAuthenticated) { onAuthClick(); } 
            else { action(...args); }
        };
    };

    const handleBookNow = () => {
        if (selectedEvent) {
            setIsBooking(true);
        }
    }
    
    const handleConfirmPayment = () => {
        if (selectedEvent) {
             const ticketId = `TKT-${selectedEvent.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
             const newTicket: Ticket = {
                id: ticketId,
                eventId: selectedEvent.id,
                eventName: selectedEvent.name,
                eventDate: selectedEvent.date,
                eventLocation: selectedEvent.location,
                userName: currentUser?.name || 'Guest',
                qrCodeData: `https://nikosoko.app/ticket/${ticketId}`,
                gate: `A${Math.floor(Math.random() * 20) + 1}`,
                eventCoverUrl: selectedEvent.coverImageUrl,
            };
            onTicketAcquired(newTicket);
            setIsBooking(false);
            setSelectedEvent(null);
        }
    }
    
    const popularEvents = useMemo(() => events.filter(e => e.price > 40), [events]);
    const specialDeals = useMemo(() => events.filter(e => e.originalPrice), [events]);
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
             <header className="p-4 pb-2 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-30">
                 <div className="flex justify-between items-center">
                    <button onClick={onBack} className="bg-white p-2 rounded-full shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Welcome back 👋</p>
                        <h1 className="text-2xl font-bold text-gray-900">{currentUser?.name || 'Guest'}</h1>
                    </div>
                 </div>
                 <div className="relative mt-4">
                    <input type="text" placeholder="Search Event" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full py-3 pl-4 pr-10 text-sm rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800" />
                    <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </header>

            <main className="space-y-6 pb-24">
                <div className="flex space-x-3 overflow-x-auto no-scrollbar px-4 pt-2">
                    {filters.map(f => (
                        <button key={f} onClick={handleProtectedAction(() => setActiveFilter(f))}
                            className={`px-4 py-2 text-sm font-semibold rounded-full flex-shrink-0 border-2 transition-colors ${activeFilter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-700 border-transparent'}`}>
                            {f}
                        </button>
                    ))}
                </div>
                
                 <div>
                    <div className="flex justify-between items-center px-4 mb-2">
                        <h2 className="text-lg font-bold text-gray-800">Popular Event</h2>
                        <button className="text-sm font-semibold text-gray-800">See More</button>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar px-4">
                       {popularEvents.map(event => <EventCard key={event.id} event={event} variant="popular" onClick={handleProtectedAction(() => setSelectedEvent(event))} />)}
                    </div>
                </div>

                <div>
                     <div className="flex justify-between items-center px-4 mb-2">
                        <h2 className="text-lg font-bold text-gray-800">Event for you</h2>
                    </div>
                    <div className="flex space-x-4 overflow-x-auto no-scrollbar px-4">
                       {filteredEvents.map(event => <EventCard key={event.id} event={event} variant="foryou" onClick={handleProtectedAction(() => setSelectedEvent(event))} />)}
                    </div>
                </div>

                <div className="px-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Special Deal</h2>
                        <button className="text-sm font-semibold text-gray-800">See More</button>
                    </div>
                    {specialDeals.map(event => <EventCard key={event.id} event={event} variant="special" onClick={handleProtectedAction(() => setSelectedEvent(event))} />)}
                </div>
            </main>
            
            <button onClick={handleProtectedAction(onNavigateToCreate)} className="fixed bottom-20 right-4 bg-brand-dark text-white rounded-full p-4 shadow-lg z-30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
            
            {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onBookNow={handleProtectedAction(handleBookNow)} />}
            {isBooking && selectedEvent && <PaymentSimulationModal event={selectedEvent} onClose={() => setIsBooking(false)} onConfirm={handleProtectedAction(handleConfirmPayment)} />}
        </div>
    );
};

export default EventsPage;