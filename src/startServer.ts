import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import { resolvers } from "./resolvers";
import * as path from "path";
import { createORMConnection } from "./utils/createORMConnection";

export const startServer = async () => {
  const typeDefs = importSchema(path.join(__dirname, "./schema.graphql"));

  const server = new GraphQLServer({ typeDefs, resolvers });
  await createORMConnection();
  const app = await server.start({
    port: process.env.NODE_ENV === "test " ? 0 : 4000
  });
  console.log("Server is running on localhost:4000");

  return app;
};
