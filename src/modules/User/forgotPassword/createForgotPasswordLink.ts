import { v4 } from "uuid";
import { Redis } from "ioredis";
import { forgotPasswordPrefix } from "../../../constants";
export const createForgotPasswordLink = async (
  url: string, // This is front end url route
  userId: number,
  redis: Redis
) => {
  const id = v4();
  await redis.set(`${forgotPasswordPrefix}${id}`, userId, "ex", 20 * 60);
  return `${url}/change-password/${id}`; // this will be a route in your frontend app
};
