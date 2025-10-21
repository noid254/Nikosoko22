import React, { useState, useRef } from 'react';
import type { CatalogueItem, CatalogueCategory, ServiceProvider } from '../types';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';

interface CatalogueViewProps {
    items: CatalogueItem[];
    onUpdateItems: (items: CatalogueItem[]) => void;
    currentUser: ServiceProvider | null;
    onUpdateUser: (user: ServiceProvider) => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onInitiateContact: (provider: ServiceProvider) => boolean;
}

const CatalogueCard: React.FC<{item: CatalogueItem, onClick: () => void}> = ({ item, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group">
        <img src={item.imageUrls[0] || 'https://picsum.photos/seed/placeholder/400/300'} alt={item.title} className="w-full h-32 object-cover" />
        <div className="p-3">
            <p className="text-xs font-bold text-brand-primary group-hover:underline">{item.category}</p>
            <h3 className="font-bold text-gray-800 mt-1 truncate">{item.title}</h3>
            <p className="text-sm font-semibold text-gray-600 mt-2">{item.price}</p>
        </div>
    </div>
);

const CatalogueForm: React.FC<{ onSave: (item: Omit<CatalogueItem, 'id' | 'providerId'>) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CatalogueCategory>('Product');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const categories: CatalogueCategory[] = ['Product', 'Service', 'For Rent', 'For Sale'];

    const maxImages = ['For Rent', 'For Sale'].includes(category) ? 5 : 3;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const currentImagesCount = imagePreviews.length;
            const remainingSlots = maxImages - currentImagesCount;
            if (files.length > remainingSlots) {
                alert(`You can only upload ${remainingSlots} more image(s) for the '${category}' category.`);
            }
            
            const filesToRead = Math.min(files.length, remainingSlots);
            for (let i = 0; i < filesToRead; i++) {
                const file = files[i];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreviews(prev => [...prev, reader.result as string]);
                    };
                    reader.readAsDataURL(file);
                }
            }

             if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    
    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };


    const handleSave = () => {
        if (!title || !price || !description) {
            alert("Please fill title, price, and description.");
            return;
        }
        onSave({
            title,
            category,
            price,
            description,
            imageUrls: imagePreviews.length > 0 ? imagePreviews : [`https://picsum.photos/seed/${title.replace(/\s/g, '')}/400/300`]
        });
    };
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add to Catalogue</h2>
            <div className="space-y-4">
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Item Title" className="w-full p-2 border rounded"/>
                <select value={category} onChange={e => setCategory(e.target.value as CatalogueCategory)} className="w-full p-2 border rounded bg-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={price} onChange={e => setPrice(e.target.value)} type="text" placeholder="Price (e.g., Ksh 5,000)" className="w-full p-2 border rounded"/>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full p-2 border rounded"/>
                
                 <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Images (up to {maxImages})</label>
                    <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={src} className="w-full h-full object-cover rounded-md" alt={`preview ${index}`}/>
                                <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-mono leading-none">&times;</button>
                            </div>
                        ))}
                        {imagePreviews.length < maxImages && (
                            <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        multiple 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                
                <div className="flex gap-2">
                    <button onClick={onCancel} className="w-full bg-gray-200 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Save Item</button>
                </div>
            </div>
        </div>
    );
};

const ShareCatalogueModal: React.FC<{ catalogueUrl: string; onClose: () => void }> = ({ catalogueUrl, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-4">Share Your Catalogue</h2>
                <div className="flex justify-center">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(catalogueUrl)}`}
                        alt="Catalogue QR Code"
                        className="w-48 h-48 rounded-lg"
                    />
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">Scan this code to view and share your public catalogue page.</p>
                <button onClick={onClose} className="mt-4 w-full bg-brand-dark text-white font-bold py-2 rounded-lg">Done</button>
            </div>
        </div>
    );
};


const CatalogueView: React.FC<CatalogueViewProps> = ({ items, onUpdateItems, currentUser, onUpdateUser, isAuthenticated, onAuthClick, onInitiateContact }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const catalogueUrl = `https://nikosoko.app/catalogue/${currentUser?.id}`;
    
    const handleSaveItem = (item: Omit<CatalogueItem, 'id' | 'providerId'>) => {
        const newItem: CatalogueItem = {
            id: Date.now(),
            providerId: currentUser?.id || 0,
            ...item
        };
        onUpdateItems([...items, newItem]);
        setIsAdding(false);
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && currentUser) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateUser({ ...currentUser, catalogueBannerUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-gray-50 min-h-full">
             <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
            <div className="relative h-32 bg-gray-300 group">
                <img 
                    src={currentUser?.catalogueBannerUrl || 'https://picsum.photos/seed/defaultcatbanner/800/400'} 
                    alt="Catalogue Banner" 
                    className="w-full h-full object-cover" 
                />
                <button 
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center text-white text-sm font-semibold transition-opacity"
                >
                    Change Banner
                </button>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">My Catalogue</h2>
                    <div className="flex gap-2">
                        {items.length > 0 && <button onClick={() => setIsShareModalOpen(true)} className="bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-lg text-sm">Share</button>}
                        {!isAdding && <button onClick={() => setIsAdding(true)} className="bg-brand-dark text-white font-bold px-4 py-2 rounded-lg text-sm">+ Add Item</button>}
                    </div>
                </div>
                
                {isAdding && <div className="mb-4"><CatalogueForm onSave={handleSaveItem} onCancel={() => setIsAdding(false)} /></div>}

                {items.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {items.map(item => <CatalogueCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}
                    </div>
                ) : (
                    !isAdding && (
                        <div className="text-center py-16 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 4 8 4 8-4 8-4" /></svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Your catalogue is empty</h3>
                            <p className="mt-1 text-sm text-gray-500">Add items to showcase your products or services.</p>
                        </div>
                    )
                )}
            </div>
            {isShareModalOpen && <ShareCatalogueModal catalogueUrl={catalogueUrl} onClose={() => setIsShareModalOpen(false)} />}
            {selectedItem && 
                <CatalogueItemDetailModal 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    provider={currentUser}
                    isAuthenticated={isAuthenticated}
                    onAuthClick={onAuthClick}
                    onInitiateContact={onInitiateContact}
                />
            }
        </div>
    );
};

export default CatalogueView;