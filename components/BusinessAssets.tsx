
import React, { useState, useRef } from 'react';
import type { BusinessAssets } from '../types';

interface BusinessAssetsProps {
    assets: BusinessAssets;
    onSave: (assets: BusinessAssets) => void;
}

const BusinessAssets: React.FC<BusinessAssetsProps> = ({ assets, onSave }) => {
    const [name, setName] = useState(assets.name);
    const [address, setAddress] = useState(assets.address);
    const [logo, setLogo] = useState<string | null>(assets.logo);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setLogo(reader.result as string);
          reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        onSave({ name, address, logo });
        alert("Assets saved!");
    };

    return (
        <div className="p-4 bg-gray-50 min-h-full">
             <h1 className="text-2xl font-bold text-gray-800 mb-6">Business Assets</h1>
             <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden"/>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                             {logo ? <img src={logo} alt="logo" className="max-h-full max-w-full object-contain"/> : <span className="text-xs text-gray-500">No Logo</span>}
                        </div>
                        <button onClick={() => logoInputRef.current?.click()} className="bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-lg text-sm">Upload Logo</button>
                    </div>
                </div>

                 <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input id="companyName" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm"/>
                </div>

                <div>
                    <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700">Company Address</label>
                    <textarea id="companyAddress" value={address} onChange={e => setAddress(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm"/>
                </div>

                <button onClick={handleSave} className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                    Save Assets
                </button>
             </div>
        </div>
    )
}

export default BusinessAssets;
