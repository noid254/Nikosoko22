import React, { useState, useEffect, useMemo, useRef } from 'react';
import ProfileView from './components/ProfileView';
import AuthModal from './components/AuthModal';
import ServiceCard from './components/ServiceCard';
import SignUpView from './components/AddServiceCardView';
import RatingModal from './components/RatingModal';
import SuperAdminDashboard, { AdminPage } from './components/SuperAdminDashboard';
import NotificationModal from './components/NotificationModal';
import InvoiceGenerator from './components/InvoiceGenerator';
import EventsPage from './components/EventsPage';
import GatePass from './components/GatePass';
import MyTicketsView from './components/MyTicketsView';
import CatalogueView from './components/CatalogueView';
import InvoiceHub from './components/InvoiceHub';
import MyDocumentsView from './components/MyDocumentsView';
import QuoteGenerator from './components/QuoteGenerator';
import BusinessAssets from './components/BusinessAssets';
import SearchPage from './components/SearchPage';
import BookingModal from './components/BookingModal';
import ReceiptGenerator from './components/ReceiptGenerator';
import InboxView from './components/InboxView';
import * as api from './services/api';
import { CATEGORIES_DATA } from './constants';
import type { ServiceProvider, Ticket, CatalogueItem, Document, Invitation, BusinessAssets as BusinessAssetsType, SpecialBanner, InboxMessage } from './types';

type ViewMode = 'main' | 'profile' | 'signup' | 'admin' | 'invoice' | 'events' | 'gatepass' | 'contacts' | 'flagged' | 'myTickets' | 'catalogue' | 'invoiceHub' | 'quoteGenerator' | 'myDocuments' | 'search' | 'assets' | 'receiptGenerator' | 'inbox';
type QuickFilter = { type: 'category' | 'service'; value: string } | null;

const JoinSaccoModal: React.FC<{
    provider: ServiceProvider;
    onClose: () => void;
    onSubmit: () => void;
}> = ({ provider, onClose, onSubmit }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center">Join {provider.name}</h2>
                <p className="text-sm text-gray-600 mt-4 text-center">
                    Your request to join will be sent to the leadership for approval. Once approved, your profile will be automatically verified and will feature their official banner.
                </p>
                <div className="flex gap-2 mt-6">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg">Cancel</button>
                    <button onClick={onSubmit} className="flex-1 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg">Confirm Request</button>
                </div>
            </div>
        </div>
    );
};


const ComingSoonModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">Coming Soon!</h2>
            <p className="text-gray-600 mt-2">This feature is under construction. Stay tuned!</p>
            <button onClick={onClose} className="mt-4 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">OK</button>
        </div>
    </div>
);

const TopHeader: React.FC<{
  onMenuClick: () => void;
  onBackClick: () => void;
  viewMode: ViewMode;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasNotification: boolean;
  onNotificationClick: () => void;
  isScrolled: boolean;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onSearchFocus: () => void;
}> = ({ onMenuClick, onBackClick, viewMode, searchTerm, setSearchTerm, hasNotification, onNotificationClick, isScrolled, isAuthenticated, onAuthClick, onSearchFocus }) => {
  
  const isTransparent = viewMode === 'main' && !isScrolled;
  const showHeaderSearch = (viewMode === 'main' && isScrolled) || ['search', 'events'].includes(viewMode);

  const handleProtectedClick = (action: () => void) => {
      if (!isAuthenticated) {
          onAuthClick();
      } else {
          action();
      }
  }

  const searchInput = (
    <div className="relative">
        <input 
            type="text" 
            placeholder={viewMode === 'events' ? "Search events..." : "I am looking for.."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={onSearchFocus}
            autoFocus={viewMode === 'search'}
            className={`w-full py-2 pl-4 pr-10 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary bg-gray-100 text-gray-800 placeholder-gray-500`}
        />
        <svg className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    </div>
  );
  
  const pageTitle = !showHeaderSearch && viewMode !== 'main' 
    ? <h2 className="text-lg font-bold text-gray-800 flex-grow text-center truncate">{viewMode.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h2>
    : null;

  return (
    <header className={`fixed top-0 left-0 right-0 max-w-sm mx-auto z-20 transition-all duration-300 ${!isTransparent ? 'bg-white shadow-md' : 'bg-transparent'}`}>
         <div className="p-3 flex items-center h-[68px] gap-3">
             <div className="flex-shrink-0 w-10 text-left">
                 {viewMode === 'main' ? (
                    <button onClick={onMenuClick} className={`p-2 transition-colors ${isTransparent ? 'text-white' : 'text-gray-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                ) : (
                    <button onClick={onBackClick} className="text-gray-700 p-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}
            </div>

            <div className="flex-grow">
                {showHeaderSearch ? searchInput : pageTitle}
            </div>

            <div className="flex-shrink-0 w-10 text-right">
                <button onClick={() => handleProtectedClick(onNotificationClick)} className={`relative p-2 transition-colors ${isTransparent ? 'text-white' : 'text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {hasNotification && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500" />}
                </button>
            </div>
        </div>
    </header>
  );
};

export const CategoryFilter: React.FC<{
    quickFilter: QuickFilter;
    setQuickFilter: React.Dispatch<React.SetStateAction<QuickFilter>>;
    isAuthenticated: boolean;
    onAuthClick: () => void;
}> = ({ quickFilter, setQuickFilter, isAuthenticated, onAuthClick }) => {
    const [view, setView] = useState<'parents' | 'children'>('parents');
    const [selectedParent, setSelectedParent] = useState<string | null>('Home');

    const handleProtectedClick = (action: () => void) => {
        if (!isAuthenticated) {
            onAuthClick();
        } else {
            action();
        }
    };

    const handleParentClick = (category: string) => {
        setSelectedParent(category);
        setView('children');
        setQuickFilter({ type: 'category', value: category });
    }
    const handleChildClick = (service: string) => {
        setQuickFilter({ type: 'service', value: service });
    }
    const handleBackToParents = () => {
        setView('parents');
        setQuickFilter({type: 'category', value: selectedParent || 'Home' });
    }
    
    const parentButtonClasses = (category: string) => {
        const isActive = selectedParent === category;
        return `px-3 py-1 text-xs font-bold rounded-full flex-shrink-0 border transition-colors ${isActive ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-700 border-gray-200'}`;
    };
    
    const childButtonClasses = (service: string) => {
        const isActive = quickFilter?.type === 'service' && quickFilter?.value === service;
        return `px-3 py-1 text-[11px] font-medium rounded-full flex-shrink-0 transition-colors ${isActive ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-700'}`;
    };

    return (
        <div className="py-2 px-3">
            {view === 'parents' ? (
                 <div className="flex space-x-3 overflow-x-auto no-scrollbar">
                    {Object.keys(CATEGORIES_DATA).map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => handleProtectedClick(() => handleParentClick(cat))}
                            className={parentButtonClasses(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                     <button onClick={() => handleProtectedClick(handleBackToParents)} className={`px-3 py-1 text-[11px] font-medium rounded-full flex-shrink-0 transition-colors bg-gray-200 text-gray-800`}>
                        &larr; All
                    </button>
                    {selectedParent && CATEGORIES_DATA[selectedParent]?.map(subCat => (
                        <button 
                            key={subCat} 
                            onClick={() => handleProtectedClick(() => handleChildClick(subCat))}
                            className={childButtonClasses(subCat)}
                        >
                            #{subCat}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Icons for MainPage Actions ---
const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const GatepassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5-1H11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-1.5m-1 0V9a2 2 0 012-2h2a2 2 0 012 2v1.5m-7.5 4.5v2a2 2 0 002 2h2a2 2 0 002-2v-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" /></svg>;
const EventsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.118 1.94 18 2.684 18 3.5A3.5 3.5 0 0114.5 7H11" /></svg>;


const MainPage: React.FC<{ 
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onInvoiceClick: () => void;
    onEventsClick: () => void;
    onGatepassClick: () => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onSearchClick: () => void;
    isLoading: boolean;
    error: string | null;
}> = ({ providers, onSelectProvider, onInvoiceClick, onEventsClick, onGatepassClick, isAuthenticated, onAuthClick, onSearchClick, isLoading, error }) => {
    
    const mainActions = [
        { name: 'Documents', icon: <InvoiceIcon/>, action: onInvoiceClick },
        { name: 'Events', icon: <EventsIcon/>, action: onEventsClick },
        { name: 'Gatepass', icon: <GatepassIcon/>, action: onGatepassClick },
    ];
    
    const handleProtectedClick = (action: () => void) => {
        if (!isAuthenticated) {
            onAuthClick();
        } else {
            action();
        }
    };
    
    return (
         <div className="bg-gray-100 pb-28 min-h-screen">
            {/* Banner */}
            <div className="relative h-64 bg-brand-dark text-white flex flex-col justify-center items-center text-center p-6">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1599493345842-c423c103eb7c?q=80&w=1974&auto=format&fit=crop')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
                <div className="relative z-10 w-full pt-10">
                    <h1 className="text-5xl font-extrabold tracking-tighter text-white" style={{fontFamily: 'sans-serif'}}>niko</h1>
                    <h1 className="text-5xl font-extrabold tracking-tighter text-white -mt-2" style={{fontFamily: 'sans-serif'}}>soko</h1>
                    <p className="mt-1 text-white/90">Your Gateway to Essential Services.</p>
                </div>
            </div>
            
            <div className="relative p-4 -mt-10 z-10">
                 {/* Floating Search Bar */}
                <div 
                    onClick={onSearchClick}
                    className="bg-white rounded-full shadow-lg flex items-center p-1.5 cursor-pointer border border-gray-200 mb-6"
                >
                    <span className="text-gray-500 flex-grow text-sm pl-4">I am looking for..</span>
                    <div className="bg-brand-primary text-white rounded-full p-2.5 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Tool Box</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {mainActions.map(action => (
                                <button key={action.name} onClick={() => handleProtectedClick(action.action)} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 active:scale-95 text-center">
                                    <div className="bg-gray-100 p-3 rounded-full text-brand-primary">{action.icon}</div>
                                    <h3 className="font-semibold text-gray-800 text-xs">{action.name}</h3>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold text-gray-800">Nearby Services</h2>
                            <button onClick={onSearchClick} className="text-sm font-semibold text-brand-primary hover:underline">View All</button>
                        </div>
                        {isLoading ? (
                             <div className="flex justify-center items-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
                            </div>
                        ) : error ? (
                             <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">
                                <p className="font-semibold">Could not load services</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        ) : (
                             <div className="grid grid-cols-2 gap-4">
                                {providers.map(provider => (
                                    <ServiceCard key={provider.id} provider={provider} onClick={() => onSelectProvider(provider)} />
                                ))}
                                {providers.length === 0 && <p className="col-span-2 text-center text-gray-500 mt-8">No services found. Try adjusting your search.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SavedContactsView: React.FC<{
    allProviders: ServiceProvider[];
    savedContactIds: number[];
    onSelectProvider: (provider: ServiceProvider) => void;
}> = ({ allProviders, savedContactIds, onSelectProvider }) => {
    const savedProviders = useMemo(() => {
        return allProviders.filter(p => savedContactIds.includes(p.id));
    }, [allProviders, savedContactIds]);

    return (
        <div className="p-4">
            {savedProviders.length > 0 ? (
                 <div className="space-y-3">
                    {savedProviders.map(provider => (
                        <button key={provider.id} onClick={() => onSelectProvider(provider)} className="w-full text-left bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                            <img src={provider.avatarUrl} alt={provider.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-grow overflow-hidden">
                                <h3 className="font-bold text-gray-800 truncate">{provider.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{provider.service}</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No saved contacts</h3>
                    <p className="mt-1 text-sm text-gray-500">You can save contacts from their profile page.</p>
                </div>
            )}
        </div>
    );
};

const FlaggedContentPage: React.FC<{
    providers: ServiceProvider[];
    onViewProvider: (provider: ServiceProvider) => void;
    onDeleteProvider: (id: number) => void;
}> = ({ providers, onViewProvider, onDeleteProvider }) => {
    const flaggedProviders = useMemo(() => {
        return providers.filter(p => p.flagCount > 0).sort((a,b) => b.flagCount - a.flagCount);
    }, [providers]);

    return (
        <div className="p-4 space-y-4">
             {flaggedProviders.length > 0 ? (
                flaggedProviders.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
                        <button onClick={() => onViewProvider(p)} className="flex items-center gap-3 text-left">
                            <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-sm text-red-600 font-bold">Flagged {p.flagCount} time{p.flagCount > 1 ? 's' : ''}</p>
                            </div>
                        </button>
                        <button onClick={() => {if(window.confirm(`Delete ${p.name}?`)) onDeleteProvider(p.id)}} className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded-md font-semibold">Delete</button>
                    </div>
                ))
             ) : (
                <p className="text-center text-gray-500 py-16">No flagged content found.</p>
             )}
        </div>
    )
};

const SideMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    onShowProfile: () => void;
    onShowContacts: () => void;
    onShowMyTickets: () => void;
    onShowCatalogue: () => void;
    onLogout: () => void;
    onShowAdminDashboard: () => void;
    onShowFlaggedContent: () => void;
    activeView: ViewMode;
}> = ({ isOpen, onClose, isAuthenticated, isSuperAdmin, onShowProfile, onShowContacts, onShowMyTickets, onShowCatalogue, onLogout, onShowAdminDashboard, onShowFlaggedContent, activeView }) => {
    
    const linkClasses = (views: ViewMode | ViewMode[]) => {
        const viewArray = Array.isArray(views) ? views : [views];
        const isActive = viewArray.includes(activeView);
        return `block w-full text-left px-6 py-3 transition-colors ${isActive ? 'bg-gray-700 text-white font-semibold' : 'text-gray-300 hover:bg-gray-700'}`;
    };

    return (
        <>
            <div 
                className={`fixed top-0 left-0 h-full w-64 bg-brand-dark shadow-xl transform transition-transform duration-200 z-50 overflow-y-auto no-scrollbar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 bg-black/20">
                    <h2 className="text-xl font-bold text-white">Niko Soko</h2>
                </div>
                <nav className="mt-6 flex flex-col h-[calc(100%-100px)] text-white">
                    <div>
                        <button onClick={onShowProfile} className={linkClasses(['profile', 'signup'])}>My Profile</button>
                        <button onClick={onShowContacts} className={linkClasses('contacts')}>My Contacts</button>
                        <button onClick={onShowMyTickets} className={linkClasses('myTickets')}>My Tickets</button>
                        <button onClick={onShowCatalogue} className={linkClasses('catalogue')}>My Catalogue</button>
                        {!isSuperAdmin && <button className={linkClasses([])}>Settings</button>}
                        {isSuperAdmin && (
                            <>
                                <button onClick={onShowFlaggedContent} className={linkClasses('flagged')}>Flagged Content</button>
                                <button 
                                    onClick={onShowAdminDashboard}
                                    className={`block w-full text-left px-6 py-3 font-bold transition-colors ${activeView === 'admin' ? 'bg-yellow-500 text-yellow-900' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'}`}
                                >
                                    ✨ Admin Dashboard
                                </button>
                            </>
                        )}
                    </div>

                    <div className="mt-auto">
                        {isAuthenticated && <button onClick={onLogout} className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 border-t border-gray-700" >Logout</button>}
                    </div>
                </nav>
            </div>
            <div className={`fixed inset-0 z-40 bg-black transition-opacity duration-200 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} onClick={onClose} />
        </>
    );
};


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<ServiceProvider> | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ServiceProvider | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [unratedContacts, setUnratedContacts] = useState<ServiceProvider[]>([]);
  const [providerToRate, setProviderToRate] = useState<ServiceProvider | null>(null);
  const [providerToBook, setProviderToBook] = useState<ServiceProvider | null>(null);
  const [providerToJoin, setProviderToJoin] = useState<ServiceProvider | null>(null);
  const [contactLimitReached, setContactLimitReached] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedContacts, setSavedContacts] = useState<number[]>([]);
  const [flaggedProfiles, setFlaggedProfiles] = useState<number[]>([]);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [allCatalogueItems, setAllCatalogueItems] = useState<CatalogueItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [specialBanners, setSpecialBanners] = useState<SpecialBanner[]>([]);
  
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [myCatalogueItems, setMyCatalogueItems] = useState<CatalogueItem[]>([]);
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [businessAssets, setBusinessAssets] = useState<BusinessAssetsType>({
    name: 'Your Company Name',
    address: '123 Business Rd, Suite 456, Nairobi',
    logo: null,
  });
  const [adminInitialPage, setAdminInitialPage] = useState<AdminPage>('Dashboard');
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollThreshold = 50;
  const hasUnreadMessages = useMemo(() => inboxMessages.some(m => !m.isRead), [inboxMessages]);

  useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [
                providersData, catalogueData, docsData, invitesData, 
                bannersData, inboxData, categoriesData
            ] = await Promise.all([
                api.getProviders(), api.getCatalogueItems(), api.getDocuments(),
                api.getInvitations(), api.getSpecialBanners(), api.getInboxMessages(),
                api.getCategories(),
            ]);
            setProviders(providersData);
            setAllCatalogueItems(catalogueData);
            setMyDocuments(docsData);
            setInvitations(invitesData);
            setSpecialBanners(bannersData);
            setInboxMessages(inboxData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to load initial data", error);
            setError("Failed to connect to the server. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };
    loadInitialData();
}, []);


  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
        setIsScrolled(container.scrollTop > scrollThreshold);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => container.removeEventListener('scroll', handleScroll);
  }, [viewMode]);


  const handleLogin = (data: api.VerifyOtpResponse) => {
    // In a real app, you would save the data.token to localStorage/sessionStorage
    // and use it for authenticated API requests.
    setIsAuthenticated(true);
    setIsSuperAdmin(data.isSuperAdmin);
    
    if (data.user){
        setCurrentUser(data.user);
        setMyTickets(api.MOCK_USER_TICKETS);
        setMyCatalogueItems(allCatalogueItems.filter(item => item.providerId === data.user.id));
        setViewMode('main');
    } else {
        const phone = (document.getElementById('phone') as HTMLInputElement)?.value || 'New User';
        const normalizedPhone = phone.startsWith('0') ? phone.substring(1) : phone;
        const partialUser = {
            id: Date.now(),
            name: 'New User',
            phone,
            whatsapp: `254${normalizedPhone}`,
        };
        setCurrentUser(partialUser);
        setViewMode('signup');
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    setCurrentUser(null);
    setSelectedProfile(null);
    setSideMenuOpen(false);
    setMyTickets([]);
    setMyCatalogueItems([]);
    setAdminInitialPage('Dashboard');
    setViewMode('main');
  }

  const handleUpdateProvider = async (updatedProfile: ServiceProvider) => {
    const result = await api.updateProvider(updatedProfile);
    setProviders(prev => prev.map(p => p.id === result.id ? result : p));
    if (currentUser && currentUser.id === result.id) {
        setCurrentUser(result);
    }
    if (selectedProfile && selectedProfile.id === result.id) {
        setSelectedProfile(result);
    }
  }

  const handleDeleteProvider = async (providerId: number) => {
    await api.deleteProvider(providerId);
    setProviders(prev => prev.filter(p => p.id !== providerId));
    if (selectedProfile && selectedProfile.id === providerId) {
        setSelectedProfile(null);
        setViewMode('main');
    }
  };

  const handleFlagProvider = (providerId: number, reason: string) => {
    if (flaggedProfiles.includes(providerId)) return;
    
    setFlaggedProfiles(prev => [...prev, providerId]);
    
    const updatedProviders = providers.map(p => 
        p.id === providerId ? { ...p, flagCount: p.flagCount + 1 } : p
    );
    setProviders(updatedProviders);
    
    if (selectedProfile && selectedProfile.id === providerId) {
        setSelectedProfile(prev => prev ? { ...prev, flagCount: prev.flagCount + 1 } : null);
    }
    
    alert(`Thank you for your report. The profile has been flagged for: "${reason}".`);
  };

  const handleShowMyProfile = () => {
      setSideMenuOpen(false);
      if (isAuthenticated && currentUser) {
          if ('service' in currentUser) { 
            setSelectedProfile(currentUser as ServiceProvider);
            setViewMode('profile');
          } else { 
            setViewMode('signup');
          }
      } else {
          setAuthModalOpen(true);
      }
  }
  
    const handleSelectProvider = (provider: ServiceProvider) => {
      if (!isAuthenticated) {
          setAuthModalOpen(true);
          return;
      }
      setSelectedProfile(provider);
      setViewMode('profile');
  };

  const handleProfileCreation = async (
      profileData: Omit<ServiceProvider, 'id' | 'name' | 'phone' | 'whatsapp' | 'flagCount' | 'views' | 'coverImageUrl' | 'isVerified' | 'cta'>,
      name: string,
      avatar: string | null,
      referralCode: string,
      cta: ServiceProvider['cta'],
  ) => {
      if (!currentUser) return;

      const newCategoryName = profileData.category;
      if (newCategoryName && !categories.find(c => c.toLowerCase() === newCategoryName.toLowerCase())) {
          setCategories(prev => [...prev, newCategoryName].sort());
      }
      
      let isVerified = false;
      let coverImageUrl = api.DEFAULT_BANNERS[profileData.category] || 'https://picsum.photos/seed/defaultcover/600/400';
      let category = profileData.category;

      const code = referralCode.toUpperCase();
      if (api.REFERRAL_CODES[code]) {
          isVerified = api.REFERRAL_CODES[code].isVerified;
          coverImageUrl = api.REFERRAL_CODES[code].banner;
          category = api.REFERRAL_CODES[code].category;
      }

      const newUser: ServiceProvider = {
          ...currentUser,
          name,
          ...profileData,
          category,
          avatarUrl: avatar || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/100/100`,
          coverImageUrl,
          isVerified,
          cta,
          flagCount: 0,
          views: 0,
      } as ServiceProvider;
      
      const createdUser = await api.createProvider(newUser);
      setProviders(prev => [...prev.filter(p => p.id !== createdUser.id), createdUser]);
      setCurrentUser(createdUser);
      setViewMode('profile');
      setSelectedProfile(createdUser);
  }
  
    const handleInitiateContact = (provider: ServiceProvider): boolean => {
      if (!isAuthenticated) {
          setAuthModalOpen(true);
          return false;
      }
      if (unratedContacts.length >= 5) {
          setProviderToRate(unratedContacts[0]);
          setContactLimitReached(true);
          return false; 
      }

      if (!unratedContacts.find(p => p.id === provider.id)) {
          setUnratedContacts(prev => [...prev, provider]);
      }
      return true; 
  };
  
  const handleSubmitRating = (ratedProvider: ServiceProvider, rating: number) => {
    console.log(`Rated ${ratedProvider.name} with ${rating} stars.`);
    setUnratedContacts(prev => prev.filter(p => p.id !== ratedProvider.id));
    setProviderToRate(null);
    setContactLimitReached(false);
  };
  
  const handleBack = () => {
      if (['invoice', 'quoteGenerator', 'myDocuments', 'assets', 'receiptGenerator'].includes(viewMode)) {
          setViewMode('invoiceHub');
          return;
      }
      if (['invoiceHub', 'search', 'inbox'].includes(viewMode)) {
          setViewMode('main');
          return;
      }

      if (viewMode === 'profile' && selectedProfile) {
          const justContactedProvider = unratedContacts.find(p => p.id === selectedProfile.id);
          if (justContactedProvider && !providerToRate) {
              setProviderToRate(justContactedProvider);
          }
      }
      setSelectedProfile(null);
      if (viewMode === 'flagged' || viewMode === 'events') {
          setViewMode('main'); 
      } else if (viewMode !== 'main') {
          setViewMode('main');
      }
  }

  const handleBroadcast = (message: string, filters: Record<string, string>) => {
      const newMessage: InboxMessage = {
          id: Date.now(),
          from: 'Nikosoko Team',
          subject: 'Admin Broadcast',
          body: message,
          timestamp: new Date().toISOString(),
          isRead: false,
      };
      setInboxMessages(prev => [newMessage, ...prev]);
      
      setNotification({
        title: "Broadcast Sent",
        message: "Your message has been delivered to all user inboxes."
      });
  };

  const handleToggleSaveContact = (providerId: number) => {
    setSavedContacts(prev => prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId]);
  };
  
  const handleTicketAcquired = (newTicket: Ticket) => {
    setMyTickets(prev => [...prev, newTicket]);
    setNotification({
      title: 'Ticket Confirmed!',
      message: `Your ticket for "${newTicket.eventName}" is now available in "My Tickets".`
    });
  };

  const handleAddBanner = (banner: Omit<SpecialBanner, 'id'>) => {
      const newBanner: SpecialBanner = {
          id: Date.now(),
          ...banner,
      };
      setSpecialBanners(prev => [newBanner, ...prev]);
  };

  const handleDeleteBanner = (bannerId: number) => {
      setSpecialBanners(prev => prev.filter(b => b.id !== bannerId));
  };
  
  const handleCreateOrganization = async (orgData: any) => {
        const newOrg: ServiceProvider = {
            id: Date.now(),
            name: orgData.name,
            phone: 'N/A',
            service: orgData.service,
            avatarUrl: orgData.avatarUrl || `https://picsum.photos/seed/${orgData.name.replace(/\s/g, '')}/100/100`,
            coverImageUrl: orgData.coverImageUrl || 'https://picsum.photos/seed/defaultcover/600/400',
            rating: 5.0,
            distanceKm: 0,
            hourlyRate: 0,
            rateType: 'per task',
            currency: 'Ksh',
            isVerified: true,
            about: orgData.about,
            works: [],
            category: orgData.category || 'Transport',
            location: orgData.location,
            isOnline: true,
            accountType: 'organization',
            profileType: 'group',
            flagCount: 0,
            views: 0,
            cta: ['call', 'join'],
            leaders: orgData.leaders,
            joinRequests: [],
            members: [],
        };
        const createdOrg = await api.createProvider(newOrg);
        setProviders(prev => [createdOrg, ...prev]);
        setNotification({ title: 'Organization Created', message: `${orgData.name} has been added.` });
    };

    const handleJoinRequestSubmit = (organizationId: number) => {
        if (!currentUser || !currentUser.id || !currentUser.name || !currentUser.phone) return;

        setProviders(prev => prev.map(p => {
            if (p.id === organizationId) {
                const newRequest = {
                    userId: currentUser.id!,
                    userName: currentUser.name!,
                    userPhone: currentUser.phone!,
                    status: 'pending' as const,
                    approvals: [],
                    rejections: [],
                };
                const existingRequests = p.joinRequests || [];
                if (existingRequests.some(r => r.userId === newRequest.userId && r.status === 'pending')) {
                    setNotification({ title: "Request Already Sent", message: "You already have a pending request to join this group." });
                    return p;
                }
                setNotification({ title: "Request Sent", message: "Your request to join has been sent to the SACCO leadership for approval." });
                return { ...p, joinRequests: [...existingRequests, newRequest] };
            }
            return p;
        }));
        setProviderToJoin(null);
    };

    const handleApproveJoinRequest = (organizationId: number, userId: number, isReject = false) => {
        const organization = providers.find(p => p.id === organizationId);
        const userToUpdate = providers.find(p => p.id === userId);

        if (!organization || !userToUpdate) return;
        
        let updatedUser = { ...userToUpdate };
        let updatedOrganization = { ...organization };

        if (isReject) {
            updatedOrganization = {
                ...organization,
                joinRequests: (organization.joinRequests || []).map(req => 
                    req.userId === userId ? { ...req, status: 'rejected' as const } : req
                ),
            };
            setNotification({ title: "Member Rejected", message: `${userToUpdate.name}'s request was rejected.` });
        } else {
             updatedUser = {
                ...userToUpdate,
                isVerified: true,
                coverImageUrl: organization.coverImageUrl,
            };
            const newMember = {
                id: userToUpdate.id, name: userToUpdate.name, avatarUrl: userToUpdate.avatarUrl,
                rating: userToUpdate.rating, distanceKm: userToUpdate.distanceKm, hourlyRate: userToUpdate.hourlyRate,
                rateType: userToUpdate.rateType, phone: userToUpdate.phone, whatsapp: userToUpdate.whatsapp,
                isOnline: userToUpdate.isOnline,
            };
            updatedOrganization = {
                ...organization,
                members: [...(organization.members || []), newMember],
                joinRequests: (organization.joinRequests || []).map(req => 
                    req.userId === userId ? { ...req, status: 'approved' as const } : req
                ),
            };
            setNotification({ title: "Member Approved", message: `${userToUpdate.name} is now a member of ${organization.name}.` });
        }
        
        setProviders(prev => prev.map(p => {
            if (p.id === organizationId) return updatedOrganization;
            if (p.id === userId) return updatedUser;
            return p;
        }));
    };

    const handleSaccoVoteAction = (organizationId: number, userId: number, action: 'approve' | 'deny', leaderPhone: string) => {
      setNotification({ title: "Coming Soon", message: "Full voting functionality from the inbox is being finalized. For now, please coordinate with other leaders and have an admin approve the request from the Admin Dashboard." });
    };

    const handleCreateInvitation = async (data: Omit<Invitation, 'id' | 'status' | 'accessCode' | 'hostName'>) => {
        const newInvitation = await api.createInvitation(data);
        setInvitations(prev => [newInvitation, ...prev]);
    };

    const handleUpdateInvitationStatus = async (id: string, status: 'Canceled' | 'Used') => {
        const updatedInvitation = await api.updateInvitation(id, status);
        setInvitations(prev => prev.map(inv => inv.id === id ? updatedInvitation : inv));
    };

  const profileCatalogueItems = useMemo(() => {
    if (!selectedProfile) return [];
    return allCatalogueItems.filter(item => item.providerId === selectedProfile.id);
  }, [allCatalogueItems, selectedProfile]);

  const filteredProviders = useMemo(() => {
    let filtered = providers;

    if (quickFilter) {
        filtered = filtered.filter(p => {
            if (quickFilter.type === 'category') {
                return p.category === quickFilter.value;
            }
            if (quickFilter.type === 'service') {
                return p.service === quickFilter.value;
            }
            return true;
        });
    }

    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    const sorted = [...filtered].sort((a, b) => a.distanceKm - b.distanceKm);
    return sorted;
  }, [searchTerm, quickFilter, providers]);

  if (viewMode === 'admin') {
    return <SuperAdminDashboard
        onBack={() => {
            setAdminInitialPage('Dashboard');
            setViewMode('main');
        }}
        providers={providers}
        onUpdateProvider={handleUpdateProvider}
        onDeleteProvider={handleDeleteProvider}
        onViewProvider={handleSelectProvider}
        categories={categories}
        onAddCategory={(name) => setCategories(prev => [...prev, name].sort())}
        onDeleteCategory={(name) => setCategories(prev => prev.filter(c => c !== name))}
        onBroadcast={handleBroadcast}
        initialPage={adminInitialPage}
        specialBanners={specialBanners}
        onAddBanner={handleAddBanner}
        onDeleteBanner={handleDeleteBanner}
        onCreateOrganization={handleCreateOrganization}
        onApproveRequest={(orgId, userId) => handleApproveJoinRequest(orgId, userId, false)}
        onRejectRequest={(orgId, userId) => handleApproveJoinRequest(orgId, userId, true)}
    />
  }

  const renderContent = () => {
    const headerHeight = 68;
    const wrapInPadding = (component: React.ReactNode) => <div style={{ paddingTop: `${headerHeight}px` }}>{component}</div>;

    switch(viewMode) {
      case 'inbox':
        return wrapInPadding(<InboxView 
            messages={inboxMessages} 
            onUpdateMessages={setInboxMessages}
            currentUserPhone={currentUser?.phone}
            allProviders={providers}
            onAction={handleSaccoVoteAction}
        />);
      case 'search':
        return wrapInPadding(<SearchPage 
          providers={filteredProviders}
          onSelectProvider={handleSelectProvider}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setAuthModalOpen(true)}
        />);
      case 'invoiceHub':
        return wrapInPadding(<InvoiceHub 
            onNavigate={(view) => setViewMode(view as ViewMode)}
        />);
      case 'assets':
        return wrapInPadding(<BusinessAssets assets={businessAssets} onSave={setBusinessAssets} />);
      case 'myDocuments':
        return wrapInPadding(<MyDocumentsView documents={myDocuments} />);
      case 'receiptGenerator':
        return wrapInPadding(<ReceiptGenerator assets={businessAssets} />);
      case 'quoteGenerator':
        return wrapInPadding(<QuoteGenerator assets={businessAssets} />);
      case 'invoice':
        return wrapInPadding(<InvoiceGenerator assets={businessAssets} />);
      case 'events':
        return wrapInPadding(<EventsPage 
            isAuthenticated={isAuthenticated} 
            onAuthClick={() => setAuthModalOpen(true)}
            onTicketAcquired={handleTicketAcquired}
            currentUser={currentUser}
            searchTerm={searchTerm}
        />);
      case 'gatepass':
        return wrapInPadding(<GatePass
          currentUser={currentUser}
          isSuperAdmin={isSuperAdmin}
          isAuthenticated={isAuthenticated}
          invitations={invitations}
          onCreateInvitation={handleCreateInvitation}
          onUpdateInvitationStatus={handleUpdateInvitationStatus}
          onAuthClick={() => setAuthModalOpen(true)}
          onGoToSignup={() => setViewMode('signup')}
        />);
      case 'contacts':
        return wrapInPadding(<SavedContactsView 
            allProviders={providers} 
            savedContactIds={savedContacts} 
            onSelectProvider={handleSelectProvider} 
        />);
      case 'flagged':
        return wrapInPadding(<FlaggedContentPage 
            providers={providers}
            onViewProvider={handleSelectProvider}
            onDeleteProvider={handleDeleteProvider}
        />);
      case 'myTickets':
        return wrapInPadding(<MyTicketsView tickets={myTickets} />);
      case 'catalogue':
        return wrapInPadding(<CatalogueView 
            items={myCatalogueItems} 
            onUpdateItems={setMyCatalogueItems} 
            currentUser={currentUser as ServiceProvider}
            onUpdateUser={handleUpdateProvider}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setAuthModalOpen(true)}
            onInitiateContact={handleInitiateContact}
        />);
      case 'signup':
        return <SignUpView
            onBack={handleBack} onSave={handleProfileCreation} categories={categories}
            currentUser={currentUser}
        />
      case 'profile':
        if (selectedProfile) {
          return <ProfileView 
              profileData={selectedProfile} 
              isOwner={!!(currentUser && currentUser.id === selectedProfile.id)}
              isAuthenticated={isAuthenticated} isSuperAdmin={isSuperAdmin} onBack={handleBack}
              onLogout={handleLogout} onUpdate={handleUpdateProvider} onDelete={handleDeleteProvider}
              onContactClick={() => setAuthModalOpen(true)}
              onInitiateContact={handleInitiateContact}
              savedContacts={savedContacts}
              onToggleSaveContact={handleToggleSaveContact}
              catalogueItems={profileCatalogueItems}
              onBook={(provider) => setProviderToBook(provider)}
              onJoin={(provider) => setProviderToJoin(provider)}
              isFlaggedByUser={flaggedProfiles.includes(selectedProfile.id)}
              onFlag={(reason) => handleFlagProvider(selectedProfile.id, reason)}
              currentUserPhone={currentUser?.phone}
          />;
        }
        return null;
      case 'main':
      default:
        return <>
            <MainPage 
                providers={filteredProviders.slice(0, 6)}
                onSelectProvider={handleSelectProvider}
                onInvoiceClick={() => setViewMode('invoiceHub')}
                onEventsClick={() => setViewMode('events')}
                onGatepassClick={() => setViewMode('gatepass')}
                isAuthenticated={isAuthenticated}
                onAuthClick={() => setAuthModalOpen(true)}
                onSearchClick={() => setViewMode('search')}
                isLoading={isLoading}
                error={error}
            />
        </>
    }
  }

  const showHeader = !['signup', 'profile'].includes(viewMode);

  return (
    <div ref={mainContainerRef} className="max-w-sm mx-auto bg-white font-sans h-screen overflow-y-auto overflow-x-hidden relative shadow-2xl no-scrollbar">
      <SideMenu 
          isOpen={isSideMenuOpen} onClose={() => setSideMenuOpen(false)}
          isAuthenticated={isAuthenticated} isSuperAdmin={isSuperAdmin}
          onShowProfile={handleShowMyProfile} onLogout={handleLogout}
          onShowContacts={() => { setViewMode('contacts'); setSideMenuOpen(false); }}
          onShowMyTickets={() => { setViewMode('myTickets'); setSideMenuOpen(false); }}
          onShowCatalogue={() => { setViewMode('catalogue'); setSideMenuOpen(false); }}
          onShowAdminDashboard={() => { setViewMode('admin'); setSideMenuOpen(false); }}
          onShowFlaggedContent={() => { setViewMode('flagged'); setSideMenuOpen(false); }}
          activeView={viewMode}
      />
      
      {showHeader && (
          <TopHeader 
            onMenuClick={() => setSideMenuOpen(true)} 
            onBackClick={handleBack}
            viewMode={viewMode}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            hasNotification={hasUnreadMessages} onNotificationClick={() => setViewMode('inbox')}
            isScrolled={isScrolled}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setAuthModalOpen(true)}
            onSearchFocus={() => { if(viewMode !== 'search') setViewMode('search'); }}
          />
      )}
      
      <main className="pb-20">
          {renderContent()}
      </main>
      
      {!isAuthenticated && !isAuthModalOpen && (
        <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto p-4 z-30 bg-gradient-to-t from-white to-transparent pointer-events-none">
            <div className="pointer-events-auto">
                <button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-brand-dark text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-gray-700 transition-transform hover:scale-105 w-full"
                >
                Sign in to continue
                </button>
            </div>
        </div>
      )}

      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} />}
      {providerToRate && (
        <RatingModal
            provider={providerToRate} onClose={() => setProviderToRate(null)}
            onSubmit={(rating) => handleSubmitRating(providerToRate, rating)}
            onNeverHappened={() => { setUnratedContacts(prev => prev.filter(p => p.id !== providerToRate.id)); setProviderToRate(null); }}
            limitReached={contactLimitReached}
        />
      )}
       {providerToBook && (
        <BookingModal
          provider={providerToBook}
          onClose={() => setProviderToBook(null)}
        />
      )}
      {providerToJoin && (
        <JoinSaccoModal
            provider={providerToJoin}
            onClose={() => setProviderToJoin(null)}
            onSubmit={() => handleJoinRequestSubmit(providerToJoin.id)}
        />
      )}
      {notification && (
        <NotificationModal
            title={notification.title}
            message={notification.message}
            onClose={() => setNotification(null)}
        />
      )}
       {isComingSoonModalOpen && <ComingSoonModal onClose={() => setIsComingSoonModalOpen(false)} />}
    </div>
  );
}

export default App;