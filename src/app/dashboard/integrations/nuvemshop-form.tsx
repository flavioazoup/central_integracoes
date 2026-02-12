'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { saveNuvemShopIntegration } from '@/server/actions/integrations'
import { cn } from '@/lib/utils'
import type { Customer } from '@prisma/client'

interface FormState {
    message: string | null;
    errors?: {
        customerId?: string[];
        accessToken?: string[];
        userId?: string[];
        userAgent?: string[];
    };
}

const initialState: FormState = {
    message: null,
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className={cn(
                'w-full rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                pending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
            )}
        >
            {pending ? 'Saving...' : 'Save Configuration'}
        </button>
    )
}

interface NuvemShopFormProps {
    customers: Customer[]
}

export function NuvemShopForm({ customers }: NuvemShopFormProps) {
    const [state, formAction] = useFormState(saveNuvemShopIntegration, initialState)

    if (customers.length === 0) {
        return (
            <div className="rounded-lg bg-yellow-50 p-6 shadow">
                <p className="text-sm text-yellow-800">
                    Você precisa criar um cliente antes de configurar integrações.
                </p>
                <a
                    href="/dashboard/customers/new"
                    className="mt-4 inline-block rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                >
                    Criar Cliente
                </a>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-4 rounded-lg bg-white p-6 shadow">
            <div>
                <label htmlFor="customerId" className="block text-sm font-medium leading-6 text-gray-900">
                    Cliente <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                    <select
                        id="customerId"
                        name="customerId"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="">Selecione um cliente</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>
                {state?.errors?.customerId && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.customerId[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="accessToken" className="block text-sm font-medium leading-6 text-gray-900">
                    Access Token
                </label>
                <div className="mt-2">
                    <input
                        id="accessToken"
                        name="accessToken"
                        type="password"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="userId" className="block text-sm font-medium leading-6 text-gray-900">
                    Store ID (User ID)
                </label>
                <div className="mt-2">
                    <input
                        id="userId"
                        name="userId"
                        type="text"
                        required
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="userAgent" className="block text-sm font-medium leading-6 text-gray-900">
                    User Agent (AppName (email))
                </label>
                <div className="mt-2">
                    <input
                        id="userAgent"
                        name="userAgent"
                        type="text"
                        required
                        placeholder="My App (email@example.com)"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            <div className="pt-2">
                <SubmitButton />
            </div>

            {state?.message && (
                <p className={cn("text-sm", state.message === 'Success' ? 'text-green-600' : 'text-red-600')}>
                    {state.message}
                </p>
            )}
        </form>
    )
}
