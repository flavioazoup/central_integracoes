import { PrismaClient } from '@prisma/client'

async function check() {
    const prisma = new PrismaClient()
    console.log('--- Integration Model Available Fields (Runtime) ---')
    // @ts-ignore
    console.log(Object.keys(prisma.integration?.fields || {}))

    // Try to inspect the dmmf if available
    // @ts-ignore
    const dmmf = prisma._base._dmmf
    const integrationModel = dmmf?.datamodel?.models?.find((m: any) => m.name === 'Integration')
    if (integrationModel) {
        console.log('Fields in DMMF:', integrationModel.fields.map((f: any) => f.name))
    } else {
        console.log('Integration model not found in DMMF')
    }

    process.exit(0)
}

check()
