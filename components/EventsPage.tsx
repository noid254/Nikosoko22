import React, { useState, useMemo } from 'react';
import type { Event, ServiceProvider, Ticket } from '../types';
import { MOCK_EVENTS } from '../constants';

// --- Icons (monochrome theme) ---
const LocationIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const HeartIcon = ({ filled = false, className = "h-6 w-6 text-white" }: { filled?: boolean, className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const CallSmallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const ChatSmallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.186 2.25 2.25 0 00-3.933 2.186z" /></svg>;


interface EventsPageProps {
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onTicketAcquired: (ticket: Ticket) => void;
    currentUser: Partial<ServiceProvider> | null;
    searchTerm: string;
}
type EventFilter = 'All' | 'Today' | 'This Weekend' | Event['category'];

const EventDetailModal: React.FC<{ event: Event; onClose: () => void; onBookNow: () => void }> = ({ event, onClose, onBookNow }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50 p-0" onClick={onClose}>
        <div className="bg-gray-100 rounded-t-2xl shadow-xl w-full max-w-sm h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex-shrink-0 relative">
                <img src={event.coverImageUrl} alt={event.name} className="w-full h-56 object-cover rounded-t-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-3 left-3 flex items-center gap-2">
                     <button onClick={onClose} className="bg-black/40 text-white rounded-full p-1.5 z-10 hover:bg-opacity-75 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button className="bg-black/40 p-1.5 rounded-full"><ShareIcon /></button>
                    <button className="bg-black/40 p-1.5 rounded-full"><HeartIcon /></button>
                </div>
                {event.teaserVideoUrl && (
                    <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 text-gray-800 font-semibold py-2 px-4 rounded-full text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        Teaser Video
                    </button>
                )}
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-white rounded-t-2xl -mt-4 relative">
                <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">{event.category}</span>
                <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                        <CalendarIcon className="w-5 h-5 text-gray-500"/> 
                        <span>{new Date(event.date).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                        <LocationIcon className="w-5 h-5 text-gray-500"/>
                        <span>{event.location}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between py-2">
                     <div className="flex items-center -space-x-2">
                        {event.attendees.map((att, i) => (
                            <img key={i} className="h-8 w-8 rounded-full border-2 border-white object-cover" src={att.avatarUrl} alt={`attendee ${i+1}`} />
                        ))}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">+{Math.floor(Math.random() * 500) + 50} going</p>
                    <button className="text-sm font-bold text-brand-dark hover:underline">View All / Invite</button>
                </div>

                <div>
                    <h3 className="font-bold text-gray-800">About Event</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{event.description} <button className="text-brand-dark font-semibold">Read more</button></p>
                </div>
                 <div>
                    <h3 className="font-bold text-gray-800">Organizer</h3>
                     <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                            <img src={event.organizer.avatarUrl} alt={event.organizer.name} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <p className="font-bold text-gray-800">{event.organizer.name}</p>
                                <p className="text-xs text-gray-500">Organize Team</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-gray-200 rounded-full text-gray-700"><CallSmallIcon/></button>
                            <button className="p-2 bg-gray-200 rounded-full text-gray-700"><ChatSmallIcon/></button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-white border-t flex-shrink-0 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="font-bold text-xl text-brand-dark">{event.currency} {event.price.toLocaleString()}</p>
                </div>
                <button onClick={onBookNow} className="bg-brand-dark text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
                    Book Now
                </button>
            </div>
        </div>
    </div>
);

const FeaturedEventCard: React.FC<{ event: Event; onClick: () => void }> = ({ event, onClick }) => (
    <div onClick={onClick} className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group mx-4">
        <img src={event.coverImageUrl} alt={event.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="font-bold text-lg">{event.name}</h3>
            <p className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>
    </div>
);

const EventListItem: React.FC<{ event: Event; onClick: () => void }> = ({ event, onClick }) => (
    <button onClick={onClick} className="w-full text-left bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
        <img src={event.coverImageUrl} alt={event.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
        <div className="flex-grow overflow-hidden">
            <p className="text-xs font-bold text-brand-primary uppercase">{event.category}</p>
            <h3 className="font-bold text-gray-800 truncate mt-1">{event.name}</h3>
            <p className="text-sm text-gray-500 truncate mt-1">{new Date(event.date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
            <p className="text-sm text-gray-500 truncate">{event.location}</p>
            <p className="text-sm font-semibold text-brand-dark mt-2">{event.currency} {event.price.toLocaleString()}</p>
        </div>
    </button>
);

const EventsPage: React.FC<EventsPageProps> = ({ isAuthenticated, onAuthClick, onTicketAcquired, currentUser, searchTerm }) => {
    const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
    const [activeFilter, setActiveFilter] = useState<EventFilter>('All');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    
    const filters: EventFilter[] = ['All', 'Today', 'This Weekend', 'Music', 'Business', 'Arts'];
    
    const filteredEvents = useMemo(() => {
        let eventsToList = events;

        if(activeFilter === 'Today') {
            const today = new Date().toDateString();
            eventsToList = events.filter(e => new Date(e.date).toDateString() === today);
        } else if (activeFilter === 'This Weekend') {
            const today = new Date();
            const dayOfWeek = today.getDay(); // Sunday - 0, ...
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (7 - dayOfWeek)); // End of this Sunday
            eventsToList = events.filter(e => {
                const eventDate = new Date(e.date);
                return eventDate >= today && eventDate <= endOfWeek;
            });
        } else if (activeFilter !== 'All') {
            eventsToList = events.filter(e => e.category === activeFilter);
        }

        return eventsToList.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [events, activeFilter, searchTerm]);

    const handleProtectedAction = <T,>(action: (...args: T[]) => void) => {
        return (...args: T[]) => {
            if (!isAuthenticated) {
                onAuthClick();
            } else {
                action(...args);
            }
        };
    };

    const handleBookNow = () => {
        if (selectedEvent) {
             const ticketId = `TKT-${selectedEvent.id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
             const newTicket: Ticket = {
                id: ticketId,
                eventId: selectedEvent.id,
                eventName: selectedEvent.name,
                eventDate: selectedEvent.date,
                eventLocation: selectedEvent.location,
                userName: currentUser?.name || 'Guest',
                qrCodeData: `https://nikosoko.app/ticket/${ticketId}`
            };
            onTicketAcquired(newTicket);
            setSelectedEvent(null);
        }
    }
    
    const featuredEvent = useMemo(() => events.find(e => new Date(e.date) > new Date()), [events]) || events[0];
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="space-y-6 pt-4 pb-4">
                
                {featuredEvent && (
                    <FeaturedEventCard event={featuredEvent} onClick={handleProtectedAction(() => setSelectedEvent(featuredEvent))} />
                )}

                <div>
                    <div className="flex space-x-3 overflow-x-auto no-scrollbar px-4 pb-2">
                        {filters.map(f => (
                            <button 
                                key={f} 
                                onClick={handleProtectedAction(() => setActiveFilter(f))}
                                className={`px-4 py-2 text-sm font-semibold rounded-full flex-shrink-0 border transition-colors ${activeFilter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-700 border-gray-200'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-4 space-y-3">
                    {filteredEvents.map(event => (
                        <EventListItem key={event.id} event={event} onClick={handleProtectedAction(() => setSelectedEvent(event))} />
                    ))}
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>No events found for this filter.</p>
                        </div>
                    )}
                </div>
            </main>
            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onBookNow={handleProtectedAction(handleBookNow)}
                />
            )}
        </div>
    );
};

export default EventsPage;