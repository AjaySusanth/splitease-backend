import { users } from '../../db/schema';
import { InferSelectModel } from 'drizzle-orm';

export const omitPassword = (user: InferSelectModel<typeof users>) => {
  const { password, ...rest } = user;
  return rest;
};
