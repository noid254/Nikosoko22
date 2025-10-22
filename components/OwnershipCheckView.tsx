import React, { useState, useMemo } from 'react';
import type { Document } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface OwnershipCheckViewProps {
    allDocuments: Document[];
}

const OwnershipCheckView: React.FC<OwnershipCheckViewProps> = ({ allDocuments }) => {
    const [serial, setSerial] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<Document | null | 'not_found'>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serial.trim()) return;
        
        setIsLoading(true);
        setResult(null);

        // Simulate network request
        setTimeout(() => {
            const foundAsset = allDocuments.find(doc => 
                doc.isAsset && doc.items?.some(item => item.serial?.toLowerCase() === serial.trim().toLowerCase())
            );
            setResult(foundAsset || 'not_found');
            setIsLoading(false);
        }, 750);
    };

    return (
        <div className="p-4 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirm Asset Ownership</h1>
            <p className="text-gray-600 mb-6">Enter an asset's serial number or IMEI to find its registered owner.</p>
            
            <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <input 
                    type="text" 
                    value={serial}
                    onChange={e => setSerial(e.target.value)}
                    placeholder="Enter Serial Number or IMEI" 
                    className="w-full p-3 border rounded-lg"
                    autoFocus
                />
                <button type="submit" disabled={isLoading} className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="mt-6">
                {isLoading && <LoadingSpinner message="Checking database..." />}
                
                {result && result !== 'not_found' && (
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                        <h3 className="font-bold text-lg text-green-700">Asset Found</h3>
                        <div className="mt-3 space-y-2 text-sm">
                            <p><strong>Item:</strong> {result.items?.[0]?.description}</p>
                            <p><strong>Registered Owner:</strong> {result.ownerPhone ? '******' + result.ownerPhone.slice(-4) : 'N/A'}</p>
                            <p><strong>Seller:</strong> {result.issuerName}</p>
                            <p><strong>Purchase Date:</strong> {new Date(result.date).toLocaleDateString()}</p>
                            <p className="mt-2 text-xs text-gray-500">Owner's full contact details are masked for privacy.</p>
                        </div>
                    </div>
                )}

                {result === 'not_found' && (
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                         <h3 className="font-bold text-lg text-red-700">Asset Not Found</h3>
                         <p className="mt-2 text-sm text-gray-700">No asset with this serial number is registered in the Niko Soko database. The item may be unregistered or the serial number is incorrect.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnershipCheckView;
