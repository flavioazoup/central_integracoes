'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentTenant } from '@/server/services/tenant.service'
import {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomers,
    getCustomerById,
    getCustomerWithIntegrations,
    getActiveCustomers,
} from '@/server/services/customer.service'

const CustomerSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().optional(),
    document: z.string().optional(),
    notes: z.string().optional(),
})

export async function createCustomerAction(prevState: any, formData: FormData) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        return { message: 'Unauthorized' }
    }

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        document: formData.get('document'),
        notes: formData.get('notes'),
    }

    const validatedFields = CustomerSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    let customerId: string | undefined
    try {
        const customer = await createCustomer(
            {
                name: validatedFields.data.name,
                email: validatedFields.data.email || undefined,
                phone: validatedFields.data.phone || undefined,
                document: validatedFields.data.document || undefined,
                notes: validatedFields.data.notes || undefined,
            },
            tenant.id
        )

        revalidatePath('/dashboard/customers')
        customerId = customer.id
    } catch (error) {
        return { message: 'Failed to create customer' }
    }

    if (customerId) {
        redirect(`/dashboard/customers/${customerId}`)
    }
}

export async function updateCustomerAction(
    customerId: string,
    prevState: any,
    formData: FormData
) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        return { message: 'Unauthorized' }
    }

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        document: formData.get('document'),
        notes: formData.get('notes'),
    }

    const validatedFields = CustomerSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        }
    }

    try {
        await updateCustomer(
            customerId,
            {
                name: validatedFields.data.name,
                email: validatedFields.data.email || undefined,
                phone: validatedFields.data.phone || undefined,
                document: validatedFields.data.document || undefined,
                notes: validatedFields.data.notes || undefined,
            },
            tenant.id
        )

        revalidatePath('/dashboard/customers')
        revalidatePath(`/dashboard/customers/${customerId}`)
        return { message: 'Success' }
    } catch (error) {
        return { message: 'Failed to update customer' }
    }
}

export async function deleteCustomerAction(customerId: string) {
    const tenant = await getCurrentTenant()
    if (!tenant) {
        return { message: 'Unauthorized' }
    }

    try {
        await deleteCustomer(customerId, tenant.id)
        revalidatePath('/dashboard/customers')
        redirect('/dashboard/customers')
    } catch (error) {
        return { message: 'Failed to delete customer' }
    }
}

export async function getCustomersAction() {
    const tenant = await getCurrentTenant()
    if (!tenant) return []

    return await getCustomers(tenant.id)
}

export async function getActiveCustomersAction() {
    const tenant = await getCurrentTenant()
    if (!tenant) return []

    return await getActiveCustomers(tenant.id)
}

export async function getCustomerByIdAction(customerId: string) {
    const tenant = await getCurrentTenant()
    if (!tenant) return null

    return await getCustomerById(customerId, tenant.id)
}

export async function getCustomerWithIntegrationsAction(customerId: string) {
    const tenant = await getCurrentTenant()
    if (!tenant) return null

    return await getCustomerWithIntegrations(customerId, tenant.id)
}
