import { IPlatformAdapter } from './platform-adapter.interface'
import { PlatformProduct, PlatformOrder } from '../domain/entities'

interface NuvemShopConfig {
    accessToken: string
    userId: string // Store ID
    userAgent: string // Required by NuvemShop (AppName (email))
}

export class NuvemShopAdapter implements IPlatformAdapter {
    platformName = 'nuvemshop'
    private config: NuvemShopConfig
    private baseUrl = 'https://api.nuvemshop.com.br/v1'

    constructor(config: NuvemShopConfig) {
        this.config = config
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

        return data.map((item: any) => ({
            id: String(item.id),
            name: item.name.pt || item.name.es || item.name, // Nuvemshop supports multiple languages
            sku: item.variants[0]?.sku || '',
            price: parseFloat(item.variants[0]?.price || '0'),
            stock: item.variants[0]?.stock || 0,
            description: item.description?.pt || item.description?.es || '',
            images: item.images.map((img: any) => img.src),
            variants: item.variants.map((v: any) => ({
                id: String(v.id),
                sku: v.sku,
                price: parseFloat(v.price),
                stock: v.stock,
                attributes: v.values ? v.values.reduce((acc: any, val: any) => ({ ...acc, [val.pt]: val.pt }), {}) : {}, // formatting varies
            }))
        }))
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

    async updateStock(sku: string, quantity: number): Promise<void> {
        // Logic to find product variant by SKU and update stock
        throw new Error('Method not implemented.')
    }

    async syncProduct(product: PlatformProduct): Promise<void> {
        // Logic to create/update product
        throw new Error('Method not implemented.')
    }
}
