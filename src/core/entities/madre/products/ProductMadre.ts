/* -----------------------------------------
   Product Aggregate (productos_madre)
----------------------------------------- */

export interface ProductMadre {
  id: number;
  sku: string;
  title: string;
  description: string;
  categoryPath: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';

  images: ProductImage[];
  videoUrl?: string;

  attributes: ProductAttributes;

  shippingTime?: number;

  createdAt: Date;
  updatedAt: Date;
}

/* -----------------------------------------
   Sub-entidades
----------------------------------------- */

export interface ProductImage {
  position: number;
  url: string;
}

export interface ProductAttributes {
  brand?: string;
  color?: string;
  model?: string;
  material?: string;
  size?: string;

  /**
   * JSON original completo
   * (para no perder información)
   */
  raw: Record<string, any>;
}
