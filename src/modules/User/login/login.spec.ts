import * as faker from "faker";
import { createTestConnection } from "../../../utils/createTestConnection";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";

faker.seed(Date.now() + 1);

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);
  expect(response.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg
      }
    ]
  });
};

let conn: Connection;
beforeAll(async () => {
  conn = await createTestConnection();
});
afterAll(async () => {
  await conn.close();
});

describe("login", () => {
  it("invalid login", async () => {
    const client = new TestClient();

    await loginExpectError(
      client,
      faker.internet.email(),
      faker.internet.password(),
      invalidLogin
    );
  });

  it("user not confirmed", async () => {
    const client = new TestClient();
    const email = faker.internet.email();
    const password = faker.internet.password();
    await client.register(email, password);

    await loginExpectError(client, email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(client, email, "ashdajksdhasjd", invalidLogin);

    const response = await client.login(email, password);
    expect(response.data).toEqual({ login: null });
  });
});
