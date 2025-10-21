import { 
    MOCK_PROVIDERS, 
    MOCK_CATALOGUE_ITEMS, 
    MOCK_DOCUMENTS, 
    MOCK_INVITATIONS, 
    MOCK_SPECIAL_BANNERS, 
    MOCK_INBOX_MESSAGES,
    MOCK_USER_TICKETS,
    DEFAULT_BANNERS,
    REFERRAL_CODES,
    CATEGORIES_DATA
} from '../constants';
import type { ServiceProvider, CatalogueItem, Document, Invitation, SpecialBanner, InboxMessage } from '../types';

export { DEFAULT_BANNERS, REFERRAL_CODES, MOCK_USER_TICKETS };


const providersDB: ServiceProvider[] = [...MOCK_PROVIDERS];
const catalogueDB: CatalogueItem[] = [...MOCK_CATALOGUE_ITEMS];
const documentsDB: Document[] = [...MOCK_DOCUMENTS];
const invitationsDB: Invitation[] = [...MOCK_INVITATIONS];
const bannersDB: SpecialBanner[] = [...MOCK_SPECIAL_BANNERS];
const inboxDB: InboxMessage[] = [...MOCK_INBOX_MESSAGES];
const categoriesDB: string[] = Object.keys(CATEGORIES_DATA);

const SIMULATED_DELAY = 500; // ms

const simulateRequest = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(data))); 
        }, SIMULATED_DELAY);
    });
};

// --- API Functions ---

export const getProviders = (): Promise<ServiceProvider[]> => simulateRequest(providersDB);
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

export const verifyOtp = (phone: string, otp: string): Promise<VerifyOtpResponse> => {
    if (otp !== '1234') {
        return Promise.reject(new Error("Invalid OTP. Please try again."));
    }
    const existingUser = providersDB.find(p => p.phone === phone);
    const isSuperAdmin = phone.endsWith('723119356');

    return simulateRequest({
        success: true,
        user: existingUser || null,
        isSuperAdmin,
        token: 'mock-jwt-token-for-session-management'
    });
};

export const createInvitation = (invitationData: Omit<Invitation, 'id' | 'status' | 'accessCode' | 'hostName'>): Promise<Invitation> => {
    const host = providersDB.find(p => p.id === invitationData.hostId);
    if (!host) return Promise.reject(new Error("Host user not found"));

    const newInvitation: Invitation = {
        ...invitationData,
        id: `inv-${Date.now()}`,
        status: 'Active',
        accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
        hostName: host.name,
    };
    invitationsDB.unshift(newInvitation);
    return simulateRequest(newInvitation);
};

export const updateInvitation = (invitationId: string, status: 'Canceled' | 'Used'): Promise<Invitation> => {
    const index = invitationsDB.findIndex(inv => inv.id === invitationId);
    if (index !== -1) {
        invitationsDB[index].status = status;
        return simulateRequest(invitationsDB[index]);
    }
    return Promise.reject(new Error("Invitation not found"));
};
