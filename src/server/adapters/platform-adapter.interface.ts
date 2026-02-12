import { PlatformProduct, PlatformOrder } from '../domain/entities'

export interface IPlatformAdapter {
    platformName: string

    /**
     * Validates the connection configuration.
     * Throws an error if invalid.
     */
    validateConfig(config: unknown): Promise<void>

    /**
     * Fetches products from the platform.
     * @param options Pagination and filtering options
     */
    getProducts(options?: { page?: number; limit?: number }): Promise<PlatformProduct[]>

    /**
     * Fetches orders from the platform.
     * @param options Pagination and filtering options
     */
    getOrders(options?: {
        page?: number;
        limit?: number;
        status?: string;
        createdAtMin?: Date;
    }): Promise<PlatformOrder[]>

    /**
     * Updates inventory for a specific product/variant.
     */
    updateStock(sku: string, quantity: number): Promise<void>

    /**
     * Creates or updates a product on the platform.
     */
    syncProduct(product: PlatformProduct): Promise<void>
}
