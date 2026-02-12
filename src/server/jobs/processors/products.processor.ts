import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { createPlatformAdapter } from '@/server/adapters/adapter-factory'
import { SyncJobData } from '../queue'

export async function processProductsJob(jobData: SyncJobData) {
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
        const adapter = createPlatformAdapter(integration.provider, integration.config)

        // 4. Fetch Products and Sync
        logger.info({ tenantId, jobId, customerId, message: 'Starting full product sync' })

        let syncedCount = 0
        let page = 1
        const limit = 50
        let hasMore = true

        while (hasMore) {
            logger.info({ tenantId, jobId, page, message: `Fetching products page ${page}` })
            const platformProducts = await adapter.getProducts({ page, limit })

            if (platformProducts.length === 0) {
                hasMore = false
                break
            }

            for (const pProduct of platformProducts) {
                // Check if ProductMap exists for (tenantId, provider, remoteId)
                const existingMap = await prisma.productMap.findUnique({
                    where: {
                        tenantId_provider_remoteId: {
                            tenantId,
                            provider: integration.provider,
                            remoteId: pProduct.id,
                        },
                    },
                    include: { product: { include: { variants: true } } },
                })

                if (existingMap) {
                    // Update existing product
                    await prisma.product.update({
                        where: { id: existingMap.productId },
                        data: {
                            name: pProduct.name,
                            description: pProduct.description,
                            images: pProduct.images,
                        },
                    })

                    // Update variants - delete old ones and create new ones
                    await prisma.productVariant.deleteMany({
                        where: { productId: existingMap.productId },
                    })

                    // Deduplicate SKUs within variants
                    const seenSkus = new Set<string>()
                    const uniqueVariants = pProduct.variants.map(v => {
                        let sku = v.sku || `Generated-${v.id}`
                        let finalSku = sku
                        let counter = 1
                        while (seenSkus.has(finalSku)) {
                            finalSku = `${sku}-${counter}`
                            counter++
                        }
                        seenSkus.add(finalSku)
                        return { ...v, sku: finalSku }
                    })

                    await prisma.productVariant.createMany({
                        data: uniqueVariants.map(v => ({
                            productId: existingMap.productId,
                            sku: v.sku,
                            price: v.price,
                            stock: v.stock,
                            attributes: v.attributes,
                        })),
                    })
                } else {
                    // Create new product with customerId
                    await prisma.product.create({
                        data: {
                            tenantId,
                            customerId,
                            name: pProduct.name,
                            description: pProduct.description,
                            images: pProduct.images,
                            variants: {
                                create: (() => {
                                    const seenSkus = new Set<string>()
                                    return pProduct.variants.map(v => {
                                        let sku = v.sku || `Generated-${v.id}`
                                        let finalSku = sku
                                        let counter = 1
                                        while (seenSkus.has(finalSku)) {
                                            finalSku = `${sku}-${counter}`
                                            counter++
                                        }
                                        seenSkus.add(finalSku)
                                        return {
                                            sku: finalSku,
                                            price: v.price,
                                            stock: v.stock,
                                            attributes: v.attributes,
                                        }
                                    })
                                })()
                            },
                            mappings: {
                                create: {
                                    tenantId,
                                    integrationId,
                                    provider: integration.provider,
                                    remoteId: pProduct.id,
                                },
                            },
                        },
                    })
                }
                syncedCount++
            }

            if (platformProducts.length < limit) {
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
                message: `Synced ${syncedCount} products in ${page} pages`,
            },
        })
        logger.info({ tenantId, jobId, message: `Completed full sync of ${syncedCount} products` })

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
