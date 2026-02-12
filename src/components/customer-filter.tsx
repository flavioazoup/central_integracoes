'use client'

import { useRouter } from 'next/navigation'
import { User, SlidersHorizontal } from 'lucide-react'
import type { Customer } from '@prisma/client'

interface CustomerFilterProps {
    customers: Customer[]
    currentCustomerId?: string
}

const selectClass =
    'w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20'

export function CustomerFilter({ customers, currentCustomerId }: CustomerFilterProps) {
    const router = useRouter()

    if (customers.length === 0) {
        return null
    }

    return (
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500">
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="text-sm font-medium text-gray-700">Filtrar por cliente</span>
                </div>
                <div className="relative flex-1 min-w-[200px] max-w-[280px]">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <label htmlFor="customer-filter" className="sr-only">
                        Cliente
                    </label>
                    <select
                        id="customer-filter"
                        className={selectClass}
                        value={currentCustomerId || ''}
                        onChange={(e) => {
                            const value = e.target.value
                            if (value) {
                                router.push(`/dashboard/integrations?customerId=${value}`)
                            } else {
                                router.push('/dashboard/integrations')
                            }
                        }}
                    >
                        <option value="">Todos os clientes</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}
