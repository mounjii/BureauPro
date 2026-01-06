// This file is kept for backward compatibility
// The actual implementation is now in apiService.ts
// Import from apiService instead

export * from './apiService';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'bureaupro_users',
  PRODUCTS: 'bureaupro_products',
  CURRENT_USER: 'bureaupro_current_user',
};

// Initialize storage with default data
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    // Create default admin user
    const adminUser: User = {
      id: '1',
      email: 'admin@bureaupro.com',
      name: 'Admin',
      password: 'admin123', // In production, use hashed passwords
      role: 'admin',
      likedProducts: [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
};

// User operations
export const userService = {
  getAllUsers: (): User[] => {
    initializeStorage();
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  createUser: (user: Omit<User, 'id' | 'createdAt' | 'likedProducts'>): User => {
    initializeStorage();
    const users = userService.getAllUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      likedProducts: [],
      createdAt: new Date().toISOString(),
      role: 'user',
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  getUserByEmail: (email: string): User | undefined => {
    const users = userService.getAllUsers();
    return users.find(u => u.email === email);
  },

  getUserById: (id: string): User | undefined => {
    const users = userService.getAllUsers();
    return users.find(u => u.id === id);
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = userService.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  },

  addLikedProduct: (userId: string, productId: string): void => {
    const user = userService.getUserById(userId);
    if (user && !user.likedProducts.includes(productId)) {
      userService.updateUser(userId, {
        likedProducts: [...user.likedProducts, productId],
      });
    }
  },

  removeLikedProduct: (userId: string, productId: string): void => {
    const user = userService.getUserById(userId);
    if (user) {
      userService.updateUser(userId, {
        likedProducts: user.likedProducts.filter(id => id !== productId),
      });
    }
  },
};

// Product operations
export const productService = {
  getAllProducts: (): Product[] => {
    initializeStorage();
    const productsJson = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return productsJson ? JSON.parse(productsJson) : [];
  },

  getProductById: (id: string): Product | undefined => {
    const products = productService.getAllProducts();
    return products.find(p => p.id === id);
  },

  createProduct: (product: Omit<Product, 'id'>): Product => {
    initializeStorage();
    const products = productService.getAllProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  },

  updateProduct: (id: string, updates: Partial<Product>): Product | null => {
    const products = productService.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = { ...products[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products[index];
  },

  deleteProduct: (id: string): boolean => {
    const products = productService.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    return true;
  },
};

// Category operations
export const categoryService = {
  getAllCategories: (): Category[] => {
    return Object.values(Category);
  },

  addCategory: (categoryName: string): Category | null => {
    // Since Category is an enum, we'd need to extend it dynamically
    // For now, we'll use the existing categories
    // In a real app, you'd want a more flexible category system
    const categories = Object.values(Category);
    const upperName = categoryName.trim();
    // Check if category already exists
    if (categories.includes(upperName as Category)) {
      return null;
    }
    // Note: Adding to enum at runtime isn't possible in TypeScript
    // This would require refactoring Category to be a class or interface
    return null;
  },
};

// Auth operations
export const authService = {
  getCurrentUser: (): User | null => {
    initializeStorage();
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  login: (email: string, password: string): User | null => {
    const user = userService.getUserByEmail(email);
    if (user && user.password === password) {
      authService.setCurrentUser(user);
      return user;
    }
    return null;
  },

  logout: (): void => {
    authService.setCurrentUser(null);
  },

  register: (email: string, password: string, name: string): User | null => {
    if (userService.getUserByEmail(email)) {
      return null; // User already exists
    }
    const newUser = userService.createUser({ email, password, name, role: 'user' });
    authService.setCurrentUser(newUser);
    return newUser;
  },
};

