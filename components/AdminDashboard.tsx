import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, User, UserPermissions } from '../types';
import { productService, categoryService, uploadService, Category } from '../services/apiService';
import { authService } from '../services/apiService';
import BurocycleLogo from './BurocycleLogo';
import AlertContainer, { AlertData } from './AlertContainer';

interface AdminDashboardProps {
  onProductClick: (product: Product) => void;
  selectedProduct: Product | null;
  onProductsChange?: () => void;
}

type DashboardView = 'products' | 'categories';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onProductClick, selectedProduct, onProductsChange }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<DashboardView>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsData, setSettingsData] = useState({
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'unavailable' | string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const productsListRef = useRef<HTMLDivElement>(null);

  // Get current user permissions
  const currentUser = authService.getCurrentUser();
  const hasPermission = (permission: keyof UserPermissions) => {
    if (!currentUser) return false;
    // Admin principal has all permissions
    if (currentUser.email === 'admin@bureaupro.com' || currentUser.role === 'admin') return true;
    // Check specific permission
    return currentUser.permissions?.[permission] || false;
  };
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mainImageDragActive, setMainImageDragActive] = useState(false);
  const [additionalImagesDragActive, setAdditionalImagesDragActive] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    images: '',
    features: '',
    available: true,
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [currentView]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categoriesData[0].name }));
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (err: any) {
      console.error('Error loading products:', err);
      const errorMessage = err.message || 'Erreur inconnue';
      setError(`Erreur lors du chargement des produits: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category as string,
        imageUrl: product.imageUrl,
        images: product.images.join(', '),
        features: product.features.join(', '),
        available: product.available !== undefined ? product.available : true,
      });
      setMainImagePreview('');
      setAdditionalImagesPreview([]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories.length > 0 ? categories[0].name : '',
        imageUrl: '',
        images: '',
        features: '',
        available: true,
      });
      setMainImagePreview('');
      setAdditionalImagesPreview([]);
    }
    setIsProductFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
    setMainImagePreview('');
    setAdditionalImagesPreview([]);
    setMainImageDragActive(false);
    setAdditionalImagesDragActive(false);
    if (mainImageInputRef.current) mainImageInputRef.current.value = '';
    if (additionalImagesInputRef.current) additionalImagesInputRef.current.value = '';
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);

      // Upload to server
      const imageUrl = await uploadService.uploadImage(file);
      setFormData({ ...formData, imageUrl });
      
      // Revoke preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error: any) {
      addAlert('error', 'Erreur lors de l\'upload: ' + (error.message || 'Erreur inconnue'));
      setMainImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create preview URLs before try block so they're accessible in catch
    const previewUrls = files.map(file => URL.createObjectURL(file));

    try {
      setUploadingImage(true);
      // Show previews immediately
      setAdditionalImagesPreview([...additionalImagesPreview, ...previewUrls]);

      // Upload to server
      const imageUrls = await uploadService.uploadImages(files);
      const newImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
      setFormData({ ...formData, images: [...newImages, ...imageUrls].join(', ') });
      
      // Remove the preview URLs that were just uploaded (they're now in formData.images)
      // We remove the last N previews where N is the number of files uploaded
      setAdditionalImagesPreview(prev => prev.slice(0, prev.length - files.length));
      
      // Revoke preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    } catch (error: any) {
      addAlert('error', 'Erreur lors de l\'upload: ' + (error.message || 'Erreur inconnue'));
      // On error, remove the preview URLs that failed (remove the last N previews)
      setAdditionalImagesPreview(prev => prev.slice(0, prev.length - files.length));
      // Revoke preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      addAlert('warning', 'Veuillez uploader une image principale');
      return;
    }

    const productData: Omit<Product, 'id'> = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category as any,
      imageUrl: formData.imageUrl,
      images: formData.images ? formData.images.split(',').map(url => url.trim()).filter(Boolean) : [],
      features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
      stock: 0,
      available: formData.available,
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
      } else {
        await productService.createProduct(productData);
      }

      await loadProducts();
      if (onProductsChange) onProductsChange();
      handleCloseForm();
      addAlert('success', editingProduct ? 'Produit modifié avec succès' : 'Produit créé avec succès');
    } catch (error: any) {
      addAlert('error', 'Erreur lors de l\'enregistrement: ' + (error.message || 'Erreur inconnue'));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await productService.deleteProduct(id);
      await loadProducts();
      if (onProductsChange) onProductsChange();
    }
  };

  const handleOpenCategoryForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsCategoryFormOpen(true);
  };

  const handleCloseCategoryForm = () => {
    setIsCategoryFormOpen(false);
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryName);
      } else {
        await categoryService.addCategory(categoryName);
      }
      await loadCategories();
      handleCloseCategoryForm();
      addAlert('success', editingCategory ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès');
    } catch (err: any) {
      addAlert('error', err.message || 'Erreur lors de l\'enregistrement de la catégorie');
    }
  };

  const handleUpdateSettings = async () => {
    setSettingsError(null);
    setSettingsSuccess(null);
    setSettingsLoading(true);

    try {
      if (!settingsData.currentPassword) {
        setSettingsError('Le mot de passe actuel est requis');
        setSettingsLoading(false);
        return;
      }

      // If changing password, validate
      if (settingsData.newPassword) {
        if (settingsData.newPassword.length < 6) {
          setSettingsError('Le nouveau mot de passe doit contenir au moins 6 caractères');
          setSettingsLoading(false);
          return;
        }
        if (settingsData.newPassword !== settingsData.confirmPassword) {
          setSettingsError('Les mots de passe ne correspondent pas');
          setSettingsLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('bureaupro_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const updateData: any = {
        currentPassword: settingsData.currentPassword,
      };

      if (settingsData.newEmail) {
        updateData.email = settingsData.newEmail;
      }

      if (settingsData.newPassword) {
        updateData.password = settingsData.newPassword;
      }

      const response = await fetch(`${API_BASE_URL}/users/${currentUser?.id}/settings`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const updatedUser = await response.json();

      // Update current user in localStorage
      const updatedCurrentUser = {
        ...currentUser,
        email: updatedUser.email || currentUser.email,
      };
      localStorage.setItem('bureaupro_user', JSON.stringify(updatedCurrentUser));

      setSettingsSuccess('Paramètres mis à jour avec succès !');
      addAlert('success', 'Paramètres mis à jour avec succès');
      setSettingsData({
        newEmail: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Reload page after 1.5 seconds to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setSettingsError(err.message || 'Erreur lors de la mise à jour des paramètres');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Alert helper function
  const addAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { id, type, message }]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }
    try {
      await categoryService.deleteCategory(id);
      await loadCategories();
      addAlert('success', 'Catégorie supprimée avec succès');
    } catch (err: any) {
      addAlert('error', err.message || 'Erreur lors de la suppression de la catégorie');
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalProducts = products.length;
    const unavailableProducts = products.filter(p => p.available === false).length;
    
    // Products by category
    const productsByCategory = categories.map(category => ({
      categoryName: category.name,
      count: products.filter(p => p.category === category.name).length
    }));

    return {
      totalProducts,
      unavailableProducts,
      availableProducts: totalProducts - unavailableProducts,
      productsByCategory
    };
  }, [products, categories]);

  // Filter products based on active filter
  const filteredProducts = useMemo(() => {
    if (!activeFilter || activeFilter === 'all') {
      return products;
    }
    
    if (activeFilter === 'available') {
      return products.filter(p => p.available !== false);
    }
    
    if (activeFilter === 'unavailable') {
      return products.filter(p => p.available === false);
    }
    
    // Filter by category
    return products.filter(p => p.category === activeFilter);
  }, [products, activeFilter]);

  // Scroll to products list when filter is applied
  useEffect(() => {
    if (activeFilter && productsListRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        productsListRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [activeFilter]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bp-bg">
      <AlertContainer alerts={alerts} onRemove={removeAlert} position="top-right" />
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-bp-light/40 h-16 sm:h-20 flex-shrink-0">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 flex items-center justify-between h-full">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => navigate('/catalogue')}>
            <BurocycleLogo size="sm" showText={false} />
          </div>
          
          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-4 sm:gap-6 lg:gap-8">
            <button 
              onClick={() => navigate('/catalogue')}
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all text-bp-medium hover:text-bp-black"
            >
              Catalogue
            </button>
            <button 
              className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all text-bp-green cursor-default"
            >
              Dashboard
            </button>
            {currentUser && (
              <div className="flex items-center gap-3 pl-4 border-l border-bp-light/40 group relative">
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-bp-green/10 flex items-center justify-center text-[10px] font-bold text-bp-green border border-bp-green/30">
                    {currentUser.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs sm:text-sm font-medium text-bp-black">{currentUser.email}</span>
                    <span className="text-[10px] text-bp-medium">Compte</span>
                  </div>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Professional Dark Style */}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 lg:w-72 bg-bp-black flex-col shrink-0 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex`}>
        <div className="p-6 flex flex-col h-full">
          <nav className="space-y-1 flex-grow">
            {hasPermission('manageProducts') && (
          <button
            onClick={() => {
              setCurrentView('products');
              setSidebarOpen(false);
            }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 touch-manipulation ${
              currentView === 'products'
                    ? 'bg-bp-green/20 text-white border-l-2 border-bp-green' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className={currentView === 'products' ? 'text-bp-green' : ''}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
                </span>
            Produits
          </button>
            )}
          
            {hasPermission('manageCategories') && (
          <button
            onClick={() => {
              setCurrentView('categories');
              setSidebarOpen(false);
            }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 touch-manipulation ${
              currentView === 'categories'
                    ? 'bg-bp-green/20 text-white border-l-2 border-bp-green' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className={currentView === 'categories' ? 'text-bp-green' : ''}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
                </span>
            Catégories
          </button>
            )}

        </nav>

          {currentUser && (
            <div className="mt-auto pt-6 border-t border-gray-700">
              <button
                onClick={() => {
                  authService.logout();
                  window.location.href = '/login';
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-red-600/20 transition-colors duration-200 group touch-manipulation"
              >
                <svg className="w-5 h-5 text-red-500 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </aside>

        {/* Main Content Area */}
        <main className="flex-grow bg-bp-bg overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Products View */}
          {currentView === 'products' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pt-12 md:pt-0">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Vue d'ensemble</h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Gérez vos produits et collections en temps réel.</p>
                </div>
                <button
                  onClick={() => handleOpenForm()}
                  className="bg-bp-green text-bp-black px-4 sm:px-6 py-2.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#b8d03a] transition-all duration-200 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center touch-manipulation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  Ajouter un produit
                </button>
              </div>

              {/* Statistics Section */}
              {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Total Products Card */}
                  <div 
                    onClick={() => setActiveFilter(activeFilter === 'all' ? null : 'all')}
                    className={`bg-white rounded-xl border shadow-sm p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 touch-manipulation ${
                      activeFilter === 'all' ? 'border-bp-green border-2' : 'border-bp-light/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeFilter === 'all' ? 'bg-bp-green' : 'bg-bp-green/10'
                      }`}>
                        <svg className={`w-6 h-6 ${activeFilter === 'all' ? 'text-bp-black' : 'text-bp-green'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Produits</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-bp-black">{statistics.totalProducts}</p>
                  </div>

                  {/* Available Products Card */}
                  <div 
                    onClick={() => setActiveFilter(activeFilter === 'available' ? null : 'available')}
                    className={`bg-white rounded-xl border shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                      activeFilter === 'available' ? 'border-bp-green border-2' : 'border-bp-light/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeFilter === 'available' ? 'bg-bp-green' : 'bg-bp-green/10'
                      }`}>
                        <svg className={`w-6 h-6 ${activeFilter === 'available' ? 'text-bp-black' : 'text-bp-green'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Disponibles</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-bp-green">{statistics.availableProducts}</p>
                  </div>

                  {/* Unavailable Products Card */}
                  <div 
                    onClick={() => setActiveFilter(activeFilter === 'unavailable' ? null : 'unavailable')}
                    className={`bg-white rounded-xl border shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                      activeFilter === 'unavailable' ? 'border-red-500 border-2' : 'border-bp-light/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeFilter === 'unavailable' ? 'bg-red-500' : 'bg-red-100'
                      }`}>
                        <svg className={`w-6 h-6 ${activeFilter === 'unavailable' ? 'text-white' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Indisponibles</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-red-600">{statistics.unavailableProducts}</p>
                  </div>
                </div>
              )}

              {/* Products by Category Section */}
              {!loading && !error && statistics.productsByCategory.length > 0 && (
                <div className="bg-white rounded-xl border border-bp-light/40 shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-bold text-bp-black mb-3 sm:mb-4">Produits par Catégorie</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {statistics.productsByCategory.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setActiveFilter(activeFilter === item.categoryName ? null : item.categoryName)}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 touch-manipulation ${
                          activeFilter === item.categoryName 
                            ? 'bg-bp-green/10 border-bp-green border-2' 
                            : 'bg-bp-bg border-bp-light/40'
                        }`}
                      >
                        <span className="text-sm font-medium text-bp-black">{item.categoryName}</span>
                        <span className={`text-lg font-bold ${activeFilter === item.categoryName ? 'text-bp-green' : 'text-bp-green'}`}>{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filter Badge */}
              {activeFilter && (
                <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-gray-600">Filtre actif:</span>
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-bp-green/10 border border-bp-green rounded-lg">
                    <span className="text-xs sm:text-sm font-medium text-bp-black">
                      {activeFilter === 'all' && 'Tous les produits'}
                      {activeFilter === 'available' && 'Produits disponibles'}
                      {activeFilter === 'unavailable' && 'Produits indisponibles'}
                      {activeFilter !== 'all' && activeFilter !== 'available' && activeFilter !== 'unavailable' && `Catégorie: ${activeFilter}`}
                    </span>
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="text-bp-green hover:text-bp-black transition-colors touch-manipulation"
                      aria-label="Supprimer le filtre"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">({filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''})</span>
                </div>
              )}

              {/* Clean Container Style */}
              <div className="border border-bp-light/40 rounded-xl min-h-[500px] p-8 bg-white shadow-sm">

              {loading && (
                <div className="text-center py-8">
                  <p className="text-sm text-bp-medium">Chargement des produits...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-lg mb-4">
                  <p className="font-bold mb-1.5 text-sm">Erreur</p>
                  <p className="text-xs">{error}</p>
                  <p className="text-xs mt-2 text-red-500">Assurez-vous que le serveur backend est démarré : <code className="bg-red-100 px-2 py-0.5 rounded text-[10px]">npm run server</code></p>
                  <button
                    onClick={loadProducts}
                    className="mt-3 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-red-700 transition-all"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {!loading && !error && products.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-bp-light rounded-xl bg-white">
                  <p className="text-sm text-bp-medium font-light italic mb-3">Aucun produit trouvé.</p>
                  <button
                    onClick={() => handleOpenForm()}
                    className="bg-bp-green text-white px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-bp-black transition-all shadow-md"
                  >
                    Créer le premier produit
                  </button>
                </div>
              )}

              {!loading && !error && (
                  <div ref={productsListRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {filteredProducts.map((p) => (
                      <div key={p.id} className="bg-white p-4 sm:p-5 rounded-xl border border-bp-light/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden">
                        <div className="aspect-square rounded-xl overflow-hidden mb-3 sm:mb-4 bg-gray-100 relative">
                          <img src={p.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-sm ${
                              p.available ? 'bg-bp-green/20 text-bp-black' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.available ? 'Disponible' : 'Indisponible'}
                            </span>
                      </div>
                        </div>
                        
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-[15px] truncate pr-2">{p.name}</h4>
                          <span className="text-bp-green font-extrabold text-sm sm:text-[15px] whitespace-nowrap">{p.price.toFixed(2)}€</span>
                        </div>
                        <p className="text-gray-400 text-[10px] sm:text-[11px] mb-3 sm:mb-4 truncate">{p.category}</p>

                        <div className="flex gap-2 pt-3 sm:pt-4 border-t border-gray-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenForm(p)}
                            className="flex-1 bg-gray-50 text-bp-green py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider hover:bg-bp-green/10 transition-colors duration-200 touch-manipulation"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 bg-gray-50 text-red-600 rounded-lg hover:bg-red-50 transition-colors touch-manipulation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

                {loading && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Chargement des produits...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-lg mb-4">
                    <p className="font-bold mb-1.5 text-sm">Erreur</p>
                    <p className="text-xs">{error}</p>
                  </div>
                )}

                {!loading && !error && products.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <p className="font-medium">Aucun produit trouvé.</p>
                    <button
                      onClick={() => handleOpenForm()}
                      className="mt-4 bg-bp-green text-bp-black px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#b8d03a] transition-all duration-200 shadow-md"
                    >
                      Créer le premier produit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories View */}
          {currentView === 'categories' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Catégories</h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Gérez vos collections de produits.</p>
                </div>
                <button
                  onClick={() => handleOpenCategoryForm()}
                  className="bg-bp-green text-bp-black px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#b8d03a] transition-all duration-200 shadow-md flex items-center gap-2 w-full sm:w-auto justify-center touch-manipulation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  Ajouter Catégorie
                </button>
              </div>

              <div className="border border-bp-light/40 rounded-xl min-h-[500px] p-8 bg-white shadow-sm">
                <div className="bg-white p-6 rounded-xl border border-bp-light/40 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Catégories ({categories.length})</h2>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-bp-green/10 text-bp-black rounded-lg text-xs font-bold uppercase group border border-bp-green/30"
                    >
                      <span>{cat.name}</span>
                      <button
                        onClick={() => handleOpenCategoryForm(cat)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-bp-green hover:text-bp-black p-1"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {categories.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                      <p className="font-medium">Aucune catégorie. Ajoutez-en une pour commencer.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Category Form Modal */}
      {isCategoryFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseCategoryForm}
          ></div>

          <div className="relative bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-lg mx-2 sm:mx-4">
            <button
              onClick={handleCloseCategoryForm}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-black uppercase mb-5">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>

            <form onSubmit={handleCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bp-medium mb-1.5">
                  Nom de la catégorie
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-bp-light rounded-lg focus:ring-2 focus:ring-bp-green focus:outline-none text-sm"
                  required
                  placeholder="Ex: Papeterie"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-bp-green text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-bp-black transition-all shadow-md"
                >
                  {editingCategory ? 'Enregistrer' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseCategoryForm}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isProductFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-all" onClick={handleCloseForm} />
          <form 
            onSubmit={handleSubmit}
            className="relative bg-white rounded-xl w-full max-w-xl p-10 shadow-lg animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Modifier' : 'Nouveau'} Produit</h3>
              <button type="button" onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green transition-all duration-200 font-medium" 
                />
              </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 px-1">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green transition-all duration-200 font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 px-1">Collection</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green transition-all duration-200 font-medium"
                >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-gray-400 px-1">Statut</label>
                  <select 
                    value={formData.available ? 'Disponible' : 'Indisponible'}
                    onChange={(e) => setFormData({ ...formData, available: e.target.value === 'Disponible' })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green transition-all duration-200 font-medium"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Indisponible">Indisponible</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Description narrative</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3} 
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green transition-all duration-200 font-medium resize-none" 
                />
              </div>


              {/* Image principale */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Image principale</label>
                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMainImageDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMainImageDragActive(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMainImageDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const fakeEvent = { target: { files: [file] } } as any;
                      handleMainImageUpload(fakeEvent);
                    }
                  }}
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
                    mainImageDragActive
                      ? 'border-bp-green bg-bp-green/10'
                      : 'border-gray-200 bg-gray-50 hover:border-bp-green/50 hover:bg-bp-green/5'
                  }`}
                  onClick={() => mainImageInputRef.current?.click()}
                >
                  <input
                    ref={mainImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="hidden"
                  />
                  {mainImagePreview || formData.imageUrl ? (
                    <div className="relative">
                      <img
                        src={mainImagePreview || formData.imageUrl}
                        alt="Image principale"
                        className="w-full h-48 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMainImagePreview('');
                          setFormData({ ...formData, imageUrl: '' });
                          if (mainImageInputRef.current) mainImageInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-lg p-1.5 hover:bg-red-600 transition-all duration-200 shadow-md"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-600 mb-1">Cliquez ou glissez-déposez une image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF jusqu'à 10MB</p>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bp-green mx-auto mb-2"></div>
                        <p className="text-xs text-gray-600">Upload en cours...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Images supplémentaires */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Images supplémentaires (max 10)</label>
                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAdditionalImagesDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAdditionalImagesDragActive(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAdditionalImagesDragActive(false);
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                    if (files.length > 0) {
                      const fakeEvent = { target: { files } } as any;
                      handleAdditionalImagesUpload(fakeEvent);
                    }
                  }}
                  className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                    additionalImagesDragActive
                      ? 'border-bp-green bg-bp-green/10'
                      : 'border-gray-200 bg-gray-50 hover:border-bp-green/50 hover:bg-bp-green/5'
                  }`}
                  onClick={() => additionalImagesInputRef.current?.click()}
                >
                  <input
                    ref={additionalImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                  />
                  <div className="text-center mb-3">
                    <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-xs font-medium text-gray-600">Cliquez ou glissez-déposez des images</p>
                  </div>
                </div>

                {/* Grille d'images supplémentaires */}
                {(additionalImagesPreview.length > 0 || formData.images) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {additionalImagesPreview.map((url, idx) => (
                      <div key={`preview-${idx}`} className="relative group">
                        <img
                          src={url}
                          alt={`Aperçu ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPreviews = additionalImagesPreview.filter((_, i) => i !== idx);
                            setAdditionalImagesPreview(newPreviews);
                            const currentImages = formData.images ? formData.images.split(',').filter(Boolean) : [];
                            setFormData({ ...formData, images: currentImages.join(', ') });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {formData.images && formData.images.split(',').map((url, idx) => (
                      url.trim() && (
                        <div key={`existing-${idx}`} className="relative group">
                          <img
                            src={url.trim()}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentImages = formData.images.split(',').filter((u, i) => u.trim() && i !== idx);
                              setFormData({ ...formData, images: currentImages.join(', ') });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>

              {/* Caractéristiques */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Caractéristiques (séparées par des virgules)</label>
                <input
                  type="text"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green transition-all duration-200 font-medium"
                  placeholder="Caractéristique 1, Caractéristique 2..."
                />
              </div>

              <div className="flex gap-4 mt-10">
                <button type="submit" className="flex-[2] bg-bp-green text-bp-black py-4 rounded-lg font-bold hover:bg-[#b8d03a] transition-all duration-200 shadow-md">
                  Enregistrer le produit
                </button>
                <button type="button" onClick={handleCloseForm} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-lg font-bold hover:bg-gray-200 transition-all duration-200">
                  Fermer
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setIsSettingsModalOpen(false);
              setSettingsData({
                newEmail: '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              setSettingsError(null);
              setSettingsSuccess(null);
              setShowCurrentPassword(false);
              setShowNewPassword(false);
              setShowConfirmPassword(false);
            }}
          ></div>

          <div className="relative bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-lg mx-2 sm:mx-4">
            <button
              onClick={() => {
                setIsSettingsModalOpen(false);
                setSettingsData({
                  newEmail: '',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                setSettingsError(null);
                setSettingsSuccess(null);
              }}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-black uppercase mb-5">
              Paramètres du compte
            </h2>

            <div className="space-y-4">
              {settingsError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {settingsError}
                </div>
              )}

              {settingsSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  {settingsSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bp-medium mb-1.5">
                  Email actuel
                </label>
                <input
                  type="email"
                  value={currentUser.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-bp-light rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bp-medium mb-1.5">
                  Nouvel email
                </label>
                <input
                  type="email"
                  value={settingsData.newEmail}
                  onChange={(e) => setSettingsData({ ...settingsData, newEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-bp-light rounded-lg focus:ring-2 focus:ring-bp-green focus:outline-none text-sm"
                  placeholder="nouveau@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bp-medium mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={settingsData.currentPassword}
                    onChange={(e) => setSettingsData({ ...settingsData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-bp-light rounded-lg focus:ring-2 focus:ring-bp-green focus:outline-none text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bp-medium hover:text-bp-black transition-colors focus:outline-none"
                    aria-label={showCurrentPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showCurrentPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bp-medium mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={settingsData.newPassword}
                    onChange={(e) => setSettingsData({ ...settingsData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-bp-light rounded-lg focus:ring-2 focus:ring-bp-green focus:outline-none text-sm"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bp-medium hover:text-bp-black transition-colors focus:outline-none"
                    aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bp-medium mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={settingsData.confirmPassword}
                    onChange={(e) => setSettingsData({ ...settingsData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-bp-light rounded-lg focus:ring-2 focus:ring-bp-green focus:outline-none text-sm"
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bp-medium hover:text-bp-black transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleUpdateSettings}
                  disabled={settingsLoading}
                  className="flex-1 bg-bp-green text-bp-black py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#b8d03a] transition-all duration-200 shadow-md disabled:opacity-50"
                >
                  {settingsLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    setSettingsData({
                      newEmail: '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setSettingsError(null);
                    setSettingsSuccess(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-gray-300 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;
