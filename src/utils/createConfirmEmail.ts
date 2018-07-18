import { v4 } from "uuid";
import { Redis } from "ioredis";

export const createConfirmEmail = async (
  url: string,
  userId: number,
  redis: Redis
) => {
  const id = v4();
  await redis.set(id, userId, "expiresIn", 24 * 60 * 60);
  return `${url}/confirm/${id}`;
};
