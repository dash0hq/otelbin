const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

async function main() {
    // const deleteConfig = await prisma.otelColConfig.deleteMany({})
    const config = await prisma.otelColConfig.create({
        data: {
            name: 'Roshan',
            config: 'test 123',
        },
    })
    console.log(config)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })