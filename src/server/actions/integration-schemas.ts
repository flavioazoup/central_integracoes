import { z } from 'zod'

export type IntegrationProvider = 'nuvemshop' | 'bling' | 'tiny' | 'mercadolivre' | 'tray'

export const INTEGRATION_PROVIDERS: Array<{
    value: IntegrationProvider
    label: string
    description?: string
}> = [
    { value: 'nuvemshop', label: 'NuvemShop', description: 'Plataforma de e-commerce brasileira' },
    { value: 'bling', label: 'Bling', description: 'Sistema de gestão ERP' },
    { value: 'tiny', label: 'Olist (Tiny)', description: 'ERP Olist / Tiny - API 2.0' },
    { value: 'mercadolivre', label: 'Mercado Livre', description: 'Marketplace online' },
    { value: 'tray', label: 'Tray', description: 'Plataforma de e-commerce' },
]

// NuvemShop Schema
const NuvemShopConfigSchema = z.object({
    accessToken: z.string().min(1, 'Access token é obrigatório'),
    userId: z.string().min(1, 'Store ID (User ID) é obrigatório'),
    userAgent: z.string().min(1, 'User Agent é obrigatório'),
})

// Bling Schema
const BlingConfigSchema = z.object({
    apiKey: z.string().min(1, 'API Key é obrigatória'),
})

// Tiny Schema
const TinyConfigSchema = z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    empresaId: z.string().min(1, 'ID da Empresa é obrigatório'),
})

// Mercado Livre Schema
const MercadoLivreConfigSchema = z.object({
    accessToken: z.string().min(1, 'Access Token é obrigatório'),
    refreshToken: z.string().min(1, 'Refresh Token é obrigatório'),
    clientId: z.string().min(1, 'Client ID é obrigatório'),
    clientSecret: z.string().min(1, 'Client Secret é obrigatório'),
    userId: z.string().min(1, 'User ID é obrigatório'),
})

// Tray Schema
const TrayConfigSchema = z.object({
    storeId: z.string().min(1, 'Store ID é obrigatório'),
    accessToken: z.string().min(1, 'Access Token é obrigatório'),
})

// Base schema com provider e customerId
const BaseIntegrationSchema = z.object({
    customerId: z.string().min(1, 'Cliente é obrigatório'),
    provider: z.enum(['nuvemshop', 'bling', 'tiny', 'mercadolivre', 'tray']),
})

// Schema union para cada provider
export const IntegrationConfigSchemas = {
    nuvemshop: BaseIntegrationSchema.extend({
        provider: z.literal('nuvemshop'),
        ...NuvemShopConfigSchema.shape,
    }),
    bling: BaseIntegrationSchema.extend({
        provider: z.literal('bling'),
        ...BlingConfigSchema.shape,
    }),
    tiny: BaseIntegrationSchema.extend({
        provider: z.literal('tiny'),
        ...TinyConfigSchema.shape,
    }),
    mercadolivre: BaseIntegrationSchema.extend({
        provider: z.literal('mercadolivre'),
        ...MercadoLivreConfigSchema.shape,
    }),
    tray: BaseIntegrationSchema.extend({
        provider: z.literal('tray'),
        ...TrayConfigSchema.shape,
    }),
}

// Helper para validar config baseado no provider
export function validateIntegrationConfig(
    provider: IntegrationProvider,
    data: unknown
): { success: boolean; data?: any; errors?: Record<string, string[]> } {
    const schema = IntegrationConfigSchemas[provider]
    const result = schema.safeParse(data)

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
        }
    }

    return {
        success: true,
        data: result.data,
    }
}

// Helper para extrair config do FormData baseado no provider
export function extractConfigFromFormData(
    provider: IntegrationProvider,
    formData: FormData
): Record<string, unknown> {
    const base = {
        customerId: formData.get('customerId'),
        provider,
    }

    switch (provider) {
        case 'nuvemshop':
            return {
                ...base,
                accessToken: formData.get('accessToken'),
                userId: formData.get('userId'),
                userAgent: formData.get('userAgent'),
            }
        case 'bling':
            return {
                ...base,
                apiKey: formData.get('apiKey'),
            }
        case 'tiny':
            return {
                ...base,
                token: formData.get('token'),
                empresaId: formData.get('empresaId'),
            }
        case 'mercadolivre':
            return {
                ...base,
                accessToken: formData.get('accessToken'),
                refreshToken: formData.get('refreshToken'),
                clientId: formData.get('clientId'),
                clientSecret: formData.get('clientSecret'),
                userId: formData.get('userId'),
            }
        case 'tray':
            return {
                ...base,
                storeId: formData.get('storeId'),
                accessToken: formData.get('accessToken'),
            }
        default:
            return base
    }
}

// Helper para obter nome padrão da integração
export function getDefaultIntegrationName(provider: IntegrationProvider): string {
    const names: Record<IntegrationProvider, string> = {
        nuvemshop: 'NuvemShop Store',
        bling: 'Bling ERP',
        tiny: 'Olist (Tiny)',
        mercadolivre: 'Mercado Livre',
        tray: 'Tray Store',
    }
    return names[provider]
}
