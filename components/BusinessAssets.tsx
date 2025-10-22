import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { BusinessAssets as BusinessAssetsType } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface BrandKitViewProps {
    assets: BusinessAssetsType;
    onSave: (assets: BusinessAssetsType) => void;
    onOrder: (itemName: string) => void;
}

const BrandKitView: React.FC<BrandKitViewProps> = ({ assets, onSave, onOrder }) => {
    const [name, setName] = useState(assets.name);
    const [address, setAddress] = useState(assets.address);
    const [logo, setLogo] = useState<string | null>(assets.logo);
    const logoInputRef = useRef<HTMLInputElement>(null);
    
    const [mockupType, setMockupType] = useState<'T-Shirt' | 'Mug' | 'Cap' | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState('');

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
        alert("Brand Kit saved!");
    };
    
    const generateMockup = async (type: 'T-Shirt' | 'Mug' | 'Cap') => {
        if (!logo) {
            setError('Please upload a logo first to generate mockups.');
            return;
        }
        
        setError('');
        setMockupType(type);
        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Logo = logo.split(',')[1];
            const logoMimeType = logo.substring(logo.indexOf(':') + 1, logo.indexOf(';'));
            const logoPart = { inlineData: { data: base64Logo, mimeType: logoMimeType } };

            const prompts = {
                'T-Shirt': 'Create a photorealistic mockup of a plain white crew-neck t-shirt with this logo centered on the chest. The t-shirt should be laid flat on a neutral light gray background.',
                'Mug': 'Create a photorealistic mockup of a standard white ceramic coffee mug with this logo on its side. The mug should be standing upright on a neutral light gray background.',
                'Cap': 'Create a photorealistic mockup of a classic white baseball cap with this logo on the front panel. The cap should be facing forward on a neutral light gray background.',
            };
            const textPart = { text: prompts[type] };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [logoPart, textPart] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePart && imagePart.inlineData) {
                const base64ImageBytes = imagePart.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                setGeneratedImage(imageUrl);
            } else {
                throw new Error("AI did not return an image.");
            }
        } catch (err) {
            console.error("Mockup generation failed:", err);
            setError("Sorry, we couldn't create a mockup. Please try again later.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-full">
             <h1 className="text-2xl font-bold text-gray-800 mb-6">Brand Kit</h1>
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
                    Save Brand Kit
                </button>
             </div>
             
             <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 mt-6">
                <h2 className="text-xl font-bold text-gray-800">Merchandise Mockups</h2>
                <p className="text-sm text-gray-600">
                    Generate AI-powered mockups of your brand on various merchandise. Click an item to start.
                </p>
                <div className="grid grid-cols-3 gap-3">
                    {(['T-Shirt', 'Mug', 'Cap'] as const).map(type => (
                        <button 
                            key={type}
                            onClick={() => generateMockup(type)}
                            disabled={isGenerating || !logo}
                            className="p-3 bg-gray-100 rounded-lg font-semibold text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="mt-4 min-h-[100px]">
                    {isGenerating && <LoadingSpinner message={`Generating ${mockupType} mockup...`} />}
                    {error && <p className="text-center text-red-500 p-3 bg-red-50 rounded-lg">{error}</p>}
                    {generatedImage && (
                        <div className="space-y-4 animate-fadeIn">
                            <img src={generatedImage} alt={`${mockupType} mockup`} className="rounded-lg shadow-md border" />
                            <button 
                                onClick={() => onOrder(`${mockupType}`)} 
                                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition"
                            >
                                Request a Quote
                            </button>
                        </div>
                    )}
                </div>
             </div>
        </div>
    )
}

export default BrandKitView;