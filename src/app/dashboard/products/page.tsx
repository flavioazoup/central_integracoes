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
    const hasIntegrationSelected = integrationId && integrationId !== 'all'

    // Sempre carrega apenas opções dos filtros (leve)
    const [customers, integrationsRaw] = await Promise.all([
        prisma.customer.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true } }),
        prisma.integration.findMany({ where: { tenantId: tenant.id }, select: { id: true, name: true, provider: true, customerId: true } }),
    ])
    const integrations = (customerId && customerId !== 'all')
        ? integrationsRaw.filter((i) => i.customerId === customerId)
        : integrationsRaw

    // Carrega produtos somente quando uma integração estiver selecionada
    let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []
    if (hasIntegrationSelected) {
        products = await prisma.product.findMany({
            where: {
                tenantId: tenant.id,
                ...(customerId && customerId !== 'all' ? { customerId } : {}),
                mappings: { some: { integrationId } },
            },
            include: {
                customer: { select: { name: true } },
                variants: true,
                mappings: true,
            },
            orderBy: { createdAt: 'desc' },
        })
    }

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
                {hasIntegrationSelected && (
                    <div className="text-sm text-gray-500">
                        {products.length} produto{products.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <DataFilter
                customers={customers}
                integrations={integrations.map(i => ({ id: i.id, name: i.name || `${i.provider} (${i.id.slice(-4)})` }))}
            />

            {!hasIntegrationSelected ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                    <Package className="mx-auto h-14 w-14 text-gray-300" />
                    <h3 className="mt-3 text-base font-semibold text-gray-700">Selecione uma integração</h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                        Escolha uma integração no filtro acima para carregar os produtos. Assim a lista não demora quando há muitas integrações.
                    </p>
                </div>
            ) : products.length === 0 ? (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum produto encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Ajuste os filtros ou sincronize produtos a partir das integrações.
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
