'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { IntegrationForm } from './integration-form'
import type { Customer } from '@prisma/client'

interface IntegrationModalProps {
    customers: Customer[]
}

export function IntegrationModal({ customers }: IntegrationModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [successTrigger, setSuccessTrigger] = useState(0)
    const router = useRouter()

    const handleSuccess = () => {
        setIsOpen(false)
        // Trigger a refresh of the page data
        router.refresh()
    }

    // Reset form state when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Reset form by changing key after a short delay
            setTimeout(() => {
                setSuccessTrigger((prev) => prev + 1)
            }, 100)
        }
    }, [isOpen])

    const handleClose = () => {
        setIsOpen(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                <Plus className="h-4 w-4" />
                Incluir Integração
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={handleClose}
                >
                    <div 
                        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <Plus className="h-6 w-6" />
                                <h2 className="text-xl font-bold">Nova Integração</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <IntegrationForm 
                                customers={customers} 
                                onSuccess={handleSuccess}
                                key={successTrigger}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
