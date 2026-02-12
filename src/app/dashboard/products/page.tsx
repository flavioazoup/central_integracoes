import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/server/services/tenant.service'
import { Package } from 'lucide-react'
import { DataFilter } from '@/components/dashboard/data-filter'
import { ProductCard } from '@/components/dashboard/product-card'

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: any
}) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        return <div>Unauthorized</div>
    }

    const { customerId, integrationId } = await searchParams

    // Fetch filters data
    const [customers, integrations] = await Promise.all([
        prisma.customer.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true } }),
        prisma.integration.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true, provider: true } }),
    ])

    // Fetch products with filters
    const products = await prisma.product.findMany({
        where: {
            tenantId: tenant.id,
            ...(customerId && customerId !== 'all' ? { customerId } : {}),
            ...(integrationId && integrationId !== 'all' ? { mappings: { some: { integrationId } } } : {}),
        },
        include: {
            customer: {
                select: {
                    name: true,
                },
            },
            variants: true,
            mappings: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    // Serialization fix for Decimal
    const serializableProducts = products.map(product => ({
        ...product,
        variants: product.variants.map(v => ({
            ...v,
            price: Number(v.price)
        }))
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <div className="text-sm text-gray-500">
                    {products.length} product{products.length !== 1 ? 's' : ''} shown
                </div>
            </div>

            <DataFilter
                customers={customers}
                integrations={integrations.map(i => ({ id: i.id, name: i.name || `${i.provider} (${i.id.slice(-4)})` }))}
            />

            {products.length === 0 ? (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters or sync products from your integrations.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {serializableProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}
