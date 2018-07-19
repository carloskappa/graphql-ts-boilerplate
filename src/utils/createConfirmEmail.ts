import { v4 } from "uuid";
import { Redis } from "ioredis";

export const createConfirmEmail = async (
  url: string,
  userId: number,
  redis: Redis
) => {
  const id = v4();
  console.log(id);
  await redis.set(id, userId, "ex", 24 * 60 * 60);
  return `${url}/confirm/${id}`;
};
