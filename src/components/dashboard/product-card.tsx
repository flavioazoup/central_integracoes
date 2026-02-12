'use client'

import { useState } from 'react'
import { Package, X, ChevronRight, Tag, Box, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ProductDetailsProps {
    product: any
}

export function ProductCard({ product }: ProductDetailsProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="rounded-lg bg-white p-6 shadow-sm flex flex-col h-full">
                {/* Product Image */}
                {product.images.length > 0 && (
                    <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}

                {/* Product Info */}
                <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                        </p>
                    )}

                    {/* Customer */}
                    {product.customer && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Tag className="h-3 w-3" />
                            <span>{product.customer.name}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                        {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                    >
                        View Details <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {product.images.length > 0 && (
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product Name</label>
                                        <p className="text-lg font-bold text-gray-900">{product.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</label>
                                        <p className="text-sm text-gray-900">{product.customer?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</label>
                                        <p className="text-sm text-gray-900 uppercase">{product.mappings[0]?.provider || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{product.description || 'No description available.'}</p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Variants</label>
                                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attributes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {product.variants.map((v: any) => (
                                                <tr key={v.id}>
                                                    <td className="px-4 py-2 text-sm text-gray-900 font-mono">{v.sku}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">${Number(v.price).toFixed(2)}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{v.stock}</td>
                                                    <td className="px-4 py-2 text-xs text-gray-500">
                                                        {JSON.stringify(v.attributes)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                                <span>ID: {product.id}</span>
                                <span>Imported: {new Date(product.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
