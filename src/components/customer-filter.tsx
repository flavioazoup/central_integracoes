'use client'

import { useRouter } from 'next/navigation'
import type { Customer } from '@prisma/client'

interface CustomerFilterProps {
    customers: Customer[]
    currentCustomerId?: string
}

export function CustomerFilter({ customers, currentCustomerId }: CustomerFilterProps) {
    const router = useRouter()

    if (customers.length === 0) {
        return null
    }

    return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
            <label htmlFor="customer-filter" className="block text-sm font-medium text-gray-700">
                Filtrar por Cliente
            </label>
            <select
                id="customer-filter"
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                defaultValue={currentCustomerId || ''}
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
    )
}
