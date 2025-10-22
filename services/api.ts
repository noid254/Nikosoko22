import { 
    MOCK_PROVIDERS, 
    MOCK_CATALOGUE_ITEMS, 
    MOCK_DOCUMENTS, 
    // FIX: Corrected typo in MOCK_INVITATIONS.
    MOCK_INVITATIONS, 
    MOCK_SPECIAL_BANNERS, 
    MOCK_INBOX_MESSAGES,
    MOCK_USER_TICKETS,
    MOCK_EVENTS,
    DEFAULT_BANNERS,
    REFERRAL_CODES,
    CATEGORIES_DATA
} from './mockData';
import type { ServiceProvider, CatalogueItem, Document, Invitation, SpecialBanner, InboxMessage, Event, Premise } from '../types';

export { DEFAULT_BANNERS, REFERRAL_CODES, MOCK_USER_TICKETS };


const providersDB: ServiceProvider[] = [...MOCK_PROVIDERS];
const catalogueDB: CatalogueItem[] = [...MOCK_CATALOGUE_ITEMS];
const documentsDB: Document[] = [...MOCK_DOCUMENTS];
const invitationsDB: Invitation[] = [...MOCK_INVITATIONS];
const bannersDB: SpecialBanner[] = [...MOCK_SPECIAL_BANNERS];
const inboxDB: InboxMessage[] = [...MOCK_INBOX_MESSAGES];
const categoriesDB: string[] = Object.keys(CATEGORIES_DATA);
const eventsDB: Event[] = [...MOCK_EVENTS];
const premisesDB: Premise[] = [];


const SIMULATED_DELAY = 250; // ms, reduced for snappier feel

const simulateRequest = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(data))); 
        }, SIMULATED_DELAY);
    });
};

// --- API Functions ---

export const getProviders = (): Promise<ServiceProvider[]> => simulateRequest(providersDB);
export const getEvents = (): Promise<Event[]> => simulateRequest(eventsDB);
export const getCatalogueItems = (): Promise<CatalogueItem[]> => simulateRequest(catalogueDB);
export const getDocuments = (): Promise<Document[]> => simulateRequest(documentsDB);
export const getInvitations = (): Promise<Invitation[]> => simulateRequest(invitationsDB);
export const getSpecialBanners = (): Promise<SpecialBanner[]> => simulateRequest(bannersDB);
export const getInboxMessages = (): Promise<InboxMessage[]> => simulateRequest(inboxDB);
export const getCategories = (): Promise<string[]> => simulateRequest(categoriesDB);


export const createProvider = (providerData: ServiceProvider): Promise<ServiceProvider> => {
    const newProvider = { ...providerData, id: Date.now() }; 
    providersDB.push(newProvider);
    return simulateRequest(newProvider);
}

export const addEvent = (eventData: Omit<Event, 'id'>): Promise<Event> => {
    const newEvent: Event = {
        ...eventData,
        id: Date.now(),
        distanceKm: Math.round(Math.random() * 5 * 10) / 10,
        attendees: [],
    };
    eventsDB.unshift(newEvent);
    return simulateRequest(newEvent);
};

export const updateProvider = (updatedProvider: ServiceProvider): Promise<ServiceProvider> => {
    const index = providersDB.findIndex(p => p.id === updatedProvider.id);
    if (index !== -1) {
        providersDB[index] = updatedProvider;
        return simulateRequest(updatedProvider);
    }
    return Promise.reject(new Error("Provider not found"));
}

export const deleteProvider = (providerId: number): Promise<{ success: true }> => {
    const index = providersDB.findIndex(p => p.id === providerId);
    if (index !== -1) {
        providersDB.splice(index, 1);
        return simulateRequest({ success: true });
    }
     return Promise.reject(new Error("Provider not found"));
}

// --- NEW API Functions for real-world readiness ---

export const sendOtp = (phone: string): Promise<{ success: boolean }> => {
    console.log(`[API MOCK] Sending OTP to ${phone}`);
    // In a real backend, this would trigger a Twilio SMS.
    return simulateRequest({ success: true });
};

export interface VerifyOtpResponse {
    success: boolean;
    user: ServiceProvider | null;
    isSuperAdmin: boolean;
    token: string; // For session management
}

export const verifyOtp = (phone: string): Promise<VerifyOtpResponse> => {
    console.log(`[API MOCK] Verifying phone ${phone} without OTP`);
    const existingUser = providersDB.find(p => p.phone === phone);
    const isSuperAdmin = phone.endsWith('723119356');

    return simulateRequest({
        success: true,
        user: existingUser || null,
        isSuperAdmin,
        token: 'mock-jwt-token-for-session-management'
    });
};

export const createInvitation = (
    invitationData: Omit<Invitation, 'id' | 'status' | 'accessCode' | 'type'>,
    type: 'Invite' | 'Knock'
): Promise<Invitation> => {
    
    let newInvitation: Invitation;
    if (type === 'Invite') {
         const host = providersDB.find(p => p.id === invitationData.hostId);
        if (!host) return Promise.reject(new Error("Host user not found"));
        newInvitation = {
            ...invitationData,
            id: `inv-${Date.now()}`,
            status: 'Active',
            accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
            hostName: host.name,
            type: 'Invite',
        };
    } else { // 'Knock'
        const visitor = providersDB.find(p => p.id === invitationData.visitorId);
        if (!visitor) return Promise.reject(new Error("Visitor user not found"));
         newInvitation = {
            ...invitationData,
            id: `knock-${Date.now()}`,
            status: 'Pending',
            accessCode: 'PENDING',
            visitorName: visitor.name,
            visitorAvatar: visitor.avatarUrl,
            type: 'Knock',
        };
    }
    
    invitationsDB.unshift(newInvitation);
    return simulateRequest(newInvitation);
};

export const updateInvitation = (invitationId: string, status: Invitation['status']): Promise<Invitation> => {
    const index = invitationsDB.findIndex(inv => inv.id === invitationId);
    if (index !== -1) {
        invitationsDB[index].status = status;
        // If approved, generate an access code
        if (status === 'Approved') {
             invitationsDB[index].accessCode = Math.floor(100000 + Math.random() * 900000).toString();
        }
        return simulateRequest(invitationsDB[index]);
    }
    return Promise.reject(new Error("Invitation not found"));
};

export const addDocument = (docData: Omit<Document, 'id'>): Promise<Document> => {
    const newDoc: Document = {
        id: `doc-${Date.now()}`,
        ...docData,
    };
    documentsDB.unshift(newDoc);
    return simulateRequest(newDoc);
};

export const updateDocument = (updatedDoc: Document): Promise<Document> => {
    const index = documentsDB.findIndex(d => d.id === updatedDoc.id);
    if (index !== -1) {
        documentsDB[index] = updatedDoc;
        return simulateRequest(updatedDoc);
    }
    return Promise.reject(new Error("Document not found"));
};

export const initiateAssetTransfer = (documentId: string, newOwnerPhone: string, currentOwner: ServiceProvider): Promise<Document> => {
    const docIndex = documentsDB.findIndex(d => d.id === documentId);
    if (docIndex === -1) return Promise.reject(new Error("Document not found"));
    
    documentsDB[docIndex].pendingOwnerPhone = newOwnerPhone;
    
    // Normalize phone for lookup
    const normalizedNewOwnerPhone = newOwnerPhone.slice(-9);
    const newOwnerUser = providersDB.find(p => p.phone.endsWith(normalizedNewOwnerPhone));

    const newMessage: InboxMessage = {
        id: Date.now(),
        recipientPhone: newOwnerUser ? newOwnerUser.phone : newOwnerPhone, // send to new owner
        from: 'Niko Soko Assets',
        subject: `Asset Transfer Request from ${currentOwner.name}`,
        body: `${currentOwner.name} wants to transfer ownership of "${documentsDB[docIndex].items?.[0]?.description}" to you.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        action: {
            type: 'assetTransfer',
            documentId: documentId,
        },
    };
    inboxDB.unshift(newMessage);

    return simulateRequest(documentsDB[docIndex]);
};

export const finalizeAssetTransfer = (documentId: string, decision: 'accept' | 'deny', recipientId: number): Promise<Document> => {
    const docIndex = documentsDB.findIndex(d => d.id === documentId);
    if (docIndex === -1) return Promise.reject(new Error("Document not found"));

    const recipient = providersDB.find(p => p.id === recipientId);
    if (!recipient) return Promise.reject(new Error("Recipient not found"));

    if (decision === 'accept') {
        documentsDB[docIndex].ownerPhone = recipient.phone;
    }
    
    documentsDB[docIndex].pendingOwnerPhone = undefined;

    // TODO: Send notification back to original owner
    return simulateRequest(documentsDB[docIndex]);
};

export const registerPremise = (name: string, superhostId: number): Promise<Premise> => {
    const newPremise: Premise = {
        id: `premise-${Date.now()}`,
        name,
        superhostId,
        hosts: [superhostId]
    };
    premisesDB.push(newPremise);
    console.log('[API MOCK] Registered new premise:', newPremise);
    return simulateRequest(newPremise);
};