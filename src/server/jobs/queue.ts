import { Queue } from 'bullmq'
import { redis } from '@/lib/redis'

export const SYNC_QUEUE_NAME = 'sync-queue'

export const syncQueue = new Queue(SYNC_QUEUE_NAME, {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
    },
})

// Job Types
export interface SyncJobData {
    tenantId: string
    integrationId: string
    jobId: string // Database ID of the SyncJob record
    type: 'products' | 'orders' | 'inventory'
}
