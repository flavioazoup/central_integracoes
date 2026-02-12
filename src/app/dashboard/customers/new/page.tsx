import { CustomerForm } from '@/components/customer-form'

export default function NewCustomerPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Cadastre um novo cliente para gerenciar suas integrações
                </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <CustomerForm mode="create" />
            </div>
        </div>
    )
}
