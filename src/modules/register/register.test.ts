import { request } from "graphql-request";
import { User } from "../../entity/User";
import { startServer } from "../../startServer";
import { AddressInfo } from "net";
import {
  duplicateEmail,
  emailNotLongEnough,
  passwordNotLongEnough,
  invalidEmail
} from "./errorMessages";

const email = "kappa@kappa.com";
const password = "asdahsdhas";

const mutation = (e: string, p: string) =>
  `
    mutation {
        register(email: "${e}", password: "${p}") {
          path
          message
        }
    }
`;

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

describe("Register resolver", async () => {
  it("sign up user", async () => {
    const response = await request(getHost(), mutation(email, password));
    expect(response).toEqual({ register: null });

    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });

  it("duplicate user", async () => {
    const response: any = await request(getHost(), mutation(email, password));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    });
  });

  it("bad email", async () => {
    const response: any = await request(getHost(), mutation("b", password));
    expect(response.register).toHaveLength(2);
    expect(response.register[0]).toEqual({
      path: "email",
      message: emailNotLongEnough
    });
  });

  it("bad password", async () => {
    const response: any = await request(getHost(), mutation(email, "b"));
    expect(response.register).toHaveLength(1);
    expect(response.register[0]).toEqual({
      path: "password",
      message: passwordNotLongEnough
    });
  });

  it("bad password, bad email", async () => {
    const response5: any = await request(getHost(), mutation("as", "b"));
    expect(response5.register).toHaveLength(3);
    expect(response5).toEqual({
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
