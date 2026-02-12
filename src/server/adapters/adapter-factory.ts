import { IPlatformAdapter } from './platform-adapter.interface'
import { NuvemShopAdapter, NuvemShopConfig } from './nuvemshop.adapter'
import { TinyAdapter, TinyConfig } from './tiny.adapter'
import type { IntegrationProvider } from '@/server/actions/integration-schemas'

export function createPlatformAdapter(
    provider: string,
    config: unknown
): IPlatformAdapter {
    switch (provider as IntegrationProvider) {
        case 'nuvemshop':
            return new NuvemShopAdapter(config as NuvemShopConfig)
        case 'tiny':
            return new TinyAdapter(config as TinyConfig)

        case 'bling':
        case 'mercadolivre':
        case 'tray':
            throw new Error(`Adapter para ${provider} ainda não implementado`)

        default:
            throw new Error(`Provider não suportado: ${provider}`)
    }
}

