import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Invitation, ServiceProvider } from '../types';
import { PREMISE_CONTACTS } from '../constants';
import * as api from '../services/api';

type KaribuProps = {
    allProviders: ServiceProvider[];
    currentUser: Partial<ServiceProvider> | null;
    isSuperAdmin: boolean;
    isAuthenticated: boolean;
    invitations: Invitation[];
    onCreateInvitation: (data: Omit<Invitation, 'id' | 'status' | 'accessCode' | 'hostName' | 'type'>) => Promise<void>;
    onCreateKnock: (data: Omit<Invitation, 'id' | 'status' | 'accessCode' | 'type'>) => Promise<void>;
    onUpdateInvitationStatus: (id: string, status: Invitation['status']) => Promise<void>;
    onAuthClick: () => void;
    onGoToSignup: () => void;
};

// --- Sub-components for Karibu System ---

const VisitorPass: React.FC<{ pass: Invitation }> = ({ pass }) => (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs font-sans text-gray-800 p-6 flex flex-col items-center">
        <img src={pass.visitorAvatar || 'https://picsum.photos/seed/guest/100/100'} alt={pass.visitorName} className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-md"/>
        <h2 className="text-2xl font-bold mt-4">{pass.visitorName || `Guest (${pass.visitorPhone})`}</h2>
        <p className="text-sm text-gray-500">Visiting {pass.hostName} ({pass.hostApartment})</p>
        
        <div className="my-6">
            <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pass.accessCode)}`}
                alt="Visitor Pass QR Code"
                className="w-48 h-48 rounded-lg"
            />
        </div>
        
        <div className="w-full text-center bg-green-100 text-green-800 font-bold py-3 px-4 rounded-lg">
            APPROVED - Ready for Scan
        </div>
        <p className="text-xs text-gray-400 mt-2">Expires: {new Date(pass.visitDate).toLocaleDateString()} at midnight</p>
    </div>
);

const PremiseLandingModal: React.FC<{
    onClose: () => void;
    onKnock: (apartment: string) => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
}> = ({ onClose, onKnock, isAuthenticated, onAuthClick }) => {
    const [showCallMenu, setShowCallMenu] = useState(false);
    const [isKnocking, setIsKnocking] = useState(false);
    const [apartment, setApartment] = useState('');

    const handleKnock = () => {
        if(!isAuthenticated) {
            onAuthClick();
            return;
        }
        setIsKnocking(true);
    }
    
    const submitKnock = () => {
        if(apartment.trim()) {
            onKnock(apartment.trim());
        }
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold">{PREMISE_CONTACTS.name}</h2>
                <p className="text-gray-600 mt-1">Welcome! Please select an option.</p>
                
                {isKnocking ? (
                    <div className="mt-6">
                        <label htmlFor="apartment" className="font-semibold">Who are you visiting? (Apt No.)</label>
                        <input 
                            id="apartment" type="text" value={apartment} onChange={e => setApartment(e.target.value.toUpperCase())}
                            placeholder="e.g. C5" autoFocus
                            className="w-full text-center text-2xl font-bold p-2 border-b-2 mt-2 focus:outline-none focus:border-brand-primary"
                        />
                         <button onClick={submitKnock} className="mt-6 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg">Send Request</button>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        <div className="relative">
                            <button onClick={() => setShowCallMenu(p => !p)} className="w-full border-2 border-brand-primary text-brand-primary font-bold py-3 px-4 rounded-lg">Call</button>
                            {showCallMenu && (
                                <div className="mt-2 space-y-2">
                                    {PREMISE_CONTACTS.contacts.map(c => (
                                        <a key={c.name} href={`tel:${c.phone}`} className="block w-full bg-gray-100 text-gray-800 p-3 rounded-lg">{c.name}</a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={handleKnock} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg">Ring Bell (Knock Knock)</button>
                    </div>
                )}
            </div>
        </div>
    )
}

const RegisterPremiseModal: React.FC<{ onClose: () => void, onRegister: (name: string) => void }> = ({ onClose, onRegister }) => {
    const [name, setName] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-2">Register Your Premise</h2>
                <p className="text-sm text-gray-600 text-center mb-6">Become a Superhost and manage visitors for your building, school, or estate.</p>
                <input 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Greenpark Apartments"
                    className="w-full p-3 border rounded-lg mb-4"
                />
                <button onClick={() => onRegister(name)} disabled={!name.trim()} className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                    Register & Become Superhost
                </button>
            </div>
        </div>
    );
};


const GatePass: React.FC<KaribuProps> = ({ currentUser, isSuperAdmin, isAuthenticated, invitations, onCreateInvitation, onCreateKnock, onUpdateInvitationStatus, onAuthClick, onGoToSignup, allProviders }) => {
    const [view, setView] = useState<'requests' | 'invites' | 'history'>('requests');
    const [isInviting, setIsInviting] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [visitorPhone, setVisitorPhone] = useState('');
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);

    const myInvitations = useMemo(() => {
        return invitations.filter(inv => inv.hostId === currentUser?.id || (isSuperAdmin));
    }, [invitations, currentUser, isSuperAdmin]);

    const pendingRequests = useMemo(() => myInvitations.filter(i => i.type === 'Knock' && i.status === 'Pending'), [myInvitations]);
    const activeInvites = useMemo(() => myInvitations.filter(i => i.type === 'Invite' && (i.status === 'Active' || i.status === 'Approved')), [myInvitations]);
    const history = useMemo(() => myInvitations.filter(i => ['Used', 'Canceled', 'Denied', 'Expired'].includes(i.status)), [myInvitations]);

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !currentUser.id) return;
        await onCreateInvitation({ hostId: currentUser.id, visitorPhone, visitDate });
        setVisitorPhone('');
        setIsInviting(false);
    };

    const handlePickContact = async () => {
        try {
             // @ts-ignore
            if ('contacts' in navigator && 'select' in navigator.contacts) {
                 // @ts-ignore
                const contacts = await navigator.contacts.select(['tel'], { multiple: false });
                if (contacts.length > 0 && contacts[0].tel.length > 0) {
                    const phone = contacts[0].tel[0].replace(/[\s-]/g, '');
                    setVisitorPhone(phone.slice(-9)); // Get last 9 digits
                }
            } else {
                 alert("Contact Picker API not supported on your browser.");
            }
        } catch (ex) {
            console.error("Could not select contact.", ex);
        }
    };

    const handleKnockSubmit = async (apartment: string) => {
        if (!currentUser || !currentUser.id) return;
        // In a real app, you'd look up the host by apartment number. Here we'll assign to a mock host.
        const mockHost = allProviders.find(p => p.id === 1)!;
        await onCreateKnock({ 
            hostId: mockHost.id,
            hostName: mockHost.name,
            hostApartment: apartment,
            visitorId: currentUser.id,
            visitorPhone: currentUser.phone!,
            visitDate: new Date().toISOString().split('T')[0],
        });
        setIsSimulating(false);
    }
    
    const handleRegisterPremise = async (name: string) => {
        if (!currentUser || !currentUser.id) return;
        await api.registerPremise(name, currentUser.id);
        setIsRegistering(false);
        alert(`Congratulations! You are now the Superhost for "${name}". Host management features are coming soon.`);
    };

    if (!isAuthenticated) {
        return <div className="p-4 text-center"><button onClick={onAuthClick} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg">Sign in to use Karibu</button></div>;
    }
    if (!('service' in currentUser)) {
        return <div className="p-6 text-center bg-white rounded-lg shadow-md"><p className="mb-4">Please complete your profile to host visitors.</p><button onClick={onGoToSignup} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Create Profile</button></div>;
    }
    
    const getStatusPill = (status: Invitation['status']) => {
        const styles = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-blue-100 text-blue-800',
            Active: 'bg-blue-100 text-blue-800',
            Used: 'bg-green-100 text-green-800',
            Denied: 'bg-red-100 text-red-800',
            Canceled: 'bg-gray-100 text-gray-800',
            Expired: 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
    }
    
    const renderList = (list: Invitation[]) => (
        <div className="space-y-3">
            {list.map(inv => (
                <div key={inv.id} className="bg-white p-3 rounded-lg shadow-sm">
                    {inv.type === 'Knock' && inv.status === 'Pending' ? (
                         <div>
                            <div className="flex items-center gap-3">
                                <img src={inv.visitorAvatar} alt={inv.visitorName} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold">{inv.visitorName}</p>
                                    <p className="text-sm text-gray-600">is at the gate.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button onClick={() => onUpdateInvitationStatus(inv.id, 'Denied')} className="flex-1 bg-red-500 text-white font-bold py-2 rounded-md text-sm">Deny</button>
                                <button onClick={() => onUpdateInvitationStatus(inv.id, 'Approved')} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-md text-sm">Approve</button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800">{inv.visitorName || `+254${inv.visitorPhone}`}</p>
                                <p className="text-xs text-gray-500">{new Date(inv.visitDate).toLocaleDateString()} &bull; {inv.accessCode}</p>
                            </div>
                            {getStatusPill(inv.status)}
                        </div>
                    )}
                </div>
            ))}
            {list.length === 0 && <p className="text-center text-gray-500 py-6">No items here.</p>}
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-full font-sans p-4 space-y-4">
            {isSimulating && <PremiseLandingModal onClose={() => setIsSimulating(false)} onKnock={handleKnockSubmit} isAuthenticated={isAuthenticated} onAuthClick={onAuthClick}/>}
            {isRegistering && <RegisterPremiseModal onClose={() => setIsRegistering(false)} onRegister={handleRegisterPremise} />}
            
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Karibu</h1>
                <p className="text-gray-600">Visitor Management for {currentUser.name}</p>
            </header>
            
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setIsSimulating(true)} className="w-full bg-white p-3 rounded-lg shadow-sm font-semibold text-center hover:bg-gray-100 text-sm">Simulate Visitor</button>
                <button onClick={() => setIsRegistering(true)} className="w-full bg-white p-3 rounded-lg shadow-sm font-semibold text-center hover:bg-gray-100 text-sm">Register Premise</button>
            </div>


            {isInviting ? (
                <form onSubmit={handleInviteSubmit} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                     <h2 className="text-lg font-bold">Invite Guest</h2>
                    <div className="flex items-center gap-2">
                        <input type="tel" value={visitorPhone} onChange={e => setVisitorPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} required placeholder="Visitor Phone (e.g. 722123456)" className="flex-grow p-2 border rounded"/>
                        <button type="button" onClick={handlePickContact} className="p-2 border rounded bg-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </button>
                    </div>
                    <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded"/>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setIsInviting(false)} className="flex-1 bg-gray-200 font-bold py-2 rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 bg-brand-dark text-white font-bold py-2 rounded-lg">Send Invite</button>
                    </div>
                </form>
            ) : (
                 <button onClick={() => setIsInviting(true)} className="w-full bg-brand-dark text-white font-bold py-3 rounded-lg shadow-md">+ Invite Guest</button>
            )}

            <div className="bg-white p-1 rounded-lg shadow-sm flex gap-1">
                <button onClick={() => setView('requests')} className={`flex-1 p-2 rounded-md font-semibold text-sm relative ${view === 'requests' ? 'bg-brand-primary text-white' : 'text-gray-600'}`}>
                    Requests {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full">{pendingRequests.length}</span>}
                </button>
                <button onClick={() => setView('invites')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${view === 'invites' ? 'bg-brand-primary text-white' : 'text-gray-600'}`}>Invites</button>
                <button onClick={() => setView('history')} className={`flex-1 p-2 rounded-md font-semibold text-sm ${view === 'history' ? 'bg-brand-primary text-white' : 'text-gray-600'}`}>History</button>
            </div>
            
            <div>
                {view === 'requests' && renderList(pendingRequests)}
                {view === 'invites' && renderList(activeInvites)}
                {view === 'history' && renderList(history)}
            </div>

            {/* In a real app, this pass would be shown to a visitor after approval, e.g. via a notification link.
                Here we show a user's first approved pass as an example */}
            {myInvitations.find(i => i.status === 'Approved') && (
                <div className="mt-6">
                    <h3 className="font-bold text-center mb-2">My Approved Pass</h3>
                     <div className="flex justify-center">
                        <VisitorPass pass={myInvitations.find(i => i.status === 'Approved')!} />
                     </div>
                </div>
            )}
        </div>
    );
};

export default GatePass;