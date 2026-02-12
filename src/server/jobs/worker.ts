import { Worker } from 'bullmq'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { SYNC_QUEUE_NAME, SyncJobData } from './queue'
import { processProductsJob } from './processors/products.processor'
import { processOrdersJob } from './processors/orders.processor'

const processJob = async (job: { data: SyncJobData }) => {
    const { jobId, type, tenantId } = job.data
    logger.info({ message: `Processing job ${jobId}`, jobId, tenantId })

    try {
        switch (type) {
            case 'products':
                await processProductsJob(job.data)
                break
            case 'orders':
                await processOrdersJob(job.data)
                break
            default:
                logger.warn({ message: `Unknown job type: ${type}`, jobId, tenantId })
        }
    } catch (error: any) {
        logger.error({ message: `Job processing failed: ${error.message}`, jobId, tenantId, details: error })
        throw error
    }
}

export const worker = new Worker<SyncJobData>(SYNC_QUEUE_NAME, processJob, {
    connection: redis,
    concurrency: 5,
    limiter: {
        max: 10,
        duration: 1000,
    },
})

worker.on('completed', (job) => {
    logger.info({ message: `Job ${job.id} completed`, jobId: job.id })
})

worker.on('failed', (job, err) => {
    logger.error({ message: `Job ${job?.id} failed`, jobId: job?.id, details: err })
})
