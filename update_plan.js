const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = '85anurish@gmail.com';
    const updatedUser = await prisma.user.update({
        where: { email: email },
        data: { plan: 'PRO' },
    });
    console.log('Updated User:', updatedUser);
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
