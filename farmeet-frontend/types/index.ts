// 型定義
export interface User {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'FARMER' | 'ADMIN';
    avatarUrl?: string;
    phoneNumber?: string;
}

export interface Farm {
    id: number;
    name: string;
    description: string;
    location: string;
    owner: User;
    imageUrl?: string;
    images?: string[];
    features?: string[];
    createdAt: string;
}

export interface ExperienceEvent {
    id: number;
    farm: Farm;
    title: string;
    description: string;
    eventDate: string;
    capacity: number;
    price: number;
    childPrice?: number; // 子供料金（6-12歳）
    availableSlots: number;
    createdAt: string;
}

export interface Reservation {
    id: number;
    user: User;
    event: ExperienceEvent;
    numberOfPeople: number;
    numberOfAdults?: number; // 大人人数（13歳以上）
    numberOfChildren?: number; // 子供人数（6-12歳）
    numberOfInfants?: number; // 幼児人数（0-5歳、無料）
    status: 'PENDING' | 'PENDING_PAYMENT' | 'AWAITING_TRANSFER' | 'PAYMENT_FAILED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    totalPrice: number;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    email: string;
    role: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    role?: string;
    phoneNumber?: string;
    phoneOtp?: string;
}

export interface AuthRequest {
    email: string;
    password: string;
}

export interface ReservationRequest {
    eventId: number;
    numberOfPeople: number;
}

export interface PhoneVerificationResponse {
    token: string | null;
    registered: boolean;
}

export interface Review {
    id: number;
    farmId: number;
    user: User;
    rating: number;
    comment: string;
    createdAt: string;
}
