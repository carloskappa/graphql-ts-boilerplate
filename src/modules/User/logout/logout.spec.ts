import * as faker from "faker";
import axios from "axios";
import { createTestConnection } from "../../../utils/createTestConnection";
import { Connection } from "typeorm";
import { User } from "../../../entity/User";
faker.seed(Date.now() + 1);

const email = faker.internet.email();
const password = faker.internet.password();
let userId: number;
const meQuery = `
    {
        me {
            id
            email
        }

    }

`;

const logoutMutation = `
    mutation {
      logout
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
  it("get current user", async () => {
    await loginAndQueryTest();

    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation
      },
      { withCredentials: true }
    );

    await meQueryTest();
  });
});
