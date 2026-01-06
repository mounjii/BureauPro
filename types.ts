
export enum Category {
  STATIONERY = 'Papeterie',
  FURNITURE = 'Mobilier',
  ELECTRONICS = 'Informatique',
  WRITING = 'Écriture',
  ORGANIZATION = 'Classement',
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  images: string[];
  features: string[];
  stock: number;
  available: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserPermissions {
  manageProducts: boolean;
  manageCategories: boolean;
  manageCollaborators: boolean;
  viewDashboard: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  password: string; // In production, this would be hashed
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  permissions?: UserPermissions;
  likedProducts: string[];
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
