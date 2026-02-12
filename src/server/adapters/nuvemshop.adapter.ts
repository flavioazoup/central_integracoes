import { IPlatformAdapter } from './platform-adapter.interface'
import { PlatformProduct, PlatformOrder } from '../domain/entities'

export interface NuvemShopConfig {
    accessToken: string
    userId: string // Store ID
    userAgent: string // Required by NuvemShop (AppName (email))
}

type NuvemShopVariant = {
    id: number
    sku: string
    price: string
    stock: number
}

type NuvemShopProduct = {
    id: number
    name: { pt?: string; es?: string } | string
    description?: { pt?: string; es?: string } | string
    images: Array<{ src: string }>
    variants: NuvemShopVariant[]
}

export class NuvemShopAdapter implements IPlatformAdapter {
    platformName = 'nuvemshop'
    private config: NuvemShopConfig
    private baseUrl = 'https://api.nuvemshop.com.br/v1'

    constructor(config: NuvemShopConfig) {
        this.config = config
    }

    private normalizePrice(price: unknown): number {
        if (typeof price === 'number') {
            if (Number.isFinite(price)) return price
            return 0
        }

        const parsed = parseFloat(String(price ?? '0'))
        return Number.isFinite(parsed) ? parsed : 0
    }

    private normalizeStock(stock: unknown): number {
        if (typeof stock === 'number') {
            if (Number.isFinite(stock) && stock >= 0) return stock
            return 0
        }

        const parsed = parseInt(String(stock ?? '0'), 10)
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
    }

    private buildHeaders() {
        return {
            'Authentication': `bearer ${this.config.accessToken}`,
            'User-Agent': this.config.userAgent,
            'Content-Type': 'application/json',
        }
    }

    async validateConfig(config: unknown): Promise<void> {
        const cfg = config as NuvemShopConfig
        if (!cfg.accessToken || !cfg.userId || !cfg.userAgent) {
            throw new Error('Invalid NuvemShop configuration: accessToken, userId, and userAgent are required.')
        }
        // Simple ping to verify credentials (e.g., fetch store info)
        const response = await fetch(`${this.baseUrl}/${cfg.userId}/store`, {
            headers: {
                'Authentication': `bearer ${cfg.accessToken}`,
                'User-Agent': cfg.userAgent,
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to validate NuvemShop credentials: ${response.statusText}`)
        }
    }

    async getProducts(options?: { page?: number; limit?: number }): Promise<PlatformProduct[]> {
        const page = options?.page || 1
        const limit = options?.limit || 20

        // https://api.nuvemshop.com.br/v1/{user_id}/products
        const response = await fetch(`${this.baseUrl}/${this.config.userId}/products?page=${page}&per_page=${limit}`, {
            headers: {
                'Authentication': `bearer ${this.config.accessToken}`,
                'User-Agent': this.config.userAgent,
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`)
        }

        const data = await response.json()

        return data.map((item: any) => {
            const rawVariants = Array.isArray(item.variants) ? item.variants : []
            const firstVariant = rawVariants[0]

            const variants = rawVariants.length > 0
                ? rawVariants.map((v: any) => ({
                    id: String(v.id),
                    sku: v.sku ?? '',
                    price: this.normalizePrice(v.price),
                    stock: this.normalizeStock(v.stock),
                    attributes: v.values
                        ? v.values.reduce((acc: any, val: any) => ({ ...acc, [val.pt]: val.pt }), {})
                        : {},
                }))
                : [{
                    id: String(item.id),
                    sku: '',
                    price: this.normalizePrice(undefined),
                    stock: this.normalizeStock(undefined),
                    attributes: {} as Record<string, string>,
                }]

            return {
                id: String(item.id),
                name: (item.name?.pt || item.name?.es || item.name) ?? '',
                sku: firstVariant?.sku ?? variants[0]?.sku ?? '',
                price: this.normalizePrice(firstVariant?.price ?? variants[0]?.price),
                stock: this.normalizeStock(firstVariant?.stock ?? variants[0]?.stock),
                description: item.description?.pt || item.description?.es || '',
                images: Array.isArray(item.images) ? item.images.map((img: any) => img.src) : [],
                variants,
            }
        })
    }

    async getOrders(options?: {
        page?: number;
        limit?: number;
        status?: string;
        createdAtMin?: Date;
    }): Promise<PlatformOrder[]> {
        const page = options?.page || 1
        const limit = options?.limit || 20
        const status = options?.status ? `&status=${options.status}` : ''
        const dateFilter = options?.createdAtMin
            ? `&created_at_min=${options.createdAtMin.toISOString()}`
            : ''

        const response = await fetch(`${this.baseUrl}/${this.config.userId}/orders?page=${page}&per_page=${limit}${status}${dateFilter}`, {
            headers: {
                'Authentication': `bearer ${this.config.accessToken}`,
                'User-Agent': this.config.userAgent,
            },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.statusText}`)
        }

        const data = await response.json()

        return data.map((order: any) => ({
            id: String(order.id),
            customer: {
                name: order.customer.name,
                email: order.customer.email,
                document: order.customer.billing_address?.zipcode || '', // Nuvemshop customer object might vary
            },
            items: order.products.map((p: any) => ({
                sku: p.sku || '',
                quantity: parseInt(p.quantity),
                price: parseFloat(p.price),
            })),
            status: order.status,
            total: parseFloat(order.total),
            createdAt: new Date(order.created_at),
        }))
    }

    private mapPlatformProductToPayload(product: PlatformProduct) {
        return {
            name: {
                pt: product.name,
            },
            description: product.description
                ? { pt: product.description }
                : undefined,
            images: product.images.map(src => ({ src })),
            variants: product.variants.map(v => ({
                sku: v.sku,
                price: v.price.toFixed(2),
                stock: v.stock,
            })),
        }
    }

    async updateStock(sku: string, quantity: number): Promise<void> {
        // 1) Buscar produtos pelo SKU
        const searchResponse = await fetch(
            `${this.baseUrl}/${this.config.userId}/products?sku=${encodeURIComponent(sku)}`,
            { headers: this.buildHeaders() }
        )

        if (!searchResponse.ok) {
            throw new Error(`Failed to search product by SKU ${sku}: ${searchResponse.statusText}`)
        }

        const products: NuvemShopProduct[] = await searchResponse.json()

        if (!products.length) {
            throw new Error(`No product found for SKU ${sku}`)
        }

        const product = products.find(p =>
            Array.isArray(p.variants) && p.variants.some(v => v.sku === sku)
        )

        if (!product) {
            throw new Error(`No variant with SKU ${sku} found in returned products`)
        }

        const variant = product.variants.find(v => v.sku === sku)
        if (!variant) {
            throw new Error(`Variant with SKU ${sku} not found`)
        }

        // 2) Atualizar estoque do variant
        const updateResponse = await fetch(
            `${this.baseUrl}/${this.config.userId}/products/${product.id}/variants/${variant.id}`,
            {
                method: 'PUT',
                headers: this.buildHeaders(),
                body: JSON.stringify({
                    stock: quantity,
                }),
            }
        )

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text().catch(() => '')
            throw new Error(
                `Failed to update stock for SKU ${sku}: ${updateResponse.status} ${updateResponse.statusText} ${errorText}`
            )
        }
    }

    async syncProduct(product: PlatformProduct): Promise<void> {
        const payload = this.mapPlatformProductToPayload(product)

        const hasRemoteId = !!product.id

        const url = hasRemoteId
            ? `${this.baseUrl}/${this.config.userId}/products/${product.id}`
            : `${this.baseUrl}/${this.config.userId}/products`

        const method = hasRemoteId ? 'PUT' : 'POST'

        const response = await fetch(url, {
            method,
            headers: this.buildHeaders(),
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '')
            throw new Error(
                `Failed to ${hasRemoteId ? 'update' : 'create'} product on NuvemShop: ` +
                `${response.status} ${response.statusText} ${errorBody}`
            )
        }
    }
}
