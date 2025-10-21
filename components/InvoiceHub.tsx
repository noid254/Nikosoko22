import React from 'react';

type HubView = 'myDocuments' | 'quoteGenerator' | 'invoice' | 'assets' | 'receiptGenerator';

interface InvoiceHubProps {
    onNavigate: (view: HubView) => void;
}

const CreateCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm text-left w-full hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-gray-200">
        <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-3 rounded-lg text-brand-primary">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
        </div>
    </button>
);

const ManagementLink: React.FC<{ title: string, onClick: () => void, icon: React.ReactNode }> = ({ title, onClick, icon }) => (
     <button onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm text-left w-full hover:shadow-md hover:bg-gray-50 transition-all duration-200 border border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
             <div className="text-brand-primary">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </button>
);

// New cleaner icons
const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const QuoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const DocsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const AssetsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const InvoiceHub: React.FC<InvoiceHubProps> = ({ onNavigate }) => {
    return (
        <div className="p-4 bg-gray-50 min-h-full">
            <header className="mb-8">
                 <h1 className="text-3xl font-bold text-gray-900">Document Center</h1>
                 <p className="text-gray-600 mt-1">Create, manage, and track your business documents.</p>
            </header>
            
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Create New Document</h2>
                <div className="space-y-3">
                    <CreateCard 
                        title="Generate Invoice" 
                        description="Bill your clients for services rendered or products sold." 
                        icon={<InvoiceIcon/>} 
                        onClick={() => onNavigate('invoice')} 
                    />
                     <CreateCard 
                        title="Generate Quote" 
                        description="Provide a professional estimate for potential work." 
                        icon={<QuoteIcon/>} 
                        onClick={() => onNavigate('quoteGenerator')} 
                    />
                     <CreateCard 
                        title="Generate Receipt" 
                        description="Issue a proof of payment for completed transactions." 
                        icon={<ReceiptIcon/>} 
                        onClick={() => onNavigate('receiptGenerator')} 
                    />
                </div>
            </section>
            
            <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Manage & View</h2>
                 <div className="space-y-3">
                    <ManagementLink 
                        title="My Documents" 
                        icon={<DocsIcon />} 
                        onClick={() => onNavigate('myDocuments')} 
                    />
                    <ManagementLink 
                        title="Business Assets" 
                        icon={<AssetsIcon />} 
                        onClick={() => onNavigate('assets')} 
                    />
                </div>
            </section>
        </div>
    );
};

export default InvoiceHub;