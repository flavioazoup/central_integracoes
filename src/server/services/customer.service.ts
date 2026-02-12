import { prisma } from '@/lib/prisma'
import type { Customer } from '@prisma/client'

export interface CreateCustomerData {
    name: string
    email?: string
    phone?: string
    document?: string
    notes?: string
}

export interface UpdateCustomerData {
    name?: string
    email?: string
    phone?: string
    document?: string
    notes?: string
    isActive?: boolean
}

/**
 * Get all customers for a tenant
 */
export async function getCustomers(tenantId: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
    })
}

/**
 * Get active customers for a tenant
 */
export async function getActiveCustomers(tenantId: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
        where: {
            tenantId,
            isActive: true,
        },
        orderBy: { name: 'asc' },
    })
}

/**
 * Get a single customer by ID with tenant validation
 */
export async function getCustomerById(
    customerId: string,
    tenantId: string
): Promise<Customer | null> {
    return await prisma.customer.findFirst({
        where: {
            id: customerId,
            tenantId,
        },
    })
}

/**
 * Get customer with integrations
 */
export async function getCustomerWithIntegrations(
    customerId: string,
    tenantId: string
) {
    return await prisma.customer.findFirst({
        where: {
            id: customerId,
            tenantId,
        },
        include: {
            integrations: {
                orderBy: { createdAt: 'desc' },
            },
            _count: {
                select: {
                    products: true,
                    orders: true,
                },
            },
        },
    })
}

/**
 * Create a new customer
 */
export async function createCustomer(
    data: CreateCustomerData,
    tenantId: string
): Promise<Customer> {
    return await prisma.customer.create({
        data: {
            ...data,
            tenantId,
        },
    })
}

/**
 * Update a customer
 */
export async function updateCustomer(
    customerId: string,
    data: UpdateCustomerData,
    tenantId: string
): Promise<Customer> {
    // First verify the customer belongs to this tenant
    const customer = await getCustomerById(customerId, tenantId)
    if (!customer) {
        throw new Error('Customer not found or access denied')
    }

    return await prisma.customer.update({
        where: { id: customerId },
        data,
    })
}

/**
 * Delete a customer (hard delete)
 * Note: This will cascade delete all integrations, products, and orders
 */
export async function deleteCustomer(
    customerId: string,
    tenantId: string
): Promise<void> {
    // First verify the customer belongs to this tenant
    const customer = await getCustomerById(customerId, tenantId)
    if (!customer) {
        throw new Error('Customer not found or access denied')
    }

    await prisma.customer.delete({
        where: { id: customerId },
    })
}

/**
 * Soft delete a customer (set isActive to false)
 */
export async function deactivateCustomer(
    customerId: string,
    tenantId: string
): Promise<Customer> {
    return await updateCustomer(customerId, { isActive: false }, tenantId)
}

/**
 * Reactivate a customer
 */
export async function activateCustomer(
    customerId: string,
    tenantId: string
): Promise<Customer> {
    return await updateCustomer(customerId, { isActive: true }, tenantId)
}
