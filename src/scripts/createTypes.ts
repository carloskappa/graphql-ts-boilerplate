import { generateNamespace } from "@gql2ts/from-schema";
import * as fs from "fs";
import * as path from "path";
import { genSchema } from "../utils/genSchema";

const typescriptTypes = generateNamespace("GQL", genSchema());
fs.writeFile(
  path.join(__dirname, "../types/index.d.ts"),
  typescriptTypes,
  error => {
    console.log(error);
  }
);
