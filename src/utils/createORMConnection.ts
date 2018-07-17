import { getConnectionOptions, createConnection } from "typeorm";

export const createORMConnection = async () => {
  const name = process.env.NODE_ENV;
  if (name) {
    const connectOptions = await getConnectionOptions(name.slice(0, -1));

    return createConnection({ ...connectOptions, name: "default" });
  } else {
    const connectOptions = await getConnectionOptions();
    return createConnection({ ...connectOptions, name: "default" });
  }
};
