import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCustomerWithIntegrationsAction } from '@/server/actions/customers'
import { Building2, Mail, Phone, FileText, Edit, Activity, CheckCircle2, XCircle } from 'lucide-react'
import { DeleteCustomerButton } from './delete-button'

interface CustomerDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
    const { id } = await params
    const customer = await getCustomerWithIntegrationsAction(id)

    if (!customer) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                    <p className="mt-1 text-sm text-gray-500">Detalhes do cliente</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/dashboard/customers/${customer.id}/edit`}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <Edit className="h-4 w-4" />
                        Editar
                    </Link>
                    <DeleteCustomerButton customerId={customer.id} />
                </div>
            </div>

            {/* Customer Information Card */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="text-lg font-medium text-gray-900">Informações</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Nome</label>
                        <p className="mt-1 text-sm text-gray-900">{customer.name}</p>
                    </div>
                    {customer.email && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <p className="text-sm text-gray-900">{customer.email}</p>
                            </div>
                        </div>
                    )}
                    {customer.phone && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Telefone</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <p className="text-sm text-gray-900">{customer.phone}</p>
                            </div>
                        </div>
                    )}
                    {customer.document && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">CPF/CNPJ</label>
                            <div className="mt-1 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <p className="text-sm text-gray-900">{customer.document}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="mt-1">
                            {customer.isActive ? (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    Ativo
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                                    Inativo
                                </span>
                            )}
                        </p>
                    </div>
                    {customer.notes && (
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500">Observações</label>
                            <p className="mt-1 text-sm text-gray-900">{customer.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Integrações</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{customer.integrations.length}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Produtos</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{customer._count.products}</p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Pedidos</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{customer._count.orders}</p>
                </div>
            </div>

            {/* Integrations List */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Integrações</h2>
                    <Link
                        href={`/dashboard/integrations?customerId=${customer.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        Ver todas
                    </Link>
                </div>
                {customer.integrations.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-500">Nenhuma integração configurada</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {customer.integrations.map((integration) => (
                            <div
                                key={integration.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">{integration.name}</p>
                                        <p className="text-xs capitalize text-gray-500">{integration.provider}</p>
                                    </div>
                                </div>
                                <div>
                                    {integration.isActive ? (
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                            <CheckCircle2 className="mr-1 h-3 w-3" /> Ativa
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                            <XCircle className="mr-1 h-3 w-3" /> Inativa
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
