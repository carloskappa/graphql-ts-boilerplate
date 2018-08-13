import * as faker from "faker";
import { createTestConnection } from "../../../utils/createTestConnection";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";

faker.seed(Date.now() + 1);
const email = faker.internet.email();
const password = faker.internet.password();
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

describe("logout", () => {
  it("multiple sessions", async () => {
    // to-do
    const client1 = new TestClient();
    const client2 = new TestClient();

    await client1.login(email, password);
    await client2.login(email, password);
    expect(await client1.me()).toEqual(await client2.me());
    await client1.logout();
    expect(await client1.me()).toEqual(await client2.me());
  });

  it("single session", async () => {
    const client = new TestClient();
    await client.login(email, password);
    const responseLogin = await client.me();
    expect(responseLogin.data.me.email).toEqual(email);
    expect(responseLogin.data.me.id).toBe(`${userId}`);

    await client.logout();
    const meQuery = await client.me();
    expect(meQuery.data.me).toBeNull();
  });
});
