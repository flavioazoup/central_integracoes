import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/server/services/tenant.service'

export async function getRecentJobs(limit = 20) {
    const tenant = await getCurrentTenant()
    if (!tenant) return []

    return await prisma.syncJob.findMany({
        where: { tenantId: tenant.id },
        orderBy: { startedAt: 'desc' },
        take: limit,
        include: {
            integration: {
                select: {
                    name: true,
                    provider: true,
                    customer: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    })
}
