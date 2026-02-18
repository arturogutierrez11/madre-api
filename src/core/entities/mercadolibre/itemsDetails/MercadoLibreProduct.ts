export interface MercadoLibreProduct {
  id: string;
  categoryId: string | null;
  title: string;
  price: number;
  currency: string;
  stock: number;
  soldQuantity: number;
  status: string;
  condition: string;
  permalink: string;
  thumbnail: string;
  pictures: string[];
  sellerSku?: string;
  brand?: string;
  warranty?: string;
  freeShipping?: boolean;
  health?: number;
  lastUpdated?: string;
  description: string;
}
