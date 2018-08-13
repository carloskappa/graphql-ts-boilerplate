import * as faker from "faker";
import { createTestConnection } from "../../../utils/createTestConnection";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
import { TestClient } from "../../../utils/TestClient";
import { createForgotPasswordLink } from "./createForgotPasswordLink";
import { forgotPasswordLockAccount } from "./forgotPasswordLockAccount";
import { redis } from "../../../redis";
import { forgotPasswordLockError } from "../login/errorMessages";
import { passwordNotLongEnough } from "../register/errorMessages";
import { invalidKeyError } from "./errorMessages";
faker.seed(Date.now() + 1);
const email = faker.internet.email();
const password = faker.internet.password();
const newPassword = faker.internet.password();
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

describe("forgotPassword", () => {
  it("test functionality", async () => {
    await forgotPasswordLockAccount(userId);

    const client = new TestClient();
    const url = await createForgotPasswordLink("", userId, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];
    const cantLoginResponse = await client.login(email, password);
    expect(cantLoginResponse.data).toEqual({
      login: [
        {
          path: "email",
          message: forgotPasswordLockError
        }
      ]
    });

    const badPasswordResponse = await client.forgotPasswordChange("ad", key);
    expect(badPasswordResponse.data).toEqual({
      forgotPasswordChange: [
        {
          path: "newPassword",
          message: passwordNotLongEnough
        }
      ]
    });
    const successResponse = await client.forgotPasswordChange(newPassword, key);
    expect(successResponse.data).toEqual({
      forgotPasswordChange: null
    });

    const cantUseKeyAnymoreResponse = await client.forgotPasswordChange(
      faker.internet.password(),
      key
    );
    expect(cantUseKeyAnymoreResponse.data).toEqual({
      forgotPasswordChange: [
        {
          path: "key",
          message: invalidKeyError
        }
      ]
    });

    const newLoginResponse = await client.login(email, newPassword);

    expect(newLoginResponse.data).toEqual({
      login: null
    });
  });
});
