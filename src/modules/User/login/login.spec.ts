import * as faker from "faker";
import { request } from "graphql-request";
import { createTestConnection } from "../../../utils/createTestConnection";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";

faker.seed(Date.now() + 1);

const registerMutation = (e: string, p: string) =>
  `
    mutation {
        register(email: "${e}", password: "${p}") {
          path
          message
        }
    }
`;
const loginMutation = (e: string, p: string) =>
  `
    mutation {
        login(email: "${e}", password: "${p}") {
          path
          message
          
        }
    }
`;

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, e)
  );

  expect(response).toEqual({
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
    await loginExpectError(
      faker.internet.email(),
      faker.internet.password(),
      invalidLogin
    );
  });

  it("user not confirmed", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const user = await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    expect(user).toEqual({ register: null });
    await loginExpectError(email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });
  });
});
