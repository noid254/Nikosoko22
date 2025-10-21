import React from 'react';
import type { Document, DocumentType } from '../types';

const statusStyles: Record<Document['status'], string> = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
    Draft: 'bg-gray-100 text-gray-800',
};

const DocumentCard: React.FC<{ doc: Document }> = ({ doc }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-gray-800">{doc.type} <span className="text-gray-500 font-medium">{doc.number}</span></p>
                <p className="text-sm text-gray-600">From: {doc.from}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[doc.status]}`}>{doc.status}</span>
        </div>
        <div className="flex justify-between items-end mt-4">
            <p className="text-sm text-gray-500">{new Date(doc.date).toLocaleDateString()}</p>
            <p className="text-lg font-bold text-brand-dark">{doc.currency} {doc.amount.toLocaleString()}</p>
        </div>
    </div>
);

const MyDocumentsView: React.FC<{ documents: Document[] }> = ({ documents }) => {
    return (
        <div className="p-4 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Documents</h1>
            {documents.length > 0 ? (
                <div className="space-y-4">
                    {documents.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Your received documents will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default MyDocumentsView;
