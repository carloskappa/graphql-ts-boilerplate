import { request } from "graphql-request";
import { createTestConnection } from "../../utils/createTestConnection";
import { invalidLogin, confirmEmailError } from "./errorMessages";
import { Connection } from "../../../node_modules/typeorm";
import { User } from "../../entity/User";
const email = "kappa@kappa.com";
const password = "asdahsdhas";

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
    loginMutation(e, p)
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
  await conn.synchronize(true);
  await conn.close();
});

describe("login", () => {
  it("invalid login", async () => {
    await loginExpectError("asd@asd.com", "asdasdasd", invalidLogin);
  });

  it("user not confirmed", async () => {
    const user = await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    expect(user).toEqual({ register: null });
    await loginExpectError(email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });
  });
});
