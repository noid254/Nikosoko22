import React, { useState } from 'react';
import type { Ticket } from '../types';
import GatePass from './GatePass';

interface MyTicketsViewProps {
    tickets: Ticket[];
}

const TicketRow: React.FC<{ ticket: Ticket; onClick: () => void }> = ({ ticket, onClick }) => {
    return (
        <button onClick={onClick} className="w-full text-left bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
                <h3 className="font-bold text-gray-800">{ticket.eventName}</h3>
                <p className="text-sm text-gray-500">{new Date(ticket.eventDate).toLocaleDateString()}</p>
            </div>
            <span className="text-brand-primary font-bold text-sm">&rarr;</span>
        </button>
    );
};

const MyTicketsView: React.FC<MyTicketsViewProps> = ({ tickets }) => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    return (
        <div className="p-4 bg-gray-50 min-h-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Tickets</h2>

            {tickets.length > 0 ? (
                <div className="space-y-3">
                    {tickets.map(ticket => (
                        <TicketRow key={ticket.id} ticket={ticket} onClick={() => setSelectedTicket(ticket)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Your confirmed event tickets will appear here.</p>
                </div>
            )}

            {selectedTicket && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setSelectedTicket(null)}>
                     <div onClick={e => e.stopPropagation()}>
                        <GatePass ticket={selectedTicket} />
                     </div>
                </div>
            )}
        </div>
    );
};

export default MyTicketsView;