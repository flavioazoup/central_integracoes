import { NuvemShopForm } from './nuvemshop-form'
import { getIntegrations } from '@/server/actions/integrations'
import { getActiveCustomersAction } from '@/server/actions/customers'
import { Activity, CheckCircle2, XCircle, Building2 } from 'lucide-react'
import { CustomerFilter } from '@/components/customer-filter'
import { IntegrationActions } from './integration-actions'

interface IntegrationsPageProps {
    searchParams: Promise<{ customerId?: string }>
}

export default async function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
    const { customerId } = await searchParams
    const integrations = await getIntegrations(customerId)
    const customers = await getActiveCustomersAction()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            </div>

            {/* Customer Filter */}
            <CustomerFilter customers={customers} currentCustomerId={customerId} />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Active Integrations List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Active Integrations</h2>
                    {integrations.length === 0 ? (
                        <p className="text-sm text-gray-500">No active integrations found.</p>
                    ) : (
                        integrations.map((integration) => (
                            <div
                                key={integration.id}
                                className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Activity className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">{integration.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{integration.provider}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {integration.isActive ? (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                                <XCircle className="mr-1 h-3 w-3" /> Inactive
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {integration.customer && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 className="h-4 w-4" />
                                        <span>{integration.customer.name}</span>
                                    </div>
                                )}

                                {/* Sync Actions */}
                                <IntegrationActions integrationId={integration.id} />
                            </div>
                        ))
                    )}
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Configure NuvemShop</h2>
                    <NuvemShopForm customers={customers} />
                </div>
            </div>
        </div>
    )
}
