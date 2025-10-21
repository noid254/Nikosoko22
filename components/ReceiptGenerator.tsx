import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets } from '../types';

declare const html2pdf: any;

interface LineItem {
  id: number;
  name: string;
  qty: number;
  price: number;
  serial?: string;
}

const VAT_RATE = 0.16;
const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const formatKsh = (amount: number) => `Ksh ${currencyFormatter.format(amount)}`;

const ReceiptGenerator: React.FC<{assets: BusinessAssets}> = ({ assets }) => {
  const [items, setItems] = useState<LineItem[]>([
      { id: 1, name: "Smartphone X", qty: 1, price: 25000, serial: 'IMEI-987654321' }
  ]);
  const [businessName, setBusinessName] = useState(assets.name);
  const [receiptId, setReceiptId] = useState(`R${Date.now().toString().slice(-6)}`);

  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBusinessName(assets.name);
  }, [assets]);
  
  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const tax = subtotal * VAT_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  const addItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('item_name') as HTMLInputElement).value;
    const qty = parseFloat((form.elements.namedItem('item_qty') as HTMLInputElement).value);
    const price = parseFloat((form.elements.namedItem('item_price') as HTMLInputElement).value);
    const serial = (form.elements.namedItem('item_serial') as HTMLInputElement).value;
    
    if (!name || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return;
    
    setItems([...items, { id: Date.now(), name, qty, price, serial }]);
    form.reset();
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const generatePdf = () => {
    const element = receiptPreviewRef.current;
    if (!element) return;
    html2pdf().from(element).set({
        margin: [5, 0, 5, 0],
        filename: `receipt-${receiptId}.pdf`,
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'mm', format: [72, 210], orientation: 'portrait' }
    }).save();
  };
  
  const handleShare = () => {
    const link = `https://www.tukosoko.com/receipt/${receiptId}`;
    alert(`Share this link: ${link}\n\n(Simulation: First click downloads PDF, subsequent clicks would require OTP verification based on receipt number ${receiptId})`);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="p-2 bg-white sticky top-[68px] z-10 shadow-sm border-b flex justify-between items-center">
         <h2 className="font-bold text-gray-700">Receipt Generator</h2>
        <div className="flex gap-2">
            <button onClick={generatePdf} className="text-sm px-3 py-1 bg-red-500 text-white font-bold rounded-lg">PDF</button>
            <button onClick={handleShare} className="text-sm px-3 py-1 bg-green-500 text-white font-bold rounded-lg">Share</button>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add Items (Ksh)</h2>
          <form onSubmit={addItem} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" name="item_name" required className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Item Name"/>
                  <input type="number" name="item_qty" required min="0.01" step="any" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" defaultValue="1" placeholder="Quantity" />
                  <input type="number" name="item_price" required min="0.01" step="any" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Unit Price"/>
              </div>
              <input type="text" name="item_serial" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="IMEI / Serial Number (Optional)"/>
              <button type="submit" className="w-full px-4 py-2 font-semibold text-white transition duration-300 rounded-lg shadow-md bg-brand-dark hover:bg-gray-700">
                  + Add Item
              </button>
          </form>

          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Current Items</h3>
          <div className="bg-gray-50 p-3 rounded-lg border max-h-48 overflow-y-auto">
            {items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="w-2/3">
                        <span className="font-semibold">{item.name}</span>
                        <div className="text-xs text-gray-500">{item.qty} x {formatKsh(item.price)}{item.serial && <><br/>SN: {item.serial}</>}</div>
                    </div>
                    <div className="w-1/3 text-right font-medium pr-2">{formatKsh(item.qty * item.price)}</div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">X</button>
                </div>
            ))}
             {items.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No items added yet.</p>}
          </div>
        </div>

        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Receipt Preview</h2>
            <div className="w-full max-w-xs mx-auto">
                <div ref={receiptPreviewRef} className="bg-white shadow-lg">
                    <div className="receipt-edge-top"></div>
                    <div className="p-3 font-mono text-xs text-black">
                        <div className="text-center mb-2">
                            <div className="text-lg font-bold">RECEIPT</div>
                             <div className="font-semibold">{receiptId}</div>
                        </div>
                        <div className="space-y-1 mb-2">
                            <div className="flex justify-between"><span className="font-bold">{businessName}</span><span>{new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'})}</span></div>
                            <div className="flex justify-between"><span>{assets.address}</span><span>{new Date().toLocaleDateString('en-GB')}</span></div>
                        </div>
                        <div className="border-t border-dashed border-gray-400 my-2"></div>
                        <div className="flex justify-between font-bold mb-1"><span className="w-2/3">Item</span><span className="w-1/3 text-right">Amount</span></div>
                         <div className="border-b border-dashed border-gray-400 mb-1"></div>
                        <div className="space-y-1 my-2">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <div className="w-2/3 pr-1">
                                        {item.name} ({item.qty} x {item.price})
                                        {item.serial && <div className="text-[10px] text-gray-600">SN: {item.serial}</div>}
                                    </div>
                                    <span className="w-1/3 text-right">{formatKsh(item.qty * item.price)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-dashed border-gray-400 my-2"></div>
                        <div className="space-y-1 mb-2">
                            <div className="flex justify-between font-bold"><span>Subtotal</span><span className="text-right">{formatKsh(subtotal)}</span></div>
                            <div className="flex justify-between font-bold"><span>TAX ({VAT_RATE * 100}%)</span><span className="text-right">{formatKsh(tax)}</span></div>
                            <div className="flex justify-between text-base font-extrabold border-t-2 border-dotted border-black pt-1 mt-1"><span>Total</span><span className="text-right">{formatKsh(total)}</span></div>
                        </div>
                         <div className="text-center pt-2 mt-2 border-t border-dashed border-gray-400">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://www.tukosoko.com/receipt/${receiptId}`} alt="QR Code" className="w-20 h-20 mx-auto" />
                             <p className="text-[10px] text-gray-600 mt-1">powered by <span className="font-bold">nikosoko</span></p>
                        </div>
                    </div>
                    <div className="receipt-edge-bottom"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
