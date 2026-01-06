import { User, Product } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
      ...options.headers,
    };
    
    // Don't set Content-Type for FormData, browser will set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add authorization if token exists
    const token = localStorage.getItem('bureaupro_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage: any = new Error(error.error || 'Request failed');
      errorMessage.status = response.status;
      errorMessage.data = error;
      throw errorMessage;
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// User operations
export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    throw new Error('Get all users not implemented for API');
  },

  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'likedProducts'>): Promise<User> => {
    return await apiCall('/users/register', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  getUserByEmail: async (email: string): Promise<User | undefined> => {
    throw new Error('Get user by email not implemented for API');
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      return await apiCall(`/users/${id}`);
    } catch {
      return undefined;
    }
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User | null> => {
    try {
      return await apiCall(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch {
      return null;
    }
  },

  addLikedProduct: async (userId: string, productId: string): Promise<void> => {
    const user = await userService.getUserById(userId);
    if (user) {
      const updatedLikedProducts = [...user.likedProducts];
      if (!updatedLikedProducts.includes(productId)) {
        updatedLikedProducts.push(productId);
        await apiCall(`/users/${userId}/liked-products`, {
          method: 'PATCH',
          body: JSON.stringify({ likedProducts: updatedLikedProducts }),
        });
      }
    }
  },

  removeLikedProduct: async (userId: string, productId: string): Promise<void> => {
    const user = await userService.getUserById(userId);
    if (user) {
      const updatedLikedProducts = user.likedProducts.filter(id => id !== productId);
      await apiCall(`/users/${userId}/liked-products`, {
        method: 'PATCH',
        body: JSON.stringify({ likedProducts: updatedLikedProducts }),
      });
    }
  },
};

// Product operations
export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    return await apiCall('/products');
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      return await apiCall(`/products/${id}`);
    } catch {
      return undefined;
    }
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return await apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    try {
      // Get current product first to merge updates
      const currentProduct = await productService.getProductById(id);
      if (!currentProduct) return null;

      const updatedProduct = { ...currentProduct, ...updates };
      return await apiCall(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct),
      });
    } catch {
      return null;
    }
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      await apiCall(`/products/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  },
};

// Category operations
export interface Category {
  id: number;
  name: string;
}

// Upload operations
export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('bureaupro_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
  },

  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('bureaupro_token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || 'Upload failed');
    }

    const data = await response.json();
    return data.imageUrls;
  },
};

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    return await apiCall('/categories');
  },

  addCategory: async (categoryName: string): Promise<Category> => {
    return await apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify({ name: categoryName }),
    });
  },

  updateCategory: async (id: number, categoryName: string): Promise<Category> => {
    return await apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: categoryName }),
    });
  },

  deleteCategory: async (id: number): Promise<void> => {
    return await apiCall(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth operations
export const authService = {
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('bureaupro_current_user');
    return userJson ? JSON.parse(userJson) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem('bureaupro_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bureaupro_current_user');
    }
  },

  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const user = await apiCall('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      authService.setCurrentUser(user);
      return user;
    } catch (error: any) {
      // If account is pending approval, save user data and return it
      if (error.status === 403 && error.data?.user) {
        const pendingUser = error.data.user;
        authService.setCurrentUser(pendingUser);
        return pendingUser;
      }
      return null;
    }
  },

  logout: (): void => {
    authService.setCurrentUser(null);
  },

  register: async (email: string, password: string, name: string, firstName?: string, lastName?: string): Promise<User | null> => {
    try {
      const user = await apiCall('/users/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, firstName, lastName }),
      });
      authService.setCurrentUser(user);
      return user;
    } catch {
      return null;
    }
  },
};

