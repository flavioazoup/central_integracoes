'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/server/services/tenant.service'
import { syncQueue } from '@/server/jobs/queue'

export async function triggerSync(integrationId: string, type: 'products' | 'orders') {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        return { message: 'Unauthorized' }
    }

    try {
        // 1. Create SyncJob record
        const job = await prisma.syncJob.create({
            data: {
                tenantId: tenant.id,
                integrationId,
                type,
                status: 'pending',
            },
        })

        // 2. Add to BullMQ
        await syncQueue.add(type, {
            tenantId: tenant.id,
            integrationId,
            jobId: job.id,
            type,
        })

        revalidatePath('/dashboard/sync-status')
        return { message: 'Sync started' }
    } catch (error) {
        return { message: 'Failed to start sync' }
    }
}
