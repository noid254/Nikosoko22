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
  const [view, setView] = useState<'input' | 'receipt'>('input');
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
    <div className="bg-gray-100 min-h-screen font-sans p-4">
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setView('input')} className={`w-1/2 py-2 font-semibold text-white transition duration-300 rounded-lg shadow-md ${view === 'input' ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-500'}`}>
            Item Input
        </button>
        <button onClick={() => setView('receipt')} className={`w-1/2 py-2 font-semibold text-white transition duration-300 rounded-lg shadow-md ${view === 'receipt' ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-500'}`}>
            View Receipt
        </button>
      </div>
      
      {view === 'input' && (
        <div className="p-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Items (Ksh)</h2>
          <form onSubmit={addItem} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" name="item_name" required className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Item Name"/>
                  <input type="number" name="item_qty" required min="0.01" step="any" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" defaultValue="1" placeholder="Quantity" />
                  <input type="number" name="item_price" required min="0.01" step="any" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Unit Price"/>
              </div>
              <input type="text" name="item_serial" className="block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="IMEI / Serial Number (Optional)"/>
              <button type="submit" className="w-full px-4 py-2 font-semibold text-white transition duration-300 rounded-lg shadow-md bg-green-500 hover:bg-green-600">
                  Add Item
              </button>
          </form>

          <h3 className="text-xl font-semibold mb-3 border-b pb-2">Current Items</h3>
          <div className="bg-gray-50 p-3 rounded-lg border">
            {items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="w-1/2">
                        <span className="font-semibold">{item.name}</span>
                        <div className="text-xs text-gray-500">{item.qty} x {formatKsh(item.price)}{item.serial && <><br/>SN: {item.serial}</>}</div>
                    </div>
                    <div className="w-1/4 text-right font-medium">{formatKsh(item.qty * item.price)}</div>
                    <div className="w-1/4 text-right"><button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-bold ml-2">X</button></div>
                </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-lg font-bold">Estimated Total:</span>
              <span className="text-xl font-extrabold text-blue-800">{formatKsh(total)}</span>
          </div>
        </div>
      )}

      {view === 'receipt' && (
        <div>
            <div className="flex justify-center gap-2 mb-4">
                <button onClick={generatePdf} className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg">Download PDF</button>
                <button onClick={handleShare} className="px-4 py-2 text-sm font-bold text-white bg-green-500 rounded-lg">Share Link</button>
            </div>
            <div ref={receiptPreviewRef} className="receipt-header max-w-xs mx-auto w-full border border-gray-300 rounded-lg shadow-2xl overflow-hidden bg-white text-gray-800">
                <div className="p-2 font-mono text-xs">
                    <div className="text-center mb-2">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://www.tukosoko.com/receipt/${receiptId}`} alt="QR Code" className="w-24 h-24 mx-auto" />
                        <div className="text-lg font-bold">RECEIPT #{receiptId}</div>
                    </div>
                    <div className="space-y-1 mb-2">
                        <div className="flex justify-between"><span className="font-bold">{businessName}</span><span>{new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'})}</span></div>
                        <div className="flex justify-between"><span>Address: {assets.address}</span><span>{new Date().toLocaleDateString('en-GB')}</span></div>
                    </div>
                    <div className="border-t border-dashed border-gray-400 mb-1"></div>
                    <div className="flex justify-between font-bold mb-1"><span className="w-2/3">Item</span><span className="w-1/3 text-right">Amount</span></div>
                    <div className="space-y-1 mb-2">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between">
                                <div className="w-2/3 pr-1">
                                    {item.name} ({item.qty} pcs)
                                    {item.serial && <div className="text-[10px] text-gray-600">SN: {item.serial}</div>}
                                </div>
                                <span className="w-1/3 text-right">{formatKsh(item.qty * item.price)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-dashed border-gray-400 mb-1"></div>
                    <div className="space-y-1 mb-2">
                        <div className="flex justify-between font-bold"><span>Subtotal</span><span className="text-right">{formatKsh(subtotal)}</span></div>
                        <div className="flex justify-between font-bold"><span>TAX ({VAT_RATE * 100}%)</span><span className="text-right">{formatKsh(tax)}</span></div>
                        <div className="flex justify-between text-base font-extrabold border-t-2 border-dotted border-gray-800 pt-1"><span>Total</span><span className="text-right">{formatKsh(total)}</span></div>
                    </div>
                    <div className="text-center pt-2"><p className="text-[10px] text-gray-600">powered by <span className="font-bold">nikosoko</span></p></div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptGenerator;