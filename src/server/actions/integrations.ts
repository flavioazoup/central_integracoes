'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/server/services/tenant.service'
import { getCustomerById } from '@/server/services/customer.service'

const NuvemShopSchema = z.object({
    customerId: z.string().min(1, 'Cliente é obrigatório'),
    accessToken: z.string().min(1, 'Access token is required'),
    userId: z.string().min(1, 'Store ID is required'),
    userAgent: z.string().min(1, 'User Agent is required'),
})

export async function saveNuvemShopIntegration(prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        return { message: 'Unauthorized' }
    }

    const rawData = {
        customerId: formData.get('customerId'),
        accessToken: formData.get('accessToken'),
        userId: formData.get('userId'),
        userAgent: formData.get('userAgent'),
    }

    const validatedFields = NuvemShopSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    // Verify customer belongs to this tenant
    const customer = await getCustomerById(validatedFields.data.customerId, tenant.id)
    if (!customer) {
        return { message: 'Customer not found or access denied' }
    }

    try {
        await prisma.integration.upsert({
            where: {
                customerId_provider: {
                    customerId: validatedFields.data.customerId,
                    provider: 'nuvemshop',
                },
            },
            update: {
                config: {
                    accessToken: validatedFields.data.accessToken,
                    userId: validatedFields.data.userId,
                    userAgent: validatedFields.data.userAgent,
                },
                isActive: true,
            },
            create: {
                tenantId: tenant.id,
                customerId: validatedFields.data.customerId,
                provider: 'nuvemshop',
                name: 'NuvemShop Store',
                config: {
                    accessToken: validatedFields.data.accessToken,
                    userId: validatedFields.data.userId,
                    userAgent: validatedFields.data.userAgent,
                },
            },
        })

        revalidatePath('/dashboard/integrations')
        return { message: 'Success' }
    } catch (error) {
        return { message: 'Failed to save integration' }
    }
}

export async function getIntegrations(customerId?: string) {
    const tenant = await getCurrentTenant()
    if (!tenant) return []

    // If customerId is provided, verify it belongs to this tenant
    if (customerId) {
        const customer = await getCustomerById(customerId, tenant.id)
        if (!customer) return []
    }

    const integrations = await prisma.integration.findMany({
        where: customerId
            ? { customerId }
            : {
                customer: {
                    tenantId: tenant.id,
                },
            },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    isActive: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return integrations
}

