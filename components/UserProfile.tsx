import React from 'react';
import { User, Product } from '../types';
import { productService } from '../services/apiService';
import ProductCard from './ProductCard';
import { useEffect, useState } from 'react';

interface UserProfileProps {
  user: User;
  onToggleLike: (productId: string) => void;
  onProductClick: (product: Product) => void;
  selectedProduct: Product | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onToggleLike, onProductClick, selectedProduct }) => {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const allProducts = await productService.getAllProducts();
      const liked = allProducts.filter(p => user.likedProducts.includes(p.id));
      setLikedProducts(liked);
    };
    loadProducts();
  }, [user.likedProducts]);

  return (
    <section className="max-w-[1800px] mx-auto px-6 lg:px-16 py-20">
      <div className="mb-12">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase">Mon Profil</h1>
        <div className="bg-white p-8 rounded-2xl border border-bp-light/40 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-bp-green text-white flex items-center justify-center text-3xl font-black uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-bp-black">{user.name}</h2>
              <p className="text-bp-medium">{user.email}</p>
              {user.role === 'admin' && (
                <span className="inline-block mt-2 px-3 py-1 bg-bp-green text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Administrateur
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-black uppercase mb-8">Mes produits favoris</h2>
        {likedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
            {likedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isLiked={true}
                onToggleLike={() => onToggleLike(product.id)}
                onClick={onProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-bp-light rounded-[40px] bg-white">
            <p className="text-bp-medium font-light italic">Vous n'avez pas encore de produits favoris.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserProfile;

