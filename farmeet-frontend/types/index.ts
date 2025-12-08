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
    availableSlots: number;
    createdAt: string;
}

export interface Reservation {
    id: number;
    user: User;
    event: ExperienceEvent;
    numberOfPeople: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
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
