import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import * as path from "path";
import * as fs from "fs";

import { createORMConnection } from "./utils/createORMConnection";
import { makeExecutableSchema, mergeSchemas } from "graphql-tools";
import { GraphQLSchema } from "graphql";
import * as Redis from "ioredis";
import { User } from "./entity/User";
import { createTestConnection } from "./utils/createTestConnection";
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

  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get("host")}`
    })
  });
  server.express.get("/confirm/:id", async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update({ id: Number(userId) }, { confirmed: true });
      await redis.del(id);
      res.send("ok");
    } else {
      res.send("invalid");
    }
  });
  if (process.env.NODE_ENV === "test") {
    await createTestConnection(true);
  } else {
    await createORMConnection();
  }
  const app = await server.start({
    port: process.env.NODE_ENV === "test " ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");

  return app;
};
