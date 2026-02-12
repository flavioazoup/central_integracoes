'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface FilterOption {
    id: string
    name: string
}

interface DataFilterProps {
    customers: FilterOption[]
    integrations: FilterOption[]
}

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
        const query = createQueryString({ [key]: value })
        router.push(`${pathname}?${query}`)
    }

    return (
        <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex-1 min-w-[200px]">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Customer
                </label>
                <select
                    id="customer"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={searchParams.get('customerId') || 'all'}
                    onChange={(e) => handleFilterChange('customerId', e.target.value)}
                >
                    <option value="all">All Customers</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex-1 min-w-[200px]">
                <label htmlFor="integration" className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Integration
                </label>
                <select
                    id="integration"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={searchParams.get('integrationId') || 'all'}
                    onChange={(e) => handleFilterChange('integrationId', e.target.value)}
                >
                    <option value="all">All Integrations</option>
                    {integrations.map((i) => (
                        <option key={i.id} value={i.id}>
                            {i.name || i.id}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={() => router.push(pathname)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
                Clear Filters
            </button>
        </div>
    )
}
