import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/server/services/tenant.service'

export async function getRecentLogs(limit = 100) {
    const tenant = await getCurrentTenant()
    if (!tenant) return []

    return await prisma.log.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}
