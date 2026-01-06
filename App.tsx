import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from './types';
import ProductCard from './components/ProductCard';
import BurocycleLogo from './components/BurocycleLogo';
import { productService, categoryService, Category, authService } from './services/apiService';
import AlertContainer, { AlertData } from './components/AlertContainer';

type View = 'catalogue';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('catalogue');
  
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser && (currentUser.email === 'admin@bureaupro.com' || currentUser.role === 'admin' || currentUser.permissions?.viewDashboard);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showSearchInNavbar, setShowSearchInNavbar] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  // Alert helper function
  const addAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setAlerts(prev => [...prev, { id, type, message }]);
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Load products and categories on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      addAlert('error', 'Erreur lors du chargement des catégories');
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      addAlert('error', 'Erreur lors du chargement des produits');
    }
  };

  // Reload products when view changes
  useEffect(() => {
    if (currentView === 'catalogue') {
      loadProducts();
    }
  }, [currentView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verrouiller le scroll du fond quand la fiche est ouverte
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProduct]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProduct]);

  // Handle scroll to show search in navbar
  useEffect(() => {
    const handleScroll = () => {
      if (currentView !== 'catalogue') {
        setShowSearchInNavbar(false);
        return;
      }
      
      const searchBar = document.getElementById('search-bar');
      if (searchBar) {
        const searchBarBottom = searchBar.getBoundingClientRect().bottom;
        setShowSearchInNavbar(searchBarBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const toggleLike = (productId: string) => {
    // Store liked products in localStorage for visitors
    const likedProducts = JSON.parse(localStorage.getItem('likedProducts') || '[]');
    const index = likedProducts.indexOf(productId);
    
    if (index > -1) {
      likedProducts.splice(index, 1);
    } else {
      likedProducts.push(productId);
    }
    
    localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
    // Force re-render to update UI
    setProducts([...products]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const allCategories = ['Tous', ...categories.map(cat => cat.name)];

  const nextImage = () => {
    if (selectedProduct) {
      const allImages = selectedProduct.imageUrl 
        ? [selectedProduct.imageUrl, ...(selectedProduct.images || [])]
        : (selectedProduct.images || []);
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (selectedProduct) {
      const allImages = selectedProduct.imageUrl 
        ? [selectedProduct.imageUrl, ...(selectedProduct.images || [])]
        : (selectedProduct.images || []);
      setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const renderCatalogueHeader = (title: string, subtitle: string) => (
    <section className="pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-16 text-center animate-in fade-in duration-700">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif italic text-center font-normal tracking-tighter mb-3 sm:mb-4 px-4">{title}</h1>
      <p className="max-w-xl mx-auto text-bp-green mb-6 sm:mb-10 text-xs sm:text-sm px-4">{subtitle}</p>
      
      <div id="search-bar" className="max-w-md mx-auto mb-8 sm:mb-12 px-4">
        <input 
          type="text" 
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-bp-light rounded-lg py-3 sm:py-4 px-6 sm:px-8 focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green outline-none text-xs sm:text-sm transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 px-4">
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg text-[8px] sm:text-[9px] font-bold uppercase tracking-widest transition-all ${
              selectedCategory === cat ? 'bg-bp-green text-bp-black shadow-md' : 'bg-white text-bp-medium border border-bp-light hover:border-bp-green hover:text-bp-black'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );


  return (
    <div className="min-h-screen flex flex-col bg-bp-bg text-bp-black">
      <AlertContainer alerts={alerts} onRemove={removeAlert} position="top-right" />
      {/* HEADER */}
      <header className={`sticky top-0 z-40 bg-white border-b border-bp-light/40 transition-all ${showSearchInNavbar && currentView === 'catalogue' ? 'h-auto' : 'h-16 sm:h-20'}`}>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-16 flex flex-col">
          <div className="flex items-center justify-between relative h-16 sm:h-20">
            {/* Logo à gauche */}
            <div className="cursor-pointer" onClick={() => setCurrentView('catalogue')}>
              <BurocycleLogo size="sm" showText={false} />
            </div>
            
            {/* When scrolled: Different layout for mobile/tablet vs desktop */}
            {showSearchInNavbar && currentView === 'catalogue' ? (
              <>
                {/* Navigation centrée - Mobile & Tablet (iPad) when scrolled */}
                <nav className="hidden lg:hidden sm:flex items-center gap-4 sm:gap-6 absolute left-1/2 transform -translate-x-1/2">
                  <button 
                    onClick={() => setCurrentView('catalogue')}
                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'catalogue' ? 'text-bp-green' : 'text-bp-medium hover:text-bp-black'}`}
                  >
                    Catalogue
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all text-bp-medium hover:text-bp-black"
                    >
                      Dashboard
                    </button>
                  )}
                </nav>

                {/* Search Bar centrée - Desktop only when scrolled */}
                <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center">
                  <input 
                    type="text" 
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 xl:w-64 bg-white border border-bp-light rounded-lg py-2 px-4 focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green outline-none text-sm transition-all shadow-sm"
                  />
                </div>
                
                {/* Navigation à droite - Desktop only when scrolled */}
                <nav className="hidden lg:flex items-center gap-4 xl:gap-6 ml-auto">
                  <button 
                    onClick={() => setCurrentView('catalogue')}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'catalogue' ? 'text-bp-green' : 'text-bp-medium hover:text-bp-black'}`}
                  >
                    Catalogue
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="text-[10px] font-black uppercase tracking-widest transition-all text-bp-medium hover:text-bp-black"
                    >
                      Dashboard
                    </button>
                  )}
                </nav>

                {/* Menu Hamburger - Mobile when scrolled */}
                <button 
                  className="sm:hidden p-2"
                  onClick={() => {
                    const nav = document.getElementById('mobile-nav');
                    if (nav) {
                      nav.classList.toggle('hidden');
                    }
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* Navigation centrée - Tablet & Desktop (iPad included, when not scrolled) */}
                <nav className="hidden sm:flex items-center gap-4 sm:gap-6 lg:gap-8 absolute left-1/2 transform -translate-x-1/2">
                  <button 
                    onClick={() => setCurrentView('catalogue')}
                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${currentView === 'catalogue' ? 'text-bp-green' : 'text-bp-medium hover:text-bp-black'}`}
                  >
                    Catalogue
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all text-bp-medium hover:text-bp-black"
                    >
                      Dashboard
                    </button>
                  )}
                </nav>

                {/* Menu Hamburger - Mobile (when not scrolled) */}
                <button 
                  className="sm:hidden p-2"
                  onClick={() => {
                    const nav = document.getElementById('mobile-nav');
                    if (nav) {
                      nav.classList.toggle('hidden');
                    }
                  }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Search Bar Mobile & Tablet (iPad) - Shows when scrolled */}
          {showSearchInNavbar && currentView === 'catalogue' && (
            <div className="lg:hidden pb-3 px-2">
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-bp-light rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-bp-green/20 focus:border-bp-green outline-none text-sm transition-all shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <nav id="mobile-nav" className="hidden md:hidden bg-white border-t border-bp-light/40 px-4 py-4 space-y-2">
          <button 
            onClick={() => {
              setCurrentView('catalogue');
              const nav = document.getElementById('mobile-nav');
              if (nav) nav.classList.add('hidden');
            }}
            className={`w-full text-left px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${currentView === 'catalogue' ? 'bg-bp-green text-bp-black' : 'text-bp-medium hover:bg-gray-50'}`}
          >
            Catalogue
          </button>
          {isAdmin && (
            <button 
              onClick={() => {
                navigate('/admin');
                const nav = document.getElementById('mobile-nav');
                if (nav) nav.classList.add('hidden');
              }}
              className="w-full text-left px-4 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all text-bp-medium hover:bg-gray-50"
            >
              Dashboard
            </button>
          )}
        </nav>
      </header>

      {/* VUES */}
      {currentView === 'catalogue' && (
        <>
          {renderCatalogueHeader('Mobilier de bureau pro à prix réduit', 'Mobilier revalorisé, impact valorisé')}
          <main className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-12 sm:mb-20">
            {filteredProducts.map(product => {
              return (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={(p) => setSelectedProduct(p)} 
                />
              );
            })}
          </main>
        </>
      )}


      {/* FICHE PRODUIT CENTRALE */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedProduct(null)}
          ></div>
          
          <div className="relative w-full max-w-[950px] h-[95vh] sm:h-[90vh] md:h-[85vh] max-h-[700px] bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 border border-bp-light/20 m-2 sm:m-4">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 bg-white shadow-md p-2 sm:p-2.5 rounded-lg hover:bg-bp-green hover:text-bp-black transition-all duration-200 border border-bp-light/40 touch-manipulation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div className="w-full md:w-1/2 h-1/2 md:h-full bg-[#FBFBFB] relative flex flex-col border-b md:border-b-0 md:border-r border-bp-light/10">
              <div className="flex-grow flex items-center justify-center overflow-hidden group relative">
                {(() => {
                  // Combine imageUrl and images array, with imageUrl as first image
                  const allImages = selectedProduct.imageUrl 
                    ? [selectedProduct.imageUrl, ...(selectedProduct.images || [])]
                    : (selectedProduct.images || []);
                  const currentImage = allImages[activeImageIndex] || selectedProduct.imageUrl;
                  
                  return (
                    <>
                      <img 
                        key={currentImage}
                        src={currentImage} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-cover animate-in fade-in duration-500 cursor-zoom-in"
                        onClick={() => setIsImageZoomed(true)}
                      />
                      
                      {allImages.length > 1 && (
                        <>
                          <button onClick={prevImage} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/90 shadow-md flex items-center justify-center hover:bg-bp-green hover:text-bp-black transition-all duration-200 z-10 touch-manipulation">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                          </button>
                          <button onClick={nextImage} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/90 shadow-md flex items-center justify-center hover:bg-bp-green hover:text-bp-black transition-all duration-200 z-10 touch-manipulation">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {(() => {
                const allImages = selectedProduct.imageUrl 
                  ? [selectedProduct.imageUrl, ...(selectedProduct.images || [])]
                  : (selectedProduct.images || []);
                
                return allImages.length > 1 && (
                  <div className="h-20 sm:h-24 flex items-center justify-center gap-2 sm:gap-3 border-t border-bp-light/10 bg-white px-2 overflow-x-auto">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 touch-manipulation ${
                          activeImageIndex === idx ? 'border-bp-green scale-110 shadow-md' : 'border-transparent opacity-40 hover:opacity-100'
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-white overflow-hidden">
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12 space-y-4 sm:space-y-6 md:space-y-8 scrollbar-hide">
                <div>
                  <span className="text-bp-green text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-2 block">{selectedProduct.category}</span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-bp-black tracking-tight leading-tight sm:leading-none uppercase mb-2 sm:mb-4 break-words">{selectedProduct.name}</h2>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-bp-green">{selectedProduct.price.toFixed(2)} €</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-bp-medium border-b border-bp-light/60 pb-1 sm:pb-2">Description</h4>
                  <div 
                    className="text-xs sm:text-sm text-bp-black font-light leading-relaxed whitespace-pre-wrap break-words max-w-full"
                    style={{ 
                      wordBreak: 'break-word', 
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedProduct.description}
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-bp-medium border-b border-bp-light/60 pb-1 sm:pb-2">Spécifications</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {selectedProduct.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs text-bp-black">
                        <div className="w-1.5 h-1.5 rounded-full bg-bp-green flex-shrink-0"></div>
                        <span className="break-words">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {isImageZoomed && selectedProduct && (
        <div 
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            onClick={() => setIsImageZoomed(false)}
            className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
          
          {(() => {
            const allImages = selectedProduct.imageUrl 
              ? [selectedProduct.imageUrl, ...(selectedProduct.images || [])]
              : (selectedProduct.images || []);
            const currentImage = allImages[activeImageIndex] || selectedProduct.imageUrl;
            
            return (
              <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <img 
                  src={currentImage} 
                  alt={selectedProduct.name} 
                  className="max-w-full max-h-[90vh] object-contain"
                />
                
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex items-center justify-center transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex items-center justify-center transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}
      
      <footer className="mt-auto py-6 sm:py-8 md:py-10 border-t border-bp-light/30 text-center px-4">
        <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-bp-medium/40">© 2024 Burocycle Group International.</p>
      </footer>
    </div>
  );
};

export default App;
