import { notFound } from 'next/navigation'
import { getCustomerByIdAction } from '@/server/actions/customers'
import { CustomerForm } from '@/components/customer-form'

interface EditCustomerPageProps {
    params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
    const { id } = await params
    const customer = await getCustomerByIdAction(id)

    if (!customer) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
                <p className="mt-1 text-sm text-gray-500">Atualize as informações do cliente</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <CustomerForm customer={customer} mode="edit" />
            </div>
        </div>
    )
}
