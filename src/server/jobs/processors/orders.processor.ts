import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { NuvemShopAdapter } from '@/server/adapters/nuvemshop.adapter'
import { SyncJobData } from '../queue'

export async function processOrdersJob(jobData: SyncJobData) {
    const { tenantId, integrationId, jobId } = jobData

    try {
        // 1. Update Job Status to Processing
        await prisma.syncJob.update({
            where: { id: jobId },
            data: { status: 'processing', startedAt: new Date() },
        })

        // 2. Fetch Integration Config
        const integration = await prisma.integration.findUnique({
            where: { id: integrationId },
            include: { customer: true },
        })

        if (!integration) {
            throw new Error(`Integration ${integrationId} not found`)
        }

        if (!integration.isActive) {
            throw new Error(`Integration ${integrationId} is inactive`)
        }

        const customerId = integration.customerId

        // 3. Instantiate Adapter
        let adapter
        if (integration.provider === 'nuvemshop') {
            adapter = new NuvemShopAdapter(integration.config as any)
        } else {
            throw new Error(`Unsupported provider: ${integration.provider}`)
        }

        // 4. Fetch Orders from last 5 days
        const fiveDaysAgo = new Date()
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

        logger.info({ tenantId, jobId, customerId, message: 'Starting order sync (last 5 days)' })

        let syncedCount = 0
        let page = 1
        const limit = 50
        let hasMore = true

        while (hasMore) {
            logger.info({ tenantId, jobId, page, message: `Fetching orders page ${page}` })
            const platformOrders = await adapter.getOrders({
                page,
                limit,
                createdAtMin: fiveDaysAgo
            })

            if (platformOrders.length === 0) {
                hasMore = false
                break
            }

            for (const pOrder of platformOrders) {
                // Check if OrderMap exists for (tenantId, provider, remoteId)
                const existingMap = await prisma.orderMap.findUnique({
                    where: {
                        tenantId_provider_remoteId: {
                            tenantId,
                            provider: integration.provider,
                            remoteId: pOrder.id,
                        },
                    },
                    include: { order: true },
                })

                if (existingMap) {
                    // Update existing order
                    await prisma.order.update({
                        where: { id: existingMap.orderId },
                        data: {
                            customerName: pOrder.customer.name,
                            customerEmail: pOrder.customer.email,
                            status: pOrder.status,
                            total: pOrder.total,
                            items: pOrder.items,
                        },
                    })
                } else {
                    // Create new order with customerId
                    await prisma.order.create({
                        data: {
                            tenantId,
                            customerId,
                            customerName: pOrder.customer.name,
                            customerEmail: pOrder.customer.email,
                            status: pOrder.status,
                            total: pOrder.total,
                            items: pOrder.items,
                            mappings: {
                                create: {
                                    tenantId,
                                    integrationId,
                                    provider: integration.provider,
                                    remoteId: pOrder.id,
                                },
                            },
                        },
                    })
                }
                syncedCount++
            }

            if (platformOrders.length < limit) {
                hasMore = false
            } else {
                page++
            }
        }

        // 6. Complete Job
        await prisma.syncJob.update({
            where: { id: jobId },
            data: {
                status: 'completed',
                completedAt: new Date(),
                message: `Synced ${syncedCount} orders in ${page} pages`,
            },
        })
        logger.info({ tenantId, jobId, message: `Completed sync of ${syncedCount} orders` })

    } catch (error: any) {
        logger.error({ tenantId, jobId, message: error.message, details: error })
        await prisma.syncJob.update({
            where: { id: jobId },
            data: {
                status: 'failed',
                completedAt: new Date(),
                message: error.message,
            },
        })
        throw error // Let BullMQ handle retries
    }
}
