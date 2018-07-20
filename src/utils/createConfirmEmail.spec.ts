import * as Redis from "ioredis";
import fetch from "node-fetch";
import { User } from "../entity/User";
import { createConfirmEmail } from "./createConfirmEmail";
import { createTestConnection } from "./createTestConnection";

let userId: number;
const redis = new Redis();
beforeAll(async () => {
  await createTestConnection();
  const user = await User.create({
    email: "kappa@kappa.com",
    password: "asdasdajsd"
  }).save();
  userId = user.id;
});

test("Make sure it confirm user and clears key value in redis", async () => {
  const link = await createConfirmEmail(
    process.env.TEST_HOST as string,
    userId,
    redis
  );
  const response = await fetch(link);
  const text = await response.text();
  expect(text).toEqual("ok");
  const user = await User.findOne({ where: { id: userId } });
  expect((user as User).confirmed).toBeTruthy();
  const chunks = link.split("/");
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
