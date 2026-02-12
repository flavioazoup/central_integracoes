'use client'

import { deleteCustomerAction } from '@/server/actions/customers'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteCustomerButtonProps {
    customerId: string
}

export function DeleteCustomerButton({ customerId }: DeleteCustomerButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteCustomerAction(customerId)
        } catch (error) {
            setIsDeleting(false)
            alert('Erro ao deletar cliente')
        }
    }

    if (showConfirm) {
        return (
            <div className="flex gap-2">
                <button
                    onClick={() => setShowConfirm(false)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {isDeleting ? 'Deletando...' : 'Confirmar'}
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
            <Trash2 className="h-4 w-4" />
            Deletar
        </button>
    )
}
