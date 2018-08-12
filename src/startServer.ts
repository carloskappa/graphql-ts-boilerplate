config();
import * as connectRedis from "connect-redis";
import * as path from "path";
import * as fs from "fs";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import { config } from "dotenv";
import * as session from "express-session";
import { createORMConnection } from "./utils/createORMConnection";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import { createTestConnection } from "./utils/createTestConnection";
import { redis } from "./redis";
import { confirmEmail } from "./routes/confirmEmail";

const RedisStore = connectRedis(session);
export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`,
      session: request.session
    })
  });

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any
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
    origin: "http://localhost:3000"
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
