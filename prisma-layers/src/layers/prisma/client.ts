import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://janedoe:mypassword@localhost:5432/mydb?schema=sample',
    },
  },
});

export async function createUser(name: string, email: string) {
  await prisma.user.create({
    data: {
      name,
      email,
    },
  });

  return await prisma.user.findMany({});
}
