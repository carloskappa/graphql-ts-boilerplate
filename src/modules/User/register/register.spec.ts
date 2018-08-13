import * as faker from "faker";
import { User } from "../../../entity/User";
import {
  duplicateEmail,
  emailNotLongEnough,
  passwordNotLongEnough,
  invalidEmail
} from "./errorMessages";
import { createTestConnection } from "../../../utils/createTestConnection";
import { Connection } from "typeorm";
import { TestClient } from "../../../utils/TestClient";

faker.seed(Date.now() + 1);

const email = faker.internet.email();
const password = faker.internet.password();

let conn: Connection;
beforeAll(async () => {
  conn = await createTestConnection();
});
afterAll(async () => {
  await conn.close();
});

describe("Register user", async () => {
  it("check for duplicate emails", async () => {
    const client = new TestClient();
    const responseRegister = await client.register(email, password);
    expect(responseRegister.data).toEqual({ register: null });
    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    const responseRegister2 = await client.register(email, password);
    expect(responseRegister2.data.register).toHaveLength(1);
    expect(responseRegister2.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  it("check bad email", async () => {
    const client = new TestClient();
    const responseRegister = await client.register("b", password);
    expect(responseRegister.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        }
      ]
    });
  });

  it("check bad password", async () => {
    const client = new TestClient();
    const responseRegister = await client.register(email, "ad");
    expect(responseRegister.data).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });

  it("check bad password and bad email", async () => {
    const client = new TestClient();
    const responseRegister = await client.register("df", "ad");
    expect(responseRegister.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        },
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    });
  });
});
