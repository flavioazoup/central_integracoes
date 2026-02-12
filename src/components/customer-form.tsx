'use client'

import { useActionState } from 'react'
import { createCustomerAction, updateCustomerAction } from '@/server/actions/customers'
import type { Customer } from '@prisma/client'

interface CustomerFormProps {
    customer?: Customer
    mode: 'create' | 'edit'
}

export function CustomerForm({ customer, mode }: CustomerFormProps) {
    const action = mode === 'create'
        ? createCustomerAction
        : updateCustomerAction.bind(null, customer!.id)

    const [state, formAction, isPending] = useActionState(action, null)

    return (
        <form action={formAction} className="space-y-6">
            {state?.message && state.message !== 'Success' && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{state.message}</p>
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={customer?.name}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state?.errors?.name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={customer?.email || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state?.errors?.email && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={customer?.phone || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state?.errors?.phone && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.phone[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                    CPF/CNPJ
                </label>
                <input
                    type="text"
                    id="document"
                    name="document"
                    defaultValue={customer?.document || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state?.errors?.document && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.document[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Observações
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    defaultValue={customer?.notes || ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state?.errors?.notes && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.notes[0]}</p>
                )}
            </div>

            <div className="flex justify-end gap-3">
                <a
                    href="/dashboard/customers"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </a>
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isPending ? 'Salvando...' : mode === 'create' ? 'Criar Cliente' : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    )
}
