import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const getAvailabilityColor = () => {
    if (product.available === false) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-green-600 bg-green-50';
  };

  return (
    <div 
      onClick={() => onClick(product)}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-bp-light/40 flex flex-col h-full cursor-pointer relative"
    >
      {/* Image Section with Slide-in Button */}
      <div className={`relative aspect-square overflow-hidden bg-gray-50 ${
        product.available === false ? 'opacity-50' : ''
      }`}>
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Category Label - Enhanced Clarity */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 bg-white text-[10px] font-extrabold text-gray-900 rounded-full uppercase tracking-wider shadow-md border border-gray-100">
            {product.category}
          </span>
        </div>

        {/* Slide-in "Voir détails" Button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20">
          <div className="bg-bp-green py-3 text-center shadow-md">
            <span className="text-bp-black text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              Voir détails
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white">
        <div className="flex justify-between items-start gap-2 sm:gap-3 mb-2">
          <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 group-hover:text-bp-green transition-colors leading-snug">
            {product.name}
          </h3>
          <span className="text-sm sm:text-base font-bold text-bp-green whitespace-nowrap">
            {product.price.toFixed(2)}€
          </span>
        </div>
        
        <div className="mb-4">
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getAvailabilityColor()}`}>
            {product.available !== false ? 'Disponible' : 'Indisponible'}
          </span>
        </div>

        {product.description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mt-auto opacity-80">
            {product.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
