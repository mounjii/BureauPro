
import { Category, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Chaise Ergonomique Zenith',
    description: 'Une chaise de bureau haut de gamme conçue pour un confort optimal pendant de longues heures de travail. Son design primé allie élégance et science du corps.',
    price: 349.99,
    category: Category.FURNITURE,
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0000ee20e?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0000ee20e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Support lombaire réglable', 'Accoudoirs 4D', 'Tissu respirant', 'Structure en aluminium recyclé'],
    stock: 12,
  },
  {
    id: '2',
    name: 'Stylo Plume Executive Noir',
    description: 'Un instrument d\'écriture élégant pour les signatures importantes et la prise de notes de prestige. Fabriqué à la main avec une précision chirurgicale.',
    price: 89.00,
    category: Category.WRITING,
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565538412225-3c73f288a75c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Plume en or 14 carats', 'Corps en résine précieuse', 'Rechargeable', 'Livré dans un coffret en bois'],
    stock: 25,
  },
  {
    id: '3',
    name: 'Pack de Papier Recyclé A4',
    description: 'Papier de haute qualité respectueux de l\'environnement, idéal pour toutes vos impressions professionnelles.',
    price: 6.50,
    category: Category.STATIONERY,
    imageUrl: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['80g/m²', 'Blancheur naturelle', 'Certifié FSC', 'Sans chlore'],
    stock: 150,
  },
  {
    id: '4',
    name: 'Moniteur 4K 27 pouces Pro',
    description: 'Écran ultra-haute définition pour une clarté exceptionnelle et un espace de travail étendu. Parfait pour les graphistes et analystes.',
    price: 429.00,
    category: Category.ELECTRONICS,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Dalle IPS Delta E < 2', 'HDR 400', 'Connectique USB-C Power Delivery', 'Bords ultra-fins'],
    stock: 8,
  },
  {
    id: '5',
    name: 'Organiseur de Bureau Bambou',
    description: 'Gardez votre espace de travail impeccable avec cet élégant organiseur en bois naturel de bambou.',
    price: 24.99,
    category: Category.ORGANIZATION,
    imageUrl: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Matériau durable', 'Plusieurs compartiments', 'Design zen', 'Anti-dérapant'],
    stock: 40,
  },
  {
    id: '6',
    name: 'Lampe de Bureau LED Smart',
    description: 'Éclairage modulable avec contrôle de la température de couleur et recharge sans fil intégrée pour smartphone.',
    price: 55.00,
    category: Category.FURNITURE,
    imageUrl: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800'
    ],
    features: ['Gradateur tactile', 'Port de charge USB-C', 'Mode lecture', 'Bras articulé à 360°'],
    stock: 15,
  }
];
