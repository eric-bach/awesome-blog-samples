/* eslint-disable import/extensions, import/no-absolute-path */
import { createUser } from '/opt/client';
import { v4 as uuidv4 } from 'uuid';

export const handler = async () => {
  const user = await createUser('Alice', `alice-${uuidv4()}.prisma.io`);
  console.log('Created user: ', user);

  return {
    statusCode: 200,
    body: 'Created user',
  };
};
