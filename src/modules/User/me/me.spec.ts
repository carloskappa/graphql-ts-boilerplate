import * as faker from "faker";
import { User } from "../../../entity/User";
import { Connection } from "typeorm";
import { createTestConnection } from "../../../utils/createTestConnection";
import { TestClient } from "../../../utils/TestClient";

faker.seed(Date.now() + 1);
const email = faker.internet.email();
const password = faker.internet.email();
let userId: number;
let conn: Connection;

beforeAll(async () => {
  conn = await createTestConnection();

  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});

afterAll(async () => {
  await conn.close();
});

describe("me", () => {
  it("return null if no cookie", async () => {
    const client = new TestClient();
    const meQuery = await client.me();
    expect(meQuery.data.me).toBeNull();
  });

  it("get current user from session", async () => {
    const client = new TestClient();
    await client.login(email, password);
    const responseLogin = await client.me();
    expect(responseLogin.data.me.email).toEqual(email);
    expect(responseLogin.data.me.id).toBe(`${userId}`);
  });
});
