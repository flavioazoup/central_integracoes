'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { SlidersHorizontal, User, Plug, X } from 'lucide-react'

interface FilterOption {
    id: string
    name: string
}

interface DataFilterProps {
    customers: FilterOption[]
    integrations: FilterOption[]
}

const selectClass =
    'w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export function DataFilter({ customers, integrations }: DataFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString())
            for (const [key, value] of Object.entries(params)) {
                if (value === null || value === 'all') {
                    newSearchParams.delete(key)
                } else {
                    newSearchParams.set(key, value)
                }
            }
            return newSearchParams.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (key: string, value: string) => {
        router.push(`${pathname}?${createQueryString({ [key]: value })}`)
    }

    const clearFilters = () => {
        router.push(pathname)
    }

    const currentCustomer = searchParams.get('customerId') || 'all'
    const currentIntegration = searchParams.get('integrationId') || 'all'
    const hasFilters = currentCustomer !== 'all' || currentIntegration !== 'all'

    return (
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="text-sm font-medium text-gray-700">Filtros</span>
                </div>

                <div className="relative flex-1 min-w-[180px] max-w-[240px]">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <label htmlFor="customer" className="sr-only">
                        Cliente
                    </label>
                    <select
                        id="customer"
                        className={selectClass}
                        value={currentCustomer}
                        onChange={(e) => handleFilterChange('customerId', e.target.value)}
                    >
                        <option value="all">Todos os clientes</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 min-w-[180px] max-w-[280px]">
                    <Plug className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <label htmlFor="integration" className="sr-only">
                        Integração
                    </label>
                    <select
                        id="integration"
                        className={selectClass}
                        value={currentIntegration}
                        onChange={(e) => handleFilterChange('integrationId', e.target.value)}
                    >
                        <option value="all">Selecione uma integração</option>
                        {integrations.map((i) => (
                            <option key={i.id} value={i.id}>
                                {i.name || i.id}
                            </option>
                        ))}
                    </select>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <X className="h-4 w-4" />
                        Limpar
                    </button>
                )}
            </div>
            <p className="mt-3 text-xs text-gray-500">
                Escolha uma integração para carregar os dados.
            </p>
        </div>
    )
}
