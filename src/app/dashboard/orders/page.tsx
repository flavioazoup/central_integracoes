import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/server/services/tenant.service'
import { ShoppingCart } from 'lucide-react'
import { DataFilter } from '@/components/dashboard/data-filter'
import { OrderCard } from '@/components/dashboard/order-card'

export default async function OrdersPage({
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

    // Fetch orders with filters
    const orders = await prisma.order.findMany({
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
            mappings: true,
        },
        orderBy: { createdAt: 'desc' },
    })

    // Serialization fix for Decimal
    const serializableOrders = orders.map(order => ({
        ...order,
        total: Number(order.total),
        items: (order.items as any[]).map(item => ({
            ...item,
            price: Number(item.price)
        }))
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <div className="text-sm text-gray-500">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} shown
                </div>
            </div>

            <DataFilter
                customers={customers}
                integrations={integrations.map(i => ({ id: i.id, name: i.name || `${i.provider} (${i.id.slice(-4)})` }))}
            />

            {orders.length === 0 ? (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No orders found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters or sync orders from your integrations.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <ul role="list" className="divide-y divide-gray-200">
                        {serializableOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
