import React, { useState, useMemo } from 'react';
import type { Document, DocumentType } from '../types';
import LoadingSpinner from './LoadingSpinner';

const statusStyles: Record<Document['paymentStatus'], string> = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
    Draft: 'bg-gray-100 text-gray-800',
};

const verificationStyles: Record<NonNullable<Document['verificationStatus']>, { classes: string, icon: React.ReactNode }> = {
    Unverified: { classes: 'text-gray-500', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    Pending: { classes: 'text-yellow-600', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /></svg> },
    Verified: { classes: 'text-blue-500', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> },
    Rejected: { classes: 'text-red-500', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
};

const documentIcons: Record<DocumentType, React.ReactNode> = {
    Invoice: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Quote: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    Receipt: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
};

const DocumentListItem: React.FC<{ doc: Document; onClick: () => void }> = ({ doc, onClick }) => {
    const isAssetWithItem = doc.isAsset && doc.items && doc.items.length > 0;
    const firstItem = isAssetWithItem ? doc.items![0] : null;

    if (isAssetWithItem) {
        return (
            <button onClick={onClick} className="w-full text-left bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 flex items-center gap-4">
                <img 
                    src={doc.productImages?.[0] || 'https://picsum.photos/seed/asset/200/200'}
                    alt={firstItem?.description}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-200"
                />
                <div className="flex-grow overflow-hidden">
                    <div className="flex items-center justify-between">
                         <p className="font-bold text-gray-800 truncate">{firstItem?.description}</p>
                         {doc.verificationStatus && (
                            <div className={`flex items-center gap-1 text-xs font-semibold ${verificationStyles[doc.verificationStatus].classes}`}>
                                {verificationStyles[doc.verificationStatus].icon}
                            </div>
                        )}
                    </div>
                    {firstItem?.serial && <p className="text-xs font-mono text-gray-500 mt-1">SN: {firstItem.serial}</p>}
                    <p className="text-xs text-gray-500 mt-1">From: {doc.issuerName}</p>
                </div>
            </button>
        )
    }

    // Fallback for regular documents
    return (
        <button onClick={onClick} className="w-full text-left bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">{documentIcons[doc.type]}</div>
                    <div>
                        <p className="font-bold text-gray-800">{doc.type} <span className="text-gray-500 font-medium text-sm">#{doc.number}</span></p>
                        <p className="text-xs text-gray-600">From: {doc.issuerName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-base font-bold text-gray-800">{doc.currency} {doc.amount.toLocaleString()}</p>
                    <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[doc.paymentStatus]}`}>{doc.paymentStatus}</span>
                </div>
            </div>
        </button>
    );
};

interface MyDocumentsViewProps {
    documents: Document[];
    allDocuments: Document[];
    onScan: () => void;
    onSelectDocument: (doc: Document) => void;
}

const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({ documents, allDocuments, onScan, onSelectDocument }) => {
    const [filter, setFilter] = useState<'All' | 'Receipts' | 'Assets'>('All');
    const [serial, setSerial] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<Document | null | 'not_found'>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serial.trim()) return;
        
        setIsLoading(true);
        setSearchResult(null);

        // Simulate network request
        setTimeout(() => {
            const foundAsset = allDocuments.find(doc => 
                doc.isAsset && doc.items?.some(item => item.serial?.toLowerCase() === serial.trim().toLowerCase())
            );
            setSearchResult(foundAsset || 'not_found');
            setIsLoading(false);
        }, 750);
    };

    const filteredDocuments = useMemo(() => {
        const sorted = [...documents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        switch (filter) {
            case 'Receipts':
                return sorted.filter(doc => doc.type === 'Receipt' && !doc.isAsset);
            case 'Assets':
                 return sorted.filter(doc => doc.isAsset);
            case 'All':
            default:
                return sorted;
        }
    }, [documents, filter]);
    
    const filters: ('All' | 'Assets' | 'Receipts')[] = ['All', 'Assets', 'Receipts'];

    const handleDocumentClick = (doc: Document) => {
       if (typeof onSelectDocument === 'function') {
           onSelectDocument(doc);
       } else {
           console.error("MyDocumentsView: onSelectDocument prop is not a function or was not provided.");
           alert("Sorry, there was an error opening this document.");
       }
   };

    return (
        <div className="p-4 bg-gray-50 min-h-full space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">My Asset Vault</h1>
            
            {/* Ownership Check */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <h2 className="font-semibold">Confirm Asset Ownership</h2>
                <p className="text-sm text-gray-600">Enter an asset's serial number or IMEI to find its registered owner.</p>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        value={serial}
                        onChange={e => setSerial(e.target.value)}
                        placeholder="Enter Serial Number or IMEI" 
                        className="w-full p-2 border rounded-lg"
                    />
                    <button type="submit" disabled={isLoading} className="bg-brand-dark text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
                        Search
                    </button>
                </form>
                 {isLoading && <LoadingSpinner message="Checking database..." />}
                 {searchResult && searchResult !== 'not_found' && (
                    <div className="p-3 rounded-lg border-l-4 border-green-500 bg-green-50">
                        <h3 className="font-bold text-green-700">Asset Found</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><strong>Item:</strong> {searchResult.items?.[0]?.description}</p>
                            <p><strong>Owner:</strong> {searchResult.ownerPhone ? '******' + searchResult.ownerPhone.slice(-4) : 'N/A'}</p>
                        </div>
                    </div>
                )}
                {searchResult === 'not_found' && (
                    <div className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                         <h3 className="font-bold text-red-700">Asset Not Found</h3>
                    </div>
                )}
            </div>
            
            <button onClick={onScan} className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-black transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Add New Asset / Receipt
            </button>

            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                {filters.map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 border transition-colors ${filter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {filteredDocuments.length > 0 ? (
                <div className="space-y-3">
                    {filteredDocuments.map(doc => <DocumentListItem key={doc.id} doc={doc} onClick={() => handleDocumentClick(doc)} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                    <p className="mt-1 text-sm text-gray-500">Scan your first receipt or asset to get started.</p>
                </div>
            )}
        </div>
    );
};

export default MyDocumentsView;