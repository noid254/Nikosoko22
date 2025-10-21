import React from 'react';

type HubView = 'myDocuments' | 'quoteGenerator' | 'invoice' | 'assets' | 'receiptGenerator';

interface InvoiceHubProps {
    onNavigate: (view: HubView) => void;
}

const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const QuoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 14l-6-6m5.5.5h.01M4.99 9h.01m14.02 5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DocsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const AssetsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;


const ActionCard: React.FC<{title: string, icon: React.ReactNode, onClick: () => void, className?: string}> = ({ title, icon, onClick, className = '' }) => (
    <button onClick={onClick} className={`bg-white p-6 rounded-xl shadow-sm text-center flex flex-col items-center justify-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ${className}`}>
        <div className="bg-gray-100 p-4 rounded-full text-brand-primary">
            {icon}
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
    </button>
);

const InvoiceHub: React.FC<InvoiceHubProps> = ({ onNavigate }) => {
    return (
        <div className="p-4 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Documents</h1>
            <div className="grid grid-cols-2 gap-4">
                <ActionCard title="My Documents" icon={<DocsIcon/>} onClick={() => onNavigate('myDocuments')} />
                <ActionCard title="Business Assets" icon={<AssetsIcon />} onClick={() => onNavigate('assets')} />
                <ActionCard title="Generate Receipt" icon={<ReceiptIcon />} onClick={() => onNavigate('receiptGenerator')} className="col-span-2" />
                <ActionCard title="Generate Quote" icon={<QuoteIcon/>} onClick={() => onNavigate('quoteGenerator')} />
                <ActionCard title="Generate Invoice" icon={<InvoiceIcon/>} onClick={() => onNavigate('invoice')} />
            </div>
        </div>
    );
};

export default InvoiceHub;