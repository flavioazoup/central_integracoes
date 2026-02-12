'use client'

import { useState, useEffect } from 'react'
import { useFormStatus, useFormState } from 'react-dom'
import { saveIntegration } from '@/server/actions/integrations'
import { cn } from '@/lib/utils'
import { INTEGRATION_PROVIDERS, type IntegrationProvider } from '@/server/actions/integration-schemas'
import type { Customer } from '@prisma/client'

interface FormState {
    message: string | null
    errors?: Record<string, string[]>
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
            {pending ? 'Salvando...' : 'Salvar Integração'}
        </button>
    )
}

interface IntegrationFormProps {
    customers: Customer[]
    onSuccess?: () => void
}

export function IntegrationForm({ customers, onSuccess }: IntegrationFormProps) {
    const [state, formAction] = useFormState(saveIntegration, initialState)
    const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider>('nuvemshop')

    // Call onSuccess when form is successfully submitted
    useEffect(() => {
        if (state?.message === 'Success' && onSuccess) {
            onSuccess()
        }
    }, [state?.message, onSuccess])

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

    const renderProviderFields = () => {
        switch (selectedProvider) {
            case 'nuvemshop':
                return (
                    <>
                        <div>
                            <label htmlFor="accessToken" className="block text-sm font-medium leading-6 text-gray-900">
                                Access Token <span className="text-red-500">*</span>
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
                            {state?.errors?.accessToken && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.accessToken[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium leading-6 text-gray-900">
                                Store ID (User ID) <span className="text-red-500">*</span>
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
                            {state?.errors?.userId && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.userId[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="userAgent" className="block text-sm font-medium leading-6 text-gray-900">
                                User Agent (AppName (email)) <span className="text-red-500">*</span>
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
                            {state?.errors?.userAgent && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.userAgent[0]}</p>
                            )}
                        </div>
                    </>
                )

            case 'bling':
                return (
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium leading-6 text-gray-900">
                            API Key <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-2">
                            <input
                                id="apiKey"
                                name="apiKey"
                                type="password"
                                required
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        {state?.errors?.apiKey && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.apiKey[0]}</p>
                        )}
                    </div>
                )

            case 'tiny':
                return (
                    <>
                        <div>
                            <label htmlFor="token" className="block text-sm font-medium leading-6 text-gray-900">
                                Token <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    id="token"
                                    name="token"
                                    type="password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {state?.errors?.token && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.token[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="empresaId" className="block text-sm font-medium leading-6 text-gray-900">
                                ID da Empresa <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    id="empresaId"
                                    name="empresaId"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {state?.errors?.empresaId && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.empresaId[0]}</p>
                            )}
                        </div>
                    </>
                )

            case 'mercadolivre':
                return (
                    <>
                        <div>
                            <label htmlFor="accessToken" className="block text-sm font-medium leading-6 text-gray-900">
                                Access Token <span className="text-red-500">*</span>
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
                            {state?.errors?.accessToken && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.accessToken[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="refreshToken" className="block text-sm font-medium leading-6 text-gray-900">
                                Refresh Token <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    id="refreshToken"
                                    name="refreshToken"
                                    type="password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {state?.errors?.refreshToken && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.refreshToken[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="clientId" className="block text-sm font-medium leading-6 text-gray-900">
                                Client ID <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    id="clientId"
                                    name="clientId"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {state?.errors?.clientId && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.clientId[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="clientSecret" className="block text-sm font-medium leading-6 text-gray-900">
                                Client Secret <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    id="clientSecret"
                                    name="clientSecret"
                                    type="password"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {state?.errors?.clientSecret && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.clientSecret[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="userId" className="block text-sm font-medium leading-6 text-gray-900">
                                User ID <span className="text-red-500">*</span>
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
                            {state?.errors?.userId && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.userId[0]}</p>
                            )}
                        </div>
                    </>
                )

            case 'tray':
                return (
                    <>
                        <div>
                            <label htmlFor="storeId" className="block text-sm font-medium leading-6 text-gray-900">
                                Store ID <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-2">
                                <input
                                    id="storeId"
                                    name="storeId"
                                    type="text"
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {state?.errors?.storeId && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.storeId[0]}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="accessToken" className="block text-sm font-medium leading-6 text-gray-900">
                                Access Token <span className="text-red-500">*</span>
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
                            {state?.errors?.accessToken && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.accessToken[0]}</p>
                            )}
                        </div>
                    </>
                )

            default:
                return null
        }
    }

    return (
        <form action={formAction} className="space-y-4 rounded-lg bg-white p-6 shadow">
            <input type="hidden" name="provider" value={selectedProvider} />

            <div>
                <label htmlFor="provider" className="block text-sm font-medium leading-6 text-gray-900">
                    Plataforma <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                    <select
                        id="provider"
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as IntegrationProvider)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        {INTEGRATION_PROVIDERS.map((provider) => (
                            <option key={provider.value} value={provider.value}>
                                {provider.label}
                            </option>
                        ))}
                    </select>
                </div>
                {INTEGRATION_PROVIDERS.find((p) => p.value === selectedProvider)?.description && (
                    <p className="mt-1 text-xs text-gray-500">
                        {INTEGRATION_PROVIDERS.find((p) => p.value === selectedProvider)?.description}
                    </p>
                )}
            </div>

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

            {renderProviderFields()}

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
