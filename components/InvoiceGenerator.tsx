import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets } from '../types';

declare const html2pdf: any;

interface LineItem {
  id: number;
  description: string;
  details: string;
  quantity: number;
  price: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatCurrency = (amount: number) => `Ksh ${currencyFormatter.format(amount)}`;

const InvoiceGenerator: React.FC<{assets: BusinessAssets}> = ({ assets }) => {
  const [logo, setLogo] = useState<string | null>(assets.logo);
  const [fromName, setFromName] = useState(assets.name);
  const [fromEmail, setFromEmail] = useState('name@business.com');
  const [toName, setToName] = useState('Client Company');
  const [toEmail, setToEmail] = useState('name@client.com');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [taxRate, setTaxRate] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: Date.now(), description: 'Website Design', details: 'Full responsive design and development', quantity: 1, price: 50000 },
  ]);

  useEffect(() => {
    setFromName(assets.name);
    setLogo(assets.logo);
  }, [assets]);

  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(() => lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0), [lineItems]);
  const taxAmount = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: Date.now(), description: 'New Service or Item', details: 'Additional details', quantity: 1, price: 0 }]);
  };

  const updateLineItem = (id: number, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeLineItem = (id: number) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };
  
  const generatePdf = () => {
    const element = invoicePreviewRef.current;
    if (!element) return;
    html2pdf().from(element).set({
        margin: 0,
        filename: `invoice-${invoiceNumber}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  }

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const element = invoicePreviewRef.current;
    if (!element) {
      setIsSharing(false);
      return;
    }

    try {
        const pdfBlob = await html2pdf().from(element).set({
            margin: 0,
            filename: `invoice-${invoiceNumber}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).output('blob');
        
        const file = new File([pdfBlob], `invoice-${invoiceNumber}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `Invoice ${invoiceNumber}`,
                text: `Here is the invoice from ${fromName}.`,
                files: [file],
            });
        } else { throw new Error("Sharing not supported"); }
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
          <h2 className="font-bold text-gray-700">Invoice Generator</h2>
          <div className="flex gap-2">
            <button onClick={generatePdf} className="text-sm px-3 py-1 bg-red-500 text-white font-bold rounded-lg">PDF</button>
            <button onClick={handleShare} disabled={isSharing} className="text-sm px-3 py-1 bg-green-500 text-white font-bold rounded-lg disabled:bg-gray-400">
                {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>
      </div>
      
       <div className="p-4 space-y-6">
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Invoice Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
                 <input value={fromName} onChange={e => setFromName(e.target.value)} type="text" placeholder="Your Business Name" className="p-2 border rounded-md" />
                 <input value={toName} onChange={e => setToName(e.target.value)} type="text" placeholder="Client Name" className="p-2 border rounded-md" />
                 <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} type="text" placeholder="Invoice #" className="p-2 border rounded-md" />
                 <input value={date} onChange={e => setDate(e.target.value)} type="date" className="p-2 border rounded-md" />
            </div>
             <h3 className="text-lg font-semibold mt-4 mb-2">Items</h3>
             <div className="space-y-2">
             {lineItems.map((item, index) => (
                 <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <input value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} placeholder="Description" className="col-span-4 p-2 border rounded-md text-sm"/>
                    <input value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)} type="number" placeholder="Qty" className="col-span-2 p-2 border rounded-md text-sm"/>
                    <input value={item.price} onChange={e => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)} type="number" placeholder="Price" className="col-span-3 p-2 border rounded-md text-sm"/>
                    <p className="col-span-2 text-right text-sm font-semibold">{formatCurrency(item.quantity * item.price)}</p>
                    <button onClick={() => removeLineItem(item.id)} className="text-red-500 text-xl font-bold"> &times; </button>
                 </div>
             ))}
             </div>
             <button onClick={addLineItem} className="mt-3 w-full p-2 bg-brand-dark text-white font-bold rounded-lg hover:bg-gray-700 text-sm">+ Add Item</button>
        </div>
      
        <h2 className="text-lg font-semibold text-gray-800 text-center">Preview</h2>
        <div ref={invoicePreviewRef} className="bg-white p-8 rounded shadow-lg max-w-sm mx-auto border border-gray-200">
            <header className="flex justify-between items-start border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800">INVOICE</h1>
                    <p className="text-gray-500">#{invoiceNumber}</p>
                </div>
                {logo && <img src={logo} alt="logo" className="max-h-16 max-w-[100px] object-contain"/>}
            </header>

            <section className="grid grid-cols-2 gap-8 mb-6 text-xs">
                <div>
                    <h3 className="font-bold text-gray-500 uppercase mb-1">FROM</h3>
                    <p className="font-semibold text-gray-800">{fromName}</p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-500 uppercase mb-1">BILL TO</h3>
                    <p className="font-semibold text-gray-800">{toName}</p>
                </div>
            </section>
            
            <section>
                <table className="w-full text-sm">
                    <thead className="border-b-2 border-dashed border-gray-300">
                        <tr className="text-left text-gray-500 font-semibold uppercase">
                            <th className="py-2 pr-2">Description</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right pl-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map(item => (
                            <tr key={item.id} className="border-b border-dashed border-gray-200">
                                <td className="py-2 pr-2">
                                    <p className="font-semibold text-gray-800">{item.description}</p>
                                    <p className="text-gray-600 text-xs">{item.details}</p>
                                </td>
                                <td className="py-2 text-center">{item.quantity}</td>
                                <td className="py-2 text-right pl-2">{formatCurrency(item.quantity * item.price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mt-6">
                <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                         <div className="flex justify-between items-center"><span className="text-gray-600">Subtotal:</span><span className="font-semibold">{formatCurrency(subtotal)}</span></div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tax (%):</span>
                            <input type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} className="w-16 p-1 text-right border rounded-md" />
                         </div>
                         <div className="flex justify-between items-center"><span className="text-gray-600">Tax Amount:</span><span className="font-semibold">{formatCurrency(taxAmount)}</span></div>
                         <div className="flex justify-between items-center text-lg font-bold border-t-2 border-gray-800 pt-2 mt-2">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(total)}</span>
                         </div>
                    </div>
                </div>
            </section>
            
             <footer className="mt-12 text-center text-xs text-gray-500 border-t border-dashed border-gray-300 pt-4">
                <p>Thank you for your business. Please pay by {new Date(date).toLocaleDateString()}.</p>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
