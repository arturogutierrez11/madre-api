export interface AutomeliProduct {
  // Identificadores
  sku: string;
  idMeli: string;
  idMeliMainVariant: string | null;

  // Estado
  appStatus: number;
  meliStatus: string;
  subStatus: string | null;
  pauseReason: string | null;
  amzStatus: string | null;
  changed: string | null;

  // Título / Marca / Categoría
  title: string;
  brand: string | null;
  meliCategoryName: string | null;
  meliMainCategory: string | null;
  taxCategoryId: number | null;

  // Precios
  totalPrice: number;
  scrapedPrice: number;
  meliSalePrice: number;
  discountTotalPrice: number | null;
  shippingCost: number;
  taxes: number;

  // Stock / logística
  stockQuantity: number;
  manufacturingTime: string | null;
  shippingFrom: string | null;
  maxWeight: number | null;

  // Listing
  listingTypeId: string;
  createUsingPublisher: boolean;

  // Media / URLs
  image: string | null;
  imageChanged: boolean;
  imageChangedUrl: string | null;
  permalink: string | null;

  // Fechas
  dateCreated: Date;
  dateUpdated: Date;
  dateUpdatedMeli: Date;

  // Crudo
  raw: any;
}
