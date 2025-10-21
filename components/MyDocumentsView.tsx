import React, { useState, useMemo } from 'react';
import type { Document, DocumentType } from '../types';

const statusStyles: Record<Document['status'], string> = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
    Draft: 'bg-gray-100 text-gray-800',
};

const documentIcons: Record<DocumentType, React.ReactNode> = {
    Invoice: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Quote: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    Receipt: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
};

const DocumentListItem: React.FC<{ doc: Document }> = ({ doc }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">{documentIcons[doc.type]}</div>
                <div>
                    <p className="font-bold text-gray-800">{doc.type} <span className="text-gray-500 font-medium text-sm">#{doc.number}</span></p>
                    <p className="text-xs text-gray-600">From: {doc.from}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(doc.date).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-base font-bold text-brand-dark">{doc.currency} {doc.amount.toLocaleString()}</p>
                <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[doc.status]}`}>{doc.status}</span>
            </div>
        </div>
    </div>
);

const MyDocumentsView: React.FC<{ documents: Document[] }> = ({ documents }) => {
    const [filter, setFilter] = useState<DocumentType | 'All'>('All');

    const filteredDocuments = useMemo(() => {
        if (filter === 'All') return documents;
        return documents.filter(doc => doc.type === filter);
    }, [documents, filter]);
    
    const filters: (DocumentType | 'All')[] = ['All', 'Invoice', 'Quote', 'Receipt'];

    return (
        <div className="p-4 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">My Documents</h1>
            
            <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                {filters.map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 border transition-colors ${filter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-700 border-gray-200'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {filteredDocuments.length > 0 ? (
                <div className="space-y-3">
                    {filteredDocuments.map(doc => <DocumentListItem key={doc.id} doc={doc} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                    <p className="mt-1 text-sm text-gray-500">Your documents will appear here once created or received.</p>
                </div>
            )}
        </div>
    );
};

export default MyDocumentsView;
