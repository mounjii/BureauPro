import React from 'react';

interface BurocycleLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const BurocycleLogo: React.FC<BurocycleLogoProps> = ({ 
  className = '', 
  showText = true,
  size = 'md' 
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12',
    sm: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16',
    md: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28',
    lg: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36',
    xl: 'w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56'
  };

  const textSizeClasses = {
    xs: 'text-xs sm:text-sm md:text-base',
    sm: 'text-sm sm:text-base md:text-lg lg:text-xl',
    md: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
    lg: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
    xl: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 md:gap-4 ${className}`}>
      {/* Logo Burocycle - Image */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0 transition-all`}>
        <img 
          src="/images/burocycle-logo.svg" 
          alt="Burocycle Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Texte Burocycle */}
      {showText && (
        <span className={`${textSizeClasses[size]} font-black uppercase text-bp-black transition-all`}>
          Buro<span className="text-bp-green">cycle</span>
        </span>
      )}
    </div>
  );
};

export default BurocycleLogo;
