'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/server/services/tenant.service'
import { getCustomerById } from '@/server/services/customer.service'
import {
    validateIntegrationConfig,
    extractConfigFromFormData,
    getDefaultIntegrationName,
    type IntegrationProvider,
} from './integration-schemas'

export async function saveIntegration(prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        return { message: 'Unauthorized' }
    }

    const provider = formData.get('provider') as IntegrationProvider
    if (!provider) {
        return { message: 'Provider é obrigatório' }
    }

    const rawData = extractConfigFromFormData(provider, formData)
    const validation = validateIntegrationConfig(provider, rawData)

    if (!validation.success) {
        return {
            errors: validation.errors || {},
            message: 'Validação falhou',
        }
    }

    const { customerId, ...configData } = validation.data!

    // Verify customer belongs to this tenant
    const customer = await getCustomerById(customerId, tenant.id)
    if (!customer) {
        return { message: 'Cliente não encontrado ou acesso negado' }
    }

    // Extract config object (remove customerId and provider from config)
    const { provider: _, ...config } = configData

    try {
        await prisma.integration.upsert({
            where: {
                customerId_provider: {
                    customerId,
                    provider,
                },
            },
            update: {
                config,
                isActive: true,
            },
            create: {
                tenantId: tenant.id,
                customerId,
                provider,
                name: getDefaultIntegrationName(provider),
                config,
            },
        })

        revalidatePath('/dashboard/integrations')
        return { message: 'Success' }
    } catch (error) {
        console.error('Error saving integration:', error)
        return { message: 'Falha ao salvar integração' }
    }
}

// Mantido para compatibilidade (pode ser removido depois)
export async function saveNuvemShopIntegration(prevState: any, formData: FormData) {
    formData.set('provider', 'nuvemshop')
    return saveIntegration(prevState, formData)
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

