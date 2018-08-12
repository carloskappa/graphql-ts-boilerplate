import * as faker from "faker";
import axios from "axios";
import { User } from "../../../entity/User";
import { createTestConnection } from "../../../utils/createTestConnection";
faker.seed(Date.now() + 1);
const email = faker.internet.email();
const password = faker.internet.email();
let userId: number;
const loginMutation = (e: string, p: string) =>
  `
    mutation {
        login(email: "${e}", password: "${p}") {
          path
          message
          
        }
    }
`;

const meQuery = `
    {
        me {
            id
            email
        }

    }

`;

export const loginAndQueryTest = async () => {
  await axios.post(
    process.env.TEST_HOST as string,
    {
      query: loginMutation(email, password)
    },
    { withCredentials: true }
  );
  const response = await axios.post(
    process.env.TEST_HOST as string,
    {
      query: meQuery
    },
    { withCredentials: true }
  );
  expect(response.data.data.me.email).toEqual(email);
  expect(response.data.data.me.id).toBe(`${userId}`);
};

export const meQueryTest = async () => {
  const response = await axios.post(
    process.env.TEST_HOST as string,
    {
      query: meQuery
    },
    { withCredentials: true }
  );

  expect(response.data.data.me).toBeNull();
};

beforeAll(async () => {
  await createTestConnection();
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save();
  userId = user.id;
});
describe("me", () => {
  it("return null if no cookie", async () => {
    await meQueryTest();
  });

  it("get current user from session", async () => {
    await loginAndQueryTest();
  });
});
