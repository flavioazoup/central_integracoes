'use client'

import { useState } from 'react'
import { ShoppingCart, X, ChevronRight, User, Package, DollarSign, Calendar, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface OrderCardProps {
    order: any
}

export function OrderCard({ order }: OrderCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const items = order.items as any[]

    return (
        <>
            <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 group">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        {/* Customer Info */}
                        <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900">
                                {order.customerName || 'Unknown Customer'}
                            </p>
                            {order.customerEmail && (
                                <span className="text-xs text-gray-500">
                                    ({order.customerEmail})
                                </span>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="mt-2 space-y-1">
                            {items && items.length > 0 && (
                                <div className="text-sm text-gray-600">
                                    <Package className="inline h-3 w-3 mr-1" />
                                    {items.length} item{items.length !== 1 ? 's' : ''}:
                                    <span className="ml-1">
                                        {items.slice(0, 2).map((item, idx) => (
                                            <span key={idx}>
                                                {item.sku} (x{item.quantity})
                                                {idx < Math.min(items.length, 2) - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                        {items.length > 2 && ` +${items.length - 2} more`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            {order.customer && (
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Client:</span>
                                    {order.customer.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1 uppercase">
                                <span className="font-medium">Integration:</span>
                                {order.mappings[0]?.provider || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* Status and Total */}
                    <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === 'completed' || order.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.status}
                        </span>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                                <DollarSign className="h-4 w-4" />
                                {Number(order.total).toFixed(2)}
                            </div>
                            <button
                                onClick={() => setIsOpen(true)}
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-0.5 mt-1"
                            >
                                Details <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </li>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <ShoppingCart className="h-6 w-6" />
                                <h2 className="text-xl font-bold">Order Details</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                                    <p className="font-semibold text-lg uppercase text-indigo-600">{order.status}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg text-right">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Total Amount</label>
                                    <p className="font-bold text-2xl text-gray-900">${Number(order.total).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-1">
                                        <User className="h-4 w-4 text-indigo-500" /> Customer Information
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm"><span className="text-gray-500">Name:</span> {order.customerName}</p>
                                        <p className="text-sm"><span className="text-gray-500">Email:</span> {order.customerEmail || 'N/A'}</p>
                                        <p className="text-sm"><span className="text-gray-500">Client:</span> {order.customer?.name || 'Unknown'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-1">
                                        <Calendar className="h-4 w-4 text-indigo-500" /> Order Info
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm"><span className="text-gray-500">Integration:</span> <span className="uppercase">{order.mappings[0]?.provider}</span></p>
                                        <p className="text-sm"><span className="text-gray-500">Sync Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                                        <p className="text-sm"><span className="text-gray-500">ID:</span> {order.id}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-1">
                                    <Package className="h-4 w-4 text-indigo-500" /> Order Items
                                </h3>
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 text-sm text-gray-900 font-mono">{item.sku}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 text-right">${Number(item.price).toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 font-bold text-right">
                                                        ${(Number(item.price) * item.quantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-2 text-sm font-bold text-right text-gray-900 uppercase">Total</td>
                                                <td className="px-4 py-2 text-sm font-bold text-right text-indigo-600">${Number(order.total).toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
