export interface PlatformProduct {
    id: string
    name: string
    sku: string
    price: number
    stock: number
    description?: string
    images: string[]
    variants: PlatformProductVariant[]
}

export interface PlatformProductVariant {
    id: string
    sku: string
    price: number
    stock: number
    attributes: Record<string, string> // e.g., { size: "M", color: "Blue" }
}

export interface PlatformOrder {
    id: string
    customer: {
        name: string
        email: string
        document: string // CPF/CNPJ
    }
    items: Array<{
        sku: string
        quantity: number
        price: number
    }>
    status: string // "pending", "paid", "shipped", "delivered", "canceled"
    total: number
    createdAt: Date
}
