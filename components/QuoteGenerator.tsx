

import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets } from '../types';

// For CDN-loaded library
declare const html2pdf: any;

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatCurrency = (amount: number) => `Ksh ${currencyFormatter.format(amount)}`;


const QuoteGenerator: React.FC<{assets: BusinessAssets}> = ({ assets }) => {
  const [logo, setLogo] = useState<string | null>(assets.logo);
  const [fromName, setFromName] = useState(assets.name);
  const [fromAddress, setFromAddress] = useState(assets.address);
  const [toName, setToName] = useState('Client Company');
  const [toAddress, setToAddress] = useState('456 Avenue, City, Country');
  const [quoteNumber, setQuoteNumber] = useState('QTE-001');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));
  const [isSharing, setIsSharing] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: Date.now(), description: 'Service Description', quantity: 1, price: 1000 },
  ]);

  useEffect(() => {
    setFromName(assets.name);
    setFromAddress(assets.address);
    setLogo(assets.logo);
  }, [assets]);

  const quotePreviewRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const total = useMemo(() => lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0), [lineItems]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), description: 'New Service or Item', quantity: 1, price: 0 }]);
  };

  const updateLineItem = (id: number, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    } else {
      setLineItems([{ id: Date.now(), description: '', quantity: 1, price: 0 }]);
    }
  };
  
  const generatePdf = () => {
    const element = quotePreviewRef.current;
    if (!element) return;
    html2pdf().from(element).set({
        margin: 0,
        filename: `quote-${quoteNumber}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  }

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const element = quotePreviewRef.current;
    if (!element) {
      setIsSharing(false);
      return;
    }

    try {
        const pdfBlob = await html2pdf().from(element).set({
            margin: 0,
            filename: `quote-${quoteNumber}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).output('blob');
        
        const file = new File([pdfBlob], `quote-${quoteNumber}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `Quote ${quoteNumber}`,
                text: `Here is the quote from ${fromName}.`,
                files: [file],
            });
        } else {
            throw new Error("Sharing not supported");
        }
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error('Sharing failed:', error);
            alert('Sharing via link failed. Please use the PDF button to save and send manually.');
        }
    } finally {
        setIsSharing(false);
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="p-2 bg-white sticky top-[68px] z-10 shadow-sm border-b flex justify-between items-center">
          <p className="text-xs text-gray-500">Quote</p>
          <div className="flex gap-2">
            <button onClick={generatePdf} className="text-sm px-3 py-1 bg-gray-200 text-gray-800 font-bold rounded-lg">PDF</button>
            <button onClick={handleShare} disabled={isSharing} className="text-sm px-3 py-1 bg-brand-dark text-white font-bold rounded-lg disabled:bg-gray-400">
                {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>
      </div>
      
      <div ref={quotePreviewRef}>
        <div className="p-6 bg-white">
            <header className="flex justify-between items-start mb-6">
                <h2 className="text-4xl font-extrabold text-gray-800 pt-1">Quote</h2>
                 <div className="w-1/3">
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden"/>
                    <button onClick={() => logoInputRef.current?.click()} className="w-full h-20 border border-gray-300 rounded-lg flex flex-col items-center justify-center p-2 text-center text-gray-500 text-xs hover:bg-gray-50">
                        {logo ? <img src={logo} alt="logo" className="max-h-full max-w-full object-contain"/> : <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l1.547-1.547a4.125 4.125 0 014.628-.018l2.97 2.656a1.125 1.125 0 001.31 0l3.076-2.656a4.125 4.125 0 014.628.018l1.547 1.547M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg><span>+ Logo</span></>}
                    </button>
                </div>
            </header>
            
            <div className="flex flex-col space-y-2 mb-8">
                <div className="flex justify-between w-full space-x-4 items-center">
                    <label className="font-medium text-gray-600 whitespace-nowrap">Quote #:</label>
                    <input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} type="text" className="w-2/3 text-right font-semibold p-2 focus:outline-none focus:bg-gray-100 rounded" />
                </div>
                <div className="flex justify-between w-full space-x-4 items-center">
                    <label className="font-medium text-gray-600 whitespace-nowrap">Date:</label>
                    <input value={date} onChange={e => setDate(e.target.value)} type="date" className="w-2/3 text-right font-semibold p-2 focus:outline-none focus:bg-gray-100 rounded" />
                </div>
                 <div className="flex justify-between w-full space-x-4 items-center">
                    <label className="font-medium text-gray-600 whitespace-nowrap">Valid Until:</label>
                    <input value={validUntil} onChange={e => setValidUntil(e.target.value)} type="date" className="w-2/3 text-right font-semibold p-2 focus:outline-none focus:bg-gray-100 rounded" />
                </div>
            </div>

            <section className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">From</h3>
                    <input value={fromName} onChange={e => setFromName(e.target.value)} type="text" placeholder="Your Name/Company" className="w-full p-2 border rounded-md mb-2" />
                    <input value={fromAddress} onChange={e => setFromAddress(e.target.value)} type="text" placeholder="Your Address" className="w-full p-2 border rounded-md" />
                </div>
                <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">Prepared For</h3>
                    <input value={toName} onChange={e => setToName(e.target.value)} type="text" placeholder="Client Name" className="w-full p-2 border rounded-md mb-2" />
                    <input value={toAddress} onChange={e => setToAddress(e.target.value)} type="text" placeholder="Client Address" className="w-full p-2 border rounded-md" />
                </div>
            </section>
            
             <section>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Item Details</h3>
                {lineItems.map(item => (
                    <div key={item.id} className="border border-gray-300 rounded-lg p-3 mb-3 bg-white space-y-2">
                        <input type="text" value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} placeholder="Item Description" className="w-full p-2 border-b font-semibold focus:outline-none" />
                        <div className="flex items-center gap-2">
                            <input value={item.price} onChange={e => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)} type="number" placeholder="Price" className="p-2 border rounded w-1/3"/>
                            <span className="text-gray-500">x</span>
                            <input value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)} type="number" placeholder="1" className="p-2 border rounded w-1/4"/>
                            <span className="flex-grow text-right font-bold">{formatCurrency(item.quantity * item.price)}</span>
                        </div>
                        <button onClick={() => removeLineItem(item.id)} className="text-red-500 text-xs font-semibold">Remove</button>
                    </div>
                ))}
                <button onClick={addLineItem} className="w-full p-2 mt-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">+ Add Another Line Item</button>
            </section>

             <section className="mt-8 pt-4 border-t">
                <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                         <div className="flex justify-between items-center text-xl font-bold border-t-2 border-blue-600 pt-2 mt-2">
                            <span>TOTAL:</span>
                            <span className="text-blue-700">{formatCurrency(total)}</span>
                         </div>
                    </div>
                </div>
            </section>

             <footer className="mt-12 text-center text-xs text-gray-500">
                <p>This quote is valid until {new Date(validUntil).toLocaleDateString()}.</p>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default QuoteGenerator;