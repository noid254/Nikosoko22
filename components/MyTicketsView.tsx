import React, { useState, useRef } from 'react';
import type { Ticket } from '../types';

declare const html2pdf: any;

// --- Sub-component for the new Ticket Design ---

const TicketDetailCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    const ticketRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const element = ticketRef.current;
        if (element) {
            const opt = {
                margin:       0,
                filename:     `Ticket-${ticket.eventName.replace(/\s/g, '_')}-${ticket.id}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().from(element).set(opt).save();
        }
    };

    return (
        <div className="w-full max-w-xs font-sans">
             <div ref={ticketRef} className="bg-white rounded-2xl shadow-xl">
                <div className="p-4">
                    <img src={ticket.eventCoverUrl} alt={ticket.eventName} className="w-full h-32 object-cover rounded-xl" />
                    <h2 className="text-xl font-bold text-center mt-4">{ticket.eventName}</h2>
                </div>
                <div className="border-t border-b border-dashed border-gray-300 p-4 flex justify-between text-sm">
                    <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-semibold">{ticket.userName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500">Gate</p>
                        <p className="font-semibold">{ticket.gate}</p>
                    </div>
                </div>
                <div className="p-4 flex justify-between text-sm">
                     <div>
                        <p className="text-gray-500">Time</p>
                        <p className="font-semibold">{new Date(ticket.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500">Date</p>
                        <p className="font-semibold">{new Date(ticket.eventDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="p-4 border-t border-dashed border-gray-300 flex flex-col items-center">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.qrCodeData)}`}
                        alt="Ticket QR Code"
                        className="w-32 h-32 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2">Ticket ID: {ticket.id}</p>
                </div>
            </div>
            <button 
                onClick={handleDownload}
                className="w-full mt-4 bg-brand-primary text-white font-bold py-3 px-4 rounded-full hover:bg-brand-dark transition-colors"
            >
                Download Ticket
            </button>
        </div>
    );
};

// --- Main MyTicketsView Component ---
interface MyTicketsViewProps {
    tickets: Ticket[];
}

const TicketRow: React.FC<{ ticket: Ticket; onClick: () => void }> = ({ ticket, onClick }) => {
    return (
        <button onClick={onClick} className="w-full text-left bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <img src={ticket.eventCoverUrl} alt={ticket.eventName} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
                <h3 className="font-bold text-gray-800 truncate">{ticket.eventName}</h3>
                <p className="text-sm text-gray-500">{new Date(ticket.eventDate).toLocaleDateString()}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
    );
};

const MyTicketsView: React.FC<MyTicketsViewProps> = ({ tickets }) => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    return (
        <div className="p-4 bg-gray-50 min-h-full">
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
                        <TicketDetailCard ticket={selectedTicket} />
                     </div>
                </div>
            )}
        </div>
    );
};

export default MyTicketsView;