import React, { useState, useMemo, useEffect } from 'react';
import type { ServiceProvider, SpecialBanner } from '../types';

interface SuperAdminDashboardProps {
    onBack: () => void;
    providers: ServiceProvider[];
    onUpdateProvider: (provider: ServiceProvider) => void;
    onDeleteProvider: (providerId: number) => void;
    onViewProvider: (provider: ServiceProvider) => void;
    categories: string[];
    onAddCategory: (name: string) => void;
    onDeleteCategory: (name:string) => void;
    onBroadcast: (message: string, filters: Record<string, string>) => void;
    initialPage?: AdminPage;
    specialBanners: SpecialBanner[];
    onAddBanner: (banner: Omit<SpecialBanner, 'id'>) => void;
    onDeleteBanner: (bannerId: number) => void;
    onCreateOrganization: (orgData: any) => void;
}

export type AdminPage = 'Dashboard' | 'Users' | 'Analytics' | 'Appearance' | 'Broadcast' | 'Categories' | 'Organizations';

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, change: string, onClick?: () => void }> = ({ title, value, icon, change, onClick }) => (
    <div onClick={onClick} className={`bg-white p-6 rounded-lg shadow ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 transition-transform' : ''}`}>
        <div className="flex items-start justify-between">
            <div className="flex flex-col space-y-2">
                <span className="text-gray-500 font-medium">{title}</span>
                <span className="text-3xl font-bold text-gray-800">{value}</span>
            </div>
            <div className="p-3 bg-gray-100 rounded-full text-brand-primary">
                {icon}
            </div>
        </div>
        <p className="text-sm text-green-500 mt-2">{change}</p>
    </div>
);

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
    onBack, providers, onUpdateProvider, onDeleteProvider, onViewProvider, categories, onAddCategory, onDeleteCategory, onBroadcast, initialPage, specialBanners, onAddBanner, onDeleteBanner, onCreateOrganization
}) => {
    const [activePage, setActivePage] = useState<AdminPage>(initialPage || 'Dashboard');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState<'All' | 'Verified' | 'Unverified'>('All');
    
    // Broadcast filter state
    const [broadcastLocation, setBroadcastLocation] = useState('All');
    const [broadcastCategory, setBroadcastCategory] = useState('All');
    const [broadcastRating, setBroadcastRating] = useState('All');
    
    // Appearance (Banner) Form State
    const [newBanner, setNewBanner] = useState<Omit<SpecialBanner, 'id'>>({ imageUrl: '' });
    
    const uniqueLocations = useMemo(() => ['All', ...Array.from(new Set(providers.map(p => p.location.split(',').pop()?.trim()).filter(Boolean)))], [providers]);
    const uniqueCategoriesForBroadcast = useMemo(() => ['All', ...categories], [categories]);
    const ratingOptions = ['All', 'Above 4.5', 'Below 3.0', 'Unrated (0)'];

    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const matchesFilter = userFilter === 'All' || (userFilter === 'Verified' && p.isVerified) || (userFilter === 'Unverified' && !p.isVerified);
            const matchesSearch = p.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || p.service.toLowerCase().includes(userSearchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [providers, userSearchTerm, userFilter]);

    const handleBroadcast = () => {
        if (broadcastMessage.trim()) {
             const filters = {
                location: broadcastLocation,
                category: broadcastCategory,
                rating: broadcastRating,
            };
            onBroadcast(broadcastMessage.trim(), filters);
            setBroadcastMessage('');
        }
    };
    
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const handleAddBanner = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBanner.imageUrl) {
            alert('Image URL is required.');
            return;
        }
        // Clean up empty fields
        const bannerToAdd = Object.fromEntries(Object.entries(newBanner).filter(([, value]) => value !== '' && value !== undefined));
        // FIX: Cast the dynamically created object to the expected type. The preceding logic ensures it conforms to the type, but TypeScript cannot infer this automatically.
        onAddBanner(bannerToAdd as Omit<SpecialBanner, 'id'>);
        setNewBanner({ imageUrl: '' });
    };

    
    const usersByLocation = useMemo(() => {
        const counts: Record<string, number> = {};
        providers.forEach(p => {
            const loc = p.location.split(',').pop()?.trim() || 'Unknown';
            counts[loc] = (counts[loc] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [providers]);

    const mostViewedUsers = useMemo(() => {
        return [...providers].sort((a, b) => b.views - a.views).slice(0, 5);
    }, [providers]);


    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard title="Total Users" value={providers.length.toString()} icon={<UsersIcon />} change="+2 this week" onClick={() => setActivePage('Users')} />
                        <StatCard title="New Sign-ups" value="5" icon={<UserPlusIcon />} change="+5 this week" onClick={() => setActivePage('Users')} />
                        <StatCard title="Profile Clicks" value="1.2k" icon={<MouseIcon />} change="+12% this week" />
                    </div>
                );
            case 'Users':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Users</h2>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <input type="text" placeholder="Search users..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className="flex-grow p-2 border rounded-md"/>
                            <select value={userFilter} onChange={e => setUserFilter(e.target.value as any)} className="p-2 border rounded-md bg-white">
                                <option>All</option>
                                <option>Verified</option>
                                <option>Unverified</option>
                            </select>
                        </div>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {filteredProviders.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <button onClick={() => onViewProvider(p)} className="flex items-center gap-3 text-left">
                                        <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold">{p.name} {p.isVerified && <span className="text-blue-500">✓</span>}</p>
                                            <p className="text-sm text-gray-600">{p.service}</p>
                                        </div>
                                    </button>
                                    <div className="flex items-center space-x-2">
                                        {!p.isVerified && <button onClick={() => onUpdateProvider({...p, isVerified: true})} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verify</button>}
                                        <button onClick={() => {if(window.confirm(`Delete ${p.name}?`)) onDeleteProvider(p.id)}} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Delete</button>
                                    </div>
                                </div>
                            ))}
                             {filteredProviders.length === 0 && <p className="text-center text-gray-500 py-4">No users found.</p>}
                        </div>
                    </div>
                );
            case 'Analytics':
                 return <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="font-bold text-lg mb-3">Users by Location</h3>
                            <div className="space-y-2">
                                {usersByLocation.map(([loc, count]) => (
                                    <div key={loc} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700">{loc}</span>
                                        <span className="font-semibold bg-gray-200 px-2 py-0.5 rounded">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="bg-white rounded-lg shadow-sm p-4">
                            <h3 className="font-bold text-lg mb-3">Most Viewed Profiles</h3>
                             <div className="space-y-3">
                                {mostViewedUsers.map(p => (
                                    <div key={p.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <img src={p.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.service}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold">{p.views} views</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                 </div>
            case 'Organizations':
                return <OrganizationsPage providers={providers} onCreate={onCreateOrganization} />;
            case 'Appearance':
                const inputClass = "w-full p-2 border rounded-md text-sm";
                const selectClass = "w-full p-2 border rounded-md bg-white text-sm";
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                             <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Special Banners</h2>
                             <form onSubmit={handleAddBanner} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                                 <h3 className="font-semibold">Add New Banner</h3>
                                 <input type="url" placeholder="Image URL*" value={newBanner.imageUrl} onChange={e => setNewBanner(p => ({...p, imageUrl: e.target.value}))} className={inputClass} required />
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Target Service (e.g. Plumber)" value={newBanner.targetService || ''} onChange={e => setNewBanner(p => ({...p, targetService: e.target.value}))} className={inputClass} />
                                    <input type="text" placeholder="Target Location (e.g. Nairobi)" value={newBanner.targetLocation || ''} onChange={e => setNewBanner(p => ({...p, targetLocation: e.target.value}))} className={inputClass} />
                                    <select value={newBanner.targetCategory || ''} onChange={e => setNewBanner(p => ({...p, targetCategory: e.target.value}))} className={selectClass}>
                                        <option value="">Any Category</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                     <select value={newBanner.minRating || ''} onChange={e => setNewBanner(p => ({...p, minRating: e.target.value ? Number(e.target.value) : undefined}))} className={selectClass}>
                                        <option value="">Any Rating</option>
                                        <option value="4.5">4.5+ Rating</option>
                                        <option value="4.0">4.0+ Rating</option>
                                    </select>
                                    <select value={newBanner.isVerifiedTarget === undefined ? '' : String(newBanner.isVerifiedTarget)} onChange={e => setNewBanner(p => ({...p, isVerifiedTarget: e.target.value === '' ? undefined : e.target.value === 'true'}))} className={selectClass}>
                                        <option value="">Any Verification</option>
                                        <option value="true">Verified Only</option>
                                        <option value="false">Unverified Only</option>
                                    </select>
                                    <select value={newBanner.isOnlineTarget === undefined ? '' : String(newBanner.isOnlineTarget)} onChange={e => setNewBanner(p => ({...p, isOnlineTarget: e.target.value === '' ? undefined : e.target.value === 'true'}))} className={selectClass}>
                                        <option value="">Any Status</option>
                                        <option value="true">Online Only</option>
                                        <option value="false">Offline Only</option>
                                    </select>
                                    <input type="text" placeholder="Target Referral Code" value={newBanner.targetReferralCode || ''} onChange={e => setNewBanner(p => ({...p, targetReferralCode: e.target.value}))} className={inputClass} />
                                 </div>
                                  <div className="flex gap-4 items-center">
                                    <input type="date" value={newBanner.startDate || ''} onChange={e => setNewBanner(p => ({...p, startDate: e.target.value}))} className={inputClass} title="Start Date"/>
                                    <span>to</span>
                                    <input type="date" value={newBanner.endDate || ''} onChange={e => setNewBanner(p => ({...p, endDate: e.target.value}))} className={inputClass} title="End Date"/>
                                  </div>
                                 <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2 rounded-lg">Add Banner</button>
                             </form>
                             <div className="mt-6">
                                 <h3 className="font-semibold mb-2">Active Banners</h3>
                                 <div className="space-y-3">
                                     {specialBanners.map(banner => (
                                         <div key={banner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                             <div className="flex items-center gap-3">
                                                <img src={banner.imageUrl} className="w-16 h-10 rounded object-cover" />
                                                <div className="text-xs">
                                                    {Object.entries(banner).filter(([key]) => key !== 'id' && key !== 'imageUrl').map(([key, value]) => (
                                                        <p key={key}><span className="font-semibold capitalize">{key.replace('target', '')}:</span> {String(value)}</p>
                                                    ))}
                                                </div>
                                             </div>
                                             <button onClick={() => onDeleteBanner(banner.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Delete</button>
                                         </div>
                                     ))}
                                     {specialBanners.length === 0 && <p className="text-center text-gray-500 py-4">No special banners configured.</p>}
                                 </div>
                             </div>
                        </div>
                    </div>
                );
            case 'Broadcast':
                return (
                     <div className="bg-white rounded-lg shadow-sm p-4 max-w-md mx-auto">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Broadcast Message</h2>
                        
                        <div className="space-y-3 mb-4">
                             <label className="text-xs font-medium text-gray-500">FILTERS</label>
                            <select value={broadcastLocation} onChange={e => setBroadcastLocation(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <select value={broadcastCategory} onChange={e => setBroadcastCategory(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                {uniqueCategoriesForBroadcast.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={broadcastRating} onChange={e => setBroadcastRating(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                {ratingOptions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                        <textarea rows={5} value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Type your notification message to all users here..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"/>
                        <button onClick={handleBroadcast} className="mt-3 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Send Broadcast</button>
                    </div>
                )
            case 'Categories':
                return (
                     <div className="bg-white rounded-lg shadow-sm p-4 max-w-md mx-auto">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Manage Categories</h2>
                         <form onSubmit={handleAddCategory} className="flex mb-4">
                            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name..." className="flex-grow border rounded-l px-2 py-2 text-sm border-gray-300 focus:ring-brand-primary focus:border-brand-primary"/>
                            <button type="submit" className="bg-brand-primary text-white px-4 rounded-r text-sm font-semibold">Add</button>
                        </form>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {categories.sort().map(cat => (
                                <div key={cat} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                    <span className="text-sm">{cat}</span>
                                    <button onClick={() => onDeleteCategory(cat)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    const navItems: { page: AdminPage, icon: React.ReactNode }[] = [
        { page: 'Dashboard', icon: <HomeIcon/> },
        { page: 'Users', icon: <UsersIcon/> },
        { page: 'Organizations', icon: <OrgIcon/> },
        { page: 'Analytics', icon: <ChartIcon/> },
        { page: 'Appearance', icon: <PaintIcon/> },
        { page: 'Broadcast', icon: <MegaphoneIcon/> },
        { page: 'Categories', icon: <TagIcon/> }
    ];

    return (
        <div className="bg-gray-100 min-h-screen font-sans flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-brand-dark text-white flex-shrink-0">
                <div className="p-4 flex items-center justify-between md:justify-center border-b border-gray-700">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                     <button onClick={onBack} className="md:hidden text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <nav className="p-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.page}>
                                <button onClick={() => setActivePage(item.page)} className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${activePage === item.page ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                    {item.icon}
                                    {item.page}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm p-4 flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-gray-800">{activePage}</h2>
                     <button onClick={onBack} className="hidden md:block text-sm font-medium text-gray-600 hover:text-brand-primary">
                        Exit Dashboard &rarr;
                    </button>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

// This component handles the real-time validation of leader phone numbers.
// It manages its own input state to provide a smoother user experience.
const LeaderInput: React.FC<{
    label: string;
    onValidation: (isValid: boolean, phone: string) => void;
    allProviders: ServiceProvider[];
}> = ({ label, onValidation, allProviders }) => {
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [foundUser, setFoundUser] = useState<ServiceProvider | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputValue.length >= 9) {
                setStatus('checking');
                const user = allProviders.find(p => p.phone.endsWith(inputValue));
                if (user) {
                    setFoundUser(user);
                    setStatus('valid');
                    onValidation(true, user.phone);
                } else {
                    setFoundUser(null);
                    setStatus('invalid');
                    onValidation(false, '');
                }
            } else {
                setStatus('idle');
                setFoundUser(null);
                onValidation(false, '');
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(handler);
    }, [inputValue, allProviders, onValidation]);

    const borderClass = status === 'invalid' ? 'border-red-500' : 'border-gray-300';

    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <div className={`flex items-center mt-1 border ${borderClass} rounded-md shadow-sm focus-within:ring-1 focus-within:ring-brand-primary`}>
                <span className="pl-3 text-gray-500">+254</span>
                <input
                    type="tel"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="722123456"
                    className="block w-full pl-1 pr-3 py-2 border-0 rounded-md focus:outline-none focus:ring-0 sm:text-sm"
                    required
                />
            </div>
            {status === 'checking' && <p className="text-xs text-gray-500 mt-1">Checking...</p>}
            {status === 'invalid' && <p className="text-xs text-red-600 mt-1">User not found on Niko Soko.</p>}
            {status === 'valid' && foundUser && (
                <div className="flex items-center gap-2 mt-1 p-1 bg-green-50 border border-green-200 rounded-md">
                    <img src={foundUser.avatarUrl} alt={foundUser.name} className="w-6 h-6 rounded-full"/>
                    <p className="text-xs text-green-800 font-semibold">{foundUser.name}</p>
                </div>
            )}
        </div>
    );
};


const OrganizationsPage: React.FC<{
    providers: ServiceProvider[];
    onCreate: (data: any) => void;
}> = ({ providers, onCreate }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [viewingOrg, setViewingOrg] = useState<ServiceProvider | null>(null);
    const [formState, setFormState] = useState({ name: '', service: '', location: '', about: ''});
    const [leaders, setLeaders] = useState({ chairperson: '', secretary: '', treasurer: '' });
    const [leaderValidation, setLeaderValidation] = useState({ chairperson: false, secretary: false, treasurer: false });
    
    const allSaccos = providers.filter(p => p.accountType === 'organization');

    const handleLeaderUpdate = (role: keyof typeof leaders, isValid: boolean, phone: string) => {
        setLeaderValidation(prev => ({ ...prev, [role]: isValid }));
        setLeaders(prev => ({ ...prev, [role]: isValid ? phone : '' }));
    };

    const isFormValid = leaderValidation.chairperson && leaderValidation.secretary && leaderValidation.treasurer && formState.name && formState.service && formState.location && formState.about;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!isFormValid) {
            alert("Please ensure all fields are filled and all leaders are valid members.");
            return;
        }
        onCreate({ ...formState, leaders });
        setFormState({ name: '', service: '', location: '', about: '' });
        setLeaders({ chairperson: '', secretary: '', treasurer: '' });
        setLeaderValidation({ chairperson: false, secretary: false, treasurer: false });
        setIsCreating(false);
    };
    
    if (viewingOrg) {
        return (
             <div className="bg-white rounded-lg shadow-sm p-4">
                 <button onClick={() => setViewingOrg(null)} className="text-sm font-semibold text-blue-600 mb-4">&larr; Back to List</button>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{viewingOrg.name}</h2>
                <p className="text-gray-600 mb-4">{viewingOrg.service}</p>
                 <h3 className="font-bold text-lg mt-6 mb-2">Pending Join Requests</h3>
                <div className="space-y-2">
                    {(viewingOrg.joinRequests || []).filter(r => r.status === 'pending').map(req => (
                        <div key={req.userId} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                            <div>
                                <p className="font-semibold">{req.userName}</p>
                                <p className="text-xs text-gray-600">{req.userPhone}</p>
                            </div>
                            <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                {req.approvals.length} / 3 Approved
                            </div>
                        </div>
                    ))}
                    {(viewingOrg.joinRequests || []).filter(r => r.status === 'pending').length === 0 && <p className="text-sm text-gray-500">No pending requests.</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Manage Organizations</h2>
                <button onClick={() => setIsCreating(p => !p)} className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm">{isCreating ? 'Cancel' : '+ New'}</button>
            </div>
            
            {isCreating && (
                 <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50 space-y-3 mb-6">
                    <h3 className="font-semibold text-lg">Create New Organization</h3>
                    <input value={formState.name} onChange={e => setFormState(p=>({...p, name: e.target.value}))} placeholder="Organization Name" className="w-full p-2 border rounded" required />
                    <input value={formState.service} onChange={e => setFormState(p=>({...p, service: e.target.value}))} placeholder="Service / Industry" className="w-full p-2 border rounded" required />
                    <input value={formState.location} onChange={e => setFormState(p=>({...p, location: e.target.value}))} placeholder="Location" className="w-full p-2 border rounded" required />
                    <textarea value={formState.about} onChange={e => setFormState(p=>({...p, about: e.target.value}))} placeholder="About the organization" className="w-full p-2 border rounded" required />
                     <h4 className="font-semibold pt-2">Leadership Contacts (must be registered users)</h4>
                    <LeaderInput 
                        label="Chairperson's Phone"
                        onValidation={(isValid, phone) => handleLeaderUpdate('chairperson', isValid, phone)}
                        allProviders={providers}
                    />
                    <LeaderInput 
                        label="Secretary's Phone"
                        onValidation={(isValid, phone) => handleLeaderUpdate('secretary', isValid, phone)}
                        allProviders={providers}
                    />
                     <LeaderInput 
                        label="Treasurer's Phone"
                        onValidation={(isValid, phone) => handleLeaderUpdate('treasurer', isValid, phone)}
                        allProviders={providers}
                    />
                    <button type="submit" disabled={!isFormValid} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Create Organization</button>
                </form>
            )}

            <div className="space-y-3">
                {allSaccos.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 text-left">
                            <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-sm text-gray-600">{p.service}</p>
                            </div>
                        </div>
                        <button onClick={() => setViewingOrg(p)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md font-semibold">
                           View Details ({p.joinRequests?.filter(r=>r.status === 'pending').length || 0})
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}


// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-3-5.197" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MouseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.118 1.94 18 2.684 18 3.5A3.5 3.5 0 0114.5 7H11" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 8v-5z" /></svg>;
const PaintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
const OrgIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

export default SuperAdminDashboard;
