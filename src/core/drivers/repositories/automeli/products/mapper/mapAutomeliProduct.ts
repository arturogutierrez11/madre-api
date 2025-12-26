import { AutomeliProduct } from 'src/core/entities/automeli/products/AutomeliProduct';

export function mapAutomeliProduct(item: any): AutomeliProduct {
  return {
    sku: item.sku,
    idMeli: item.id_meli,
    idMeliMainVariant: item.id_meli_main_variant || null,

    appStatus: Number(item.app_status),
    meliStatus: item.meli_status,
    subStatus: item.sub_status || null,
    pauseReason: item.pause_reason || null,
    amzStatus: item.amz_status || null,
    changed: item.changed || null,

    title: item.title,
    brand: item.brand || null,
    meliCategoryName: item.meli_category_name || null,
    meliMainCategory: item.meli_main_category || null,
    taxCategoryId: item.tax_category_id ?? null,

    totalPrice: Number(item.total_price),
    scrapedPrice: Number(item.scraped_price),
    meliSalePrice: Number(item.meli_sale_price),
    discountTotalPrice: item.discount_total_price !== -1 ? Number(item.discount_total_price) : null,
    shippingCost: Number(item.shipping_cost),
    taxes: Number(item.taxes),

    stockQuantity: Number(item.stock_quantity),
    manufacturingTime: item.manufacturing_time || null,
    shippingFrom: item.shipping_from || null,
    maxWeight: item.max_weigth ?? null,

    listingTypeId: item.listing_type_id,
    createUsingPublisher: Boolean(item.create_using_publisher),

    image: item.image || null,
    imageChanged: Boolean(item.image_changed),
    imageChangedUrl: item.image_changed_url || null,
    permalink: item.permalink || null,

    dateCreated: new Date(item.date_created),
    dateUpdated: new Date(item.date_updated),
    dateUpdatedMeli: new Date(item.date_updated_meli),

    raw: item
  };
}
