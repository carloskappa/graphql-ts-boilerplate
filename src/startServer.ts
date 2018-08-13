import "reflect-metadata";
import * as connectRedis from "connect-redis";
import { GraphQLServer } from "graphql-yoga";
import { config } from "dotenv";
import * as session from "express-session";
import { createORMConnection } from "./utils/createORMConnection";
import { createTestConnection } from "./utils/createTestConnection";
import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";
import { genSchema } from "./utils/genSchema";
import { redisSessionPrefix } from "./constants";
config(); // starts dotEnv
const RedisStore = connectRedis(session);

export const startServer = async () => {
  if (process.env.NODE_ENV === "test") {
    await redis.flushall();
  }

  const server = new GraphQLServer({
    schema: genSchema() as any,
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`,
      session: request.session,
      req: request
    })
  });

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix
      }),
      name: "qid",
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    } as any)
  );

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === "test" ? "*" : "http://localhost:3000"
  };

  server.express.get("/confirm/:id", confirmEmail);
  if (process.env.NODE_ENV === "test") {
    await createTestConnection(true);
  } else {
    await createORMConnection();
  }
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === "test " ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");

  return app;
};
