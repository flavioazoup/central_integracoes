import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function getCurrentTenant() {
    const { userId, orgId } = await auth();
    if (!userId) return null;
    const clerkId = orgId || userId;

    let tenant = await prisma.tenant.findUnique({
        where: { clerkId },
    })

    if (!tenant) {
        const user = await currentUser();
        const name = (await auth()).orgId ? 'Organization' : (user?.firstName ? `${user.firstName}'s Store` : 'My Store')

        tenant = await prisma.tenant.create({
            data: {
                clerkId,
                name,
            },
        })
    }

    return tenant
}
