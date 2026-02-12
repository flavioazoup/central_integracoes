'use client'

import { useState } from 'react'
import { triggerSync } from '@/server/actions/sync'
import { RefreshCw, Package, ShoppingCart } from 'lucide-react'

interface IntegrationActionsProps {
    integrationId: string
}

export function IntegrationActions({ integrationId }: IntegrationActionsProps) {
    const [loading, setLoading] = useState<'products' | 'orders' | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSync = async (type: 'products' | 'orders') => {
        setLoading(type)
        setMessage(null)

        try {
            const result = await triggerSync(integrationId, type)

            if (result.message === 'Sync started') {
                setMessage({ type: 'success', text: `${type === 'products' ? 'Products' : 'Orders'} sync started!` })
                // Refresh the page after a short delay to show updated jobs
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            } else {
                setMessage({ type: 'error', text: result.message })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to start sync' })
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-3">
            {message && (
                <div className={`rounded-md p-3 text-sm ${message.type === 'success'
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={() => handleSync('products')}
                    disabled={loading !== null}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading === 'products' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <Package className="h-4 w-4" />
                    )}
                    Sync Products
                </button>

                <button
                    onClick={() => handleSync('orders')}
                    disabled={loading !== null}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading === 'orders' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                        <ShoppingCart className="h-4 w-4" />
                    )}
                    Sync Orders
                </button>
            </div>
        </div>
    )
}
