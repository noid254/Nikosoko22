import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Invitation, ServiceProvider, Ticket } from '../types';

type GatePassForInvitations = {
    currentUser: Partial<ServiceProvider> | null;
    isSuperAdmin: boolean;
    isAuthenticated: boolean;
    invitations: Invitation[];
    onCreateInvitation: (data: Omit<Invitation, 'id' | 'status' | 'accessCode' | 'hostName'>) => Promise<void>;
    onUpdateInvitationStatus: (id: string, status: 'Canceled' | 'Used') => Promise<void>;
    onAuthClick: () => void;
    onGoToSignup: () => void;
    ticket?: never;
};

type GatePassForTicket = {
    ticket: Ticket;
    currentUser?: never;
    isSuperAdmin?: never;
    isAuthenticated?: never;
    invitations?: never;
    onCreateInvitation?: never;
    onUpdateInvitationStatus?: never;
    onAuthClick?: never;
    onGoToSignup?: never;
};

type GatePassProps = GatePassForInvitations | GatePassForTicket;

const IdentityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>;
const UserRoleTag: React.FC<{role: string}> = ({ role }) => {
    const roleColor = role === 'Superhost' ? 'bg-green-500' : 'bg-blue-500';
    return <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${roleColor}`}>{role}</span>
};

const QRScannerModal: React.FC<{
    onClose: () => void;
    onScan: (accessCode: string) => void;
    activeInvitations: Invitation[];
}> = ({ onClose, onScan, activeInvitations }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanResult, setScanResult] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Mock scanning
                    setTimeout(() => {
                        if (activeInvitations.length > 0) {
                            const codeToScan = activeInvitations[0].accessCode;
                            setScanResult(`Success! Scanned code: ${codeToScan}`);
                            onScan(codeToScan);
                            setTimeout(onClose, 2000); // Close modal after success message
                        } else {
                            setScanResult('No active passes to scan.');
                            setTimeout(onClose, 2000);
                        }
                    }, 3000);
                }
            } catch (err) {
                setError('Could not access camera. Please check permissions.');
                console.error("Camera Error:", err);
            }
        };
        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [activeInvitations, onScan, onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center z-50 p-4">
            <div className="bg-white p-4 rounded-lg text-center max-w-sm w-full">
                <h2 className="text-xl font-bold mb-2">QR Code Scanner</h2>
                <div className="relative w-full aspect-square bg-gray-900 rounded-md overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                    <div className="absolute inset-0 border-4 border-green-500/50 rounded-md"></div>
                    {error && <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white p-4">{error}</div>}
                </div>
                <p className="mt-4 text-gray-700 h-5">{scanResult || 'Point camera at visitor\'s QR code...'}</p>
                <button onClick={onClose} className="mt-4 bg-gray-200 px-4 py-2 rounded-lg w-full">Cancel</button>
            </div>
        </div>
    );
};


const TicketView: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs font-sans text-gray-800">
            {/* Top Part */}
            <div className="p-6 border-b-2 border-dashed border-gray-300">
                <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">{new Date(ticket.eventDate).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                <h2 className="text-2xl font-bold mt-1">{ticket.eventName}</h2>
                <div className="mt-4 text-sm space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{new Date(ticket.eventDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{ticket.eventLocation}</span>
                    </div>
                </div>
            </div>
            {/* Bottom Part */}
            <div className="p-6 text-center">
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.qrCodeData)}`}
                    alt="Ticket QR Code"
                    className="w-40 h-40 mx-auto rounded-lg"
                />
                <p className="font-semibold mt-4 text-lg">{ticket.userName}</p>
                <p className="text-xs text-gray-500 mt-1">{ticket.id}</p>
                <div className="mt-4 opacity-70">
                    <svg className="h-8 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 30" preserveAspectRatio="none">
                      <rect x="0" y="5" width="2" height="20" fill="black" />
                      <rect x="4" y="5" width="2" height="20" fill="black" />
                      <rect x="8" y="5" width="4" height="20" fill="black" />
                      <rect x="14" y="5" width="2" height="20" fill="black" />
                      <rect x="20" y="5" width="4" height="20" fill="black" />
                      <rect x="26" y="5" width="2" height="20" fill="black" />
                      <rect x="30" y="5" width="2" height="20" fill="black" />
                      <rect x="36" y="5" width="4" height="20" fill="black" />
                      <rect x="42" y="5" width="2" height="20" fill="black" />
                      <rect x="48" y="5" width="2" height="20" fill="black" />
                      <rect x="52" y="5" width="4" height="20" fill="black" />
                      <rect x="58" y="5" width="2" height="20" fill="black" />
                      <rect x="64" y="5" width="4" height="20" fill="black" />
                      <rect x="70" y="5" width="2" height="20" fill="black" />
                      <rect x="74" y="5" width="2" height="20" fill="black" />
                      <rect x="80" y="5" width="4" height="20" fill="black" />
                      <rect x="86" y="5" width="2" height="20" fill="black" />
                      <rect x="90" y="5" width="2" height="20" fill="black" />
                      <rect x="94" y="5" width="4" height="20" fill="black" />
                      <rect x="100" y="5" width="2" height="20" fill="black" />
                      <rect x="106" y="5" width="4" height="20" fill="black" />
                      <rect x="112" y="5" width="2" height="20" fill="black" />
                      <rect x="116" y="5" width="2" height="20" fill="black" />
                      <rect x="122" y="5" width="4" height="20" fill="black" />
                      <rect x="128" y="5" width="2" height="20" fill="black" />
                      <rect x="132" y="5" width="2" height="20" fill="black" />
                      <rect x="136" y="5" width="4" height="20" fill="black" />
                      <rect x="142" y="5" width="2" height="20" fill="black" />
                      <rect x="148" y="5" width="2" height="20" fill="black" />
                      <rect x="152" y="5" width="4" height="20" fill="black" />
                      <rect x="158" y="5" width="2" height="20" fill="black" />
                      <rect x="164" y="5" width="4" height="20" fill="black" />
                      <rect x="170" y="5" width="2" height="20" fill="black" />
                      <rect x="174" y="5" width="2" height="20" fill="black" />
                      <rect x="180" y="5" width="4" height="20" fill="black" />
                      <rect x="186" y="5" width="2" height="20" fill="black" />
                       <rect x="190" y="5" width="2" height="20" fill="black" />
                      <rect x="194" y="5" width="4" height="20" fill="black" />
                      <rect x="200" y="5" width="2" height="20" fill="black" />
                      <rect x="206" y="5" width="4" height="20" fill="black" />
                      <rect x="212" y="5" width="2" height="20" fill="black" />
                      <rect x="216" y="5" width="2" height="20" fill="black" />
                      <rect x="222" y="5" width="4" height="20" fill="black" />
                      <rect x="228" y="5" width="2" height="20" fill="black" />
                      <rect x="232" y="5" width="4" height="20" fill="black" />
                      <rect x="238" y="5" width="2" height="20" fill="black" />
                      <rect x="242" y="5" width="2" height="20" fill="black" />
                      <rect x="246" y="5" width="4" height="20" fill="black" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

const GatePass: React.FC<GatePassProps> = (props) => {
    if (props.ticket) {
        return <TicketView ticket={props.ticket} />;
    }

    const { currentUser, isSuperAdmin, isAuthenticated, invitations, onCreateInvitation, onUpdateInvitationStatus, onAuthClick, onGoToSignup } = props;
    const [visitorPhone, setVisitorPhone] = useState('');
    const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userRole = isSuperAdmin ? 'Superhost' : (isAuthenticated ? 'Host' : 'Visitor');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !currentUser.id || !onCreateInvitation) return;

        if (!/^\d{9,10}$/.test(visitorPhone)) {
            alert("Please enter a valid 9 or 10 digit phone number.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            await onCreateInvitation({
                hostId: currentUser.id,
                visitorPhone,
                visitDate,
            });
            setVisitorPhone('');
        } catch(error) {
            console.error("Failed to create invitation:", error);
            alert("Could not create invitation. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleCancelInvitation = async (id: string) => {
        if(window.confirm('Are you sure you want to cancel this invitation?') && onUpdateInvitationStatus) {
            try {
                await onUpdateInvitationStatus(id, 'Canceled');
            } catch(error) {
                console.error("Failed to cancel invitation:", error);
                alert("Could not cancel invitation. Please try again.");
            }
        }
    };
    
    const handleScanSuccess = async (scannedCode: string) => {
        if (!onUpdateInvitationStatus) return;
        const invitation = invitations.find(inv => inv.accessCode === scannedCode && inv.status === 'Active');
        if (invitation) {
            try {
                await onUpdateInvitationStatus(invitation.id, 'Used');
                alert(`Invitation for ${invitation.visitorPhone} successfully verified.`);
            } catch(error) {
                alert("Failed to update invitation status.");
            }
        } else {
            alert(`Invalid or already used code: ${scannedCode}`);
        }
        setIsScanning(false);
    };

    const dashboardInvitations = useMemo(() => {
        if (userRole === 'Superhost') {
            return invitations;
        }
        if (userRole === 'Host' && currentUser?.id) {
            return invitations.filter(inv => inv.hostId === currentUser.id);
        }
        return [];
    }, [userRole, invitations, currentUser]);

    const getStatusColor = (status: Invitation['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800';
            case 'Canceled': return 'bg-red-100 text-red-800';
            case 'Used': return 'bg-gray-100 text-gray-800';
        }
    }
    
    if (!isAuthenticated) {
        return (
            <div className="p-4 text-center">
                <button onClick={onAuthClick} className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg">
                    Please sign in to manage invitations.
                </button>
            </div>
        )
    }

    if (isAuthenticated && currentUser && !('service' in currentUser)) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <h2 className="text-lg font-bold text-gray-800">Verification Required</h2>
                <p className="text-gray-600 my-3">To use the Gate Pass feature, you need a verified identity. Please complete your service provider profile.</p>
                <button
                    onClick={onGoToSignup}
                    className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Create Profile
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-full font-sans p-4 space-y-6">
            {isScanning && (
                <QRScannerModal 
                    onClose={() => setIsScanning(false)} 
                    onScan={handleScanSuccess}
                    activeInvitations={dashboardInvitations.filter(i => i.status === 'Active')}
                />
            )}
            <header className="bg-brand-dark p-4 rounded-xl shadow-lg text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Gate Pass System</h1>
                        <p className="text-sm text-gray-300">Welcome, {currentUser?.name}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-full"><IdentityIcon /></div>
                </div>
                 <div className="mt-2"><UserRoleTag role={userRole} /></div>
            </header>
            
            {(userRole === 'Host' || userRole === 'Superhost') && (
                 <div className="bg-white p-4 rounded-xl shadow-md">
                    <button onClick={() => setIsScanning(true)} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5-1H11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-1.5m-1 0V9a2 2 0 012-2h2a2 2 0 012 2v1.5m-7.5 4.5v2a2 2 0 002 2h2a2 2 0 002-2v-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" /></svg>
                        Scan QR Pass
                    </button>
                 </div>
            )}

            {(userRole === 'Host' || userRole === 'Superhost') && (
                 <div className="bg-white p-4 rounded-xl shadow-md">
                     <h2 className="text-lg font-bold text-gray-800 mb-4">Create New Invitation</h2>
                     <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                             <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Visitor's Phone Number</label>
                             <div className="flex items-center mt-1 border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-brand-primary">
                                 <span className="pl-3 text-gray-500">+254</span>
                                 <input type="tel" id="phone" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} required placeholder="722123456" className="block w-full pl-1 pr-3 py-2 border-0 rounded-md focus:outline-none focus:ring-0 sm:text-sm"/>
                             </div>
                         </div>
                         <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Visit Date</label>
                            <input type="date" id="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"/>
                         </div>
                         <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400">
                            {isSubmitting ? 'Generating...' : 'Generate Access Code'}
                         </button>
                     </form>
                 </div>
            )}
            
            {(userRole === 'Host' || userRole === 'Superhost') && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">{userRole === 'Superhost' ? 'All Invitations' : 'My Invitations'}</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {dashboardInvitations.length > 0 ? dashboardInvitations.map(inv => (
                            <div key={inv.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">Code: {inv.accessCode}</p>
                                        <p className="text-sm text-gray-600">Visitor: +254{inv.visitorPhone}</p>
                                        {userRole === 'Superhost' && <p className="text-xs text-gray-500">Host: {inv.hostName}</p>}
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(inv.status)}`}>{inv.status}</span>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <p className="text-xs text-gray-500">Date: {new Date(inv.visitDate).toLocaleDateString()}</p>
                                    {inv.status === 'Active' && (
                                        <button onClick={() => handleCancelInvitation(inv.id)} className="text-xs bg-red-500 text-white font-semibold px-2 py-1 rounded-md hover:bg-red-600">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : <p className="text-sm text-gray-500 text-center py-4">No invitations found.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GatePass;