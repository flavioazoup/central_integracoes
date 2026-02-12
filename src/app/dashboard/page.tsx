import { getCurrentTenant } from '@/server/services/tenant.service'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
    const tenant = await getCurrentTenant()

    if (!tenant) {
        return <div>Unauthorized</div>
    }

    // Get statistics
    const [customerCount, integrationCount, productCount] = await Promise.all([
        prisma.customer.count({ where: { tenantId: tenant.id } }),
        prisma.integration.count({
            where: {
                customer: {
                    tenantId: tenant.id,
                },
            },
        }),
        prisma.product.count({ where: { tenantId: tenant.id } }),
    ])

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {tenant?.name}</p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Customers</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{customerCount}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Active Integrations</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{integrationCount}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Pending Sync Jobs</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Products Synced</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{productCount}</p>
                </div>
            </div>
        </div>
    )
}
