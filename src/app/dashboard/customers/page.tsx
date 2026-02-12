import Link from 'next/link'
import { getCustomersAction } from '@/server/actions/customers'
import { Building2, Mail, Phone, FileText, Plus } from 'lucide-react'

export default async function CustomersPage() {
    const customers = await getCustomersAction()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                <Link
                    href="/dashboard/customers/new"
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    Novo Cliente
                </Link>
            </div>

            {customers.length === 0 ? (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum cliente cadastrado</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Comece criando seu primeiro cliente para gerenciar integrações.
                    </p>
                    <Link
                        href="/dashboard/customers/new"
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Criar Primeiro Cliente
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {customers.map((customer) => (
                        <Link
                            key={customer.id}
                            href={`/dashboard/customers/${customer.id}`}
                            className="block rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-blue-100 p-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                                        {customer.isActive ? (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                                                Inativo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                {customer.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                )}
                                {customer.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                {customer.document && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FileText className="h-4 w-4" />
                                        <span>{customer.document}</span>
                                    </div>
                                )}
                            </div>

                            {customer.notes && (
                                <p className="mt-3 line-clamp-2 text-sm text-gray-500">{customer.notes}</p>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
