// FIX: Add Page type definition to resolve import error in BottomNav.tsx
export type Page = 'home' | 'tickets' | 'explore' | 'orders' | 'profile' | 'contacts';

export interface Member {
  id: number;
  name: string;
  avatarUrl: string;
  rating: number;
  distanceKm: number;
  hourlyRate: number;
  rateType: 'per hour' | 'per day' | 'per task' | 'per month' | 'per piece work' | 'per km' | 'per sqm' | 'per cbm' | 'per appearance';
  phone: string;
  whatsapp?: string;
  isOnline: boolean;
}

export interface ServiceProvider {
  id: number;
  name: string;
  phone: string;
  whatsapp?: string;
  service: string;
  avatarUrl: string;
  coverImageUrl: string;
  catalogueBannerUrl?: string;
  rating: number;
  distanceKm: number;
  hourlyRate: number;
  rateType: 'per hour' | 'per day' | 'per task' | 'per month' | 'per piece work' | 'per km' | 'per sqm' | 'per cbm' | 'per appearance';
  currency: string;
  isVerified: boolean;
  about: string;
  works: string[];
  category: string;
  location: string;
  isOnline: boolean;
  accountType: 'individual' | 'organization';
  flagCount: number;
  views: number;
  cta: ('call' | 'whatsapp' | 'book' | 'catalogue' | 'join')[];
  profileType?: 'individual' | 'group';
  members?: Member[];
  leaders?: {
    chairperson: string; // phone number
    secretary: string; // phone number
    treasurer: string; // phone number
  };
  joinRequests?: {
    userId: number;
    userName: string;
    userPhone: string;
    status: 'pending' | 'approved' | 'rejected';
    approvals: string[]; // List of leader phone numbers who approved
    rejections: string[]; // List of leader phone numbers who rejected
  }[];
}

export interface Event {
    id: number;
    name: string;
    date: string;
    location: string;
    description: string;
    coverImageUrl: string;
    createdBy: string;
    category: 'Music' | 'Conference' | 'Party' | 'Wedding' | 'Community';
    entryFee: number;
    ticketType: 'single' | 'multiple';
    distanceKm: number;
}

export interface Ticket {
  id: string;
  eventId: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  qrCodeData: string;
}

export type CatalogueCategory = 'For Rent' | 'For Sale' | 'Product' | 'Service';

export interface CatalogueItem {
  id: number;
  providerId: number;
  title: string;
  category: CatalogueCategory;
  description: string;
  price: string;
  imageUrls: string[];
  externalLink?: string;
}

export interface SpecialBanner {
  id: number;
  imageUrl: string;
  targetCategory?: string;
  targetLocation?: string;
  minRating?: number;
  targetService?: string;
  isOnlineTarget?: boolean;
  isVerifiedTarget?: boolean;
  targetReferralCode?: string;
  startDate?: string;
  endDate?: string;
}

export type DocumentType = 'Invoice' | 'Quote' | 'Receipt';

export interface Document {
  id: string;
  type: DocumentType;
  number: string;
  from: string;
  date: string;
  amount: number;
  currency: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
}

export interface Invitation {
  id: string;
  hostId: number;
  hostName: string;
  visitorPhone: string;
  visitDate: string;
  status: 'Active' | 'Canceled' | 'Used';
  accessCode: string;
}

export interface BusinessAssets {
  name: string;
  address: string;
  logo: string | null;
}

export interface InboxMessage {
  id: number;
  recipientPhone?: string; // Target specific user inboxes
  from: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  action?: {
    type: 'saccoJoinRequest';
    organizationId: number;
    requesterId: number;
  };
  requesterProfile?: Partial<ServiceProvider>; // For attaching profile cards to messages
}