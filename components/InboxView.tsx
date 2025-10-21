import React, { useState, useMemo } from 'react';
import type { InboxMessage, ServiceProvider } from '../types';

interface InboxViewProps {
    messages: InboxMessage[];
    onUpdateMessages: (messages: InboxMessage[]) => void;
    currentUserPhone: string | undefined;
    allProviders: ServiceProvider[];
    onAction: (orgId: number, reqId: number, action: 'approve' | 'deny', leaderPhone: string) => void;
}

const RequesterCard: React.FC<{profile: Partial<ServiceProvider>}> = ({ profile }) => (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg mt-2">
        <img src={profile.avatarUrl} alt={profile.name} className="w-12 h-12 rounded-full object-cover"/>
        <div>
            <p className="font-bold text-gray-800">{profile.name}</p>
            <p className="text-sm text-gray-600">{profile.service}</p>
        </div>
    </div>
)

const InboxMessageRow: React.FC<{ 
    message: InboxMessage, 
    onSelect: () => void, 
    isSelected: boolean,
    allProviders: ServiceProvider[],
    currentUserPhone: string | undefined,
    onAction: (orgId: number, reqId: number, action: 'approve' | 'deny', leaderPhone: string) => void,
}> = ({ message, onSelect, isSelected, allProviders, currentUserPhone, onAction }) => {
    const isRead = message.isRead || isSelected;

    const actionData = useMemo(() => {
        if (!message.action || message.action.type !== 'saccoJoinRequest') return null;

        const organization = allProviders.find(p => p.id === message.action!.organizationId);
        if (!organization || !organization.joinRequests) return null;

        const request = organization.joinRequests.find(r => r.userId === message.action!.requesterId);
        if (!request) return null;

        return { organization, request };
    }, [message.action, allProviders]);

    const handleActionClick = (e: React.MouseEvent, action: 'approve' | 'deny') => {
        e.stopPropagation(); // Prevent the message from collapsing
        if (actionData && currentUserPhone) {
            onAction(actionData.organization.id, actionData.request.userId, action, currentUserPhone);
        }
    };
    
    const renderActionUI = () => {
        if (!actionData || !currentUserPhone) return null;

        const { request } = actionData;
        const approvals = request.approvals || [];
        const rejections = request.rejections || [];
        const leaderHasVoted = approvals.includes(currentUserPhone) || rejections.includes(currentUserPhone);

        if (request.status === 'approved') {
            return <p className="text-sm font-bold text-green-600 mt-3">Request Approved</p>;
        }
        if (request.status === 'rejected') {
            return <p className="text-sm font-bold text-red-600 mt-3">Request Rejected</p>;
        }
        if (leaderHasVoted) {
            const voteStatus = approvals.includes(currentUserPhone) ? 'Approved by you' : 'Rejected by you';
            return <p className="text-sm font-bold text-gray-600 mt-3">{voteStatus} ({approvals.length}/3 needed)</p>;
        }
        
        return (
             <div className="flex gap-2 mt-3">
                <button onClick={(e) => handleActionClick(e, 'approve')} className="flex-1 bg-green-500 text-white font-bold py-2 px-3 rounded-lg text-sm">Approve</button>
                <button onClick={(e) => handleActionClick(e, 'deny')} className="flex-1 bg-red-500 text-white font-bold py-2 px-3 rounded-lg text-sm">Deny</button>
            </div>
        )
    }

    return (
        <button onClick={onSelect} className="w-full text-left p-4 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {!isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                    <p className={`font-semibold ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>{message.from}</p>
                </div>
                <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleDateString()}</p>
            </div>
            <p className={`mt-1 ${isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>{message.subject}</p>
            {isSelected && (
                 <div className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    <p>{message.body}</p>
                    {message.requesterProfile && <RequesterCard profile={message.requesterProfile} />}
                    {renderActionUI()}
                </div>
            )}
        </button>
    )
}

const InboxView: React.FC<InboxViewProps> = ({ messages, onUpdateMessages, currentUserPhone, allProviders, onAction }) => {
    const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);

    const userMessages = useMemo(() => {
        return messages.filter(m => !m.recipientPhone || m.recipientPhone === currentUserPhone).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [messages, currentUserPhone]);
    
    const handleSelectMessage = (id: number) => {
        setSelectedMessageId(prev => prev === id ? null : id);
        onUpdateMessages(messages.map(msg => msg.id === id ? {...msg, isRead: true} : msg));
    };

    return (
        <div className="bg-white min-h-full">
            {userMessages.length > 0 ? (
                <div>
                    {userMessages.map(msg => (
                        <InboxMessageRow 
                            key={msg.id} 
                            message={msg}
                            isSelected={selectedMessageId === msg.id}
                            onSelect={() => handleSelectMessage(msg.id)}
                            allProviders={allProviders}
                            currentUserPhone={currentUserPhone}
                            onAction={onAction}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                    <p className="mt-1 text-sm text-gray-500">Your messages from the Nikosoko Team will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default InboxView;